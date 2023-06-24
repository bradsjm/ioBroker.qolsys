import { EventEmitter } from "events";
import { clearInterval } from "timers";
import { generateNonce } from "./utils";
import * as tls from "tls";
import { ActionType, AlarmType, ArmingStateType, InfoType } from "../enums";
import { PayloadJson } from "../interfaces";

const RECONNECT_INTERVAL = 5000; // Initial reconnect interval (5 seconds)
const MAX_RECONNECT_INTERVAL = 60000; // Maximum reconnect interval (60 seconds)
const PING_INTERVAL = 30000; // Ping interval (30 seconds)

/**
 * Qolsys Panel Network Client.
 */
export class QolsysPanelClient extends EventEmitter {
    private buffer = "";
    private client?: tls.TLSSocket;
    private config: ioBroker.AdapterConfig;
    private log: ioBroker.Logger;
    private pingTimer?: NodeJS.Timeout;
    private reconnectInterval = RECONNECT_INTERVAL;
    private reconnectTimer?: NodeJS.Timeout;

    /**
     * Qolsys Panel Client constructor.
     *
     * @param logger the ioBroker logger
     * @param config the ioBroker configuration
     */
    constructor(logger: ioBroker.Logger, config: ioBroker.AdapterConfig) {
        super({ captureRejections: true });
        this.config = config;
        this.log = logger;
    }

    private _autoReconnect = true;

    /**
     * Get whether auto-reconnect is enabled (default is true).
     */
    public get autoReconnect(): boolean {
        return this._autoReconnect;
    }

    /**
     * Set whether auto-reconnect is enabled (default is true).
     * @param value true to enable auto-reconnect
     */
    public set autoReconnect(value: boolean) {
        this._autoReconnect = value;
        if (!value) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = undefined;
        }
    }

    /**
     * Returns whether the panel is connected.
     *
     * @return {boolean} true if the panel is connected, false otherwise
     */
    public get isConnected(): boolean {
        return this.client?.readyState === "open";
    }

    /**
     * Arm the panel in away mode.
     * @param partitionId The partition ID
     * @param delay The delay in seconds (0 for immediate)
     */
    public async armAway(partitionId: number, delay?: number): Promise<void> {
        if (!this.config.enableArming) {
            this.emit("error", new Error("arming is not enabled in this adapter configuration"));
            return;
        }

        const json: PayloadJson = {
            "action": ActionType.ARMING,
            "arming_type": ArmingStateType.ARM_AWAY,
            "nonce": generateNonce(),
            "partition_id": partitionId,
            "source": "C4",
            "token": this.config.secureToken,
            "version": 1
        };
        if (delay != null) {
            json["delay"] = delay;
        }
        await this.send(json);
    }

    /**
     * Arm the panel in stay mode.
     * @param partitionId The partition ID
     */
    public async armStay(partitionId: number): Promise<void> {
        if (!this.config.enableArming) {
            this.emit("error", new Error("arming is not enabled in this adapter configuration"));
            return;
        }

        const json: PayloadJson = {
            "action": ActionType.ARMING,
            "arming_type": ArmingStateType.ARM_STAY,
            "nonce": generateNonce(),
            "partition_id": partitionId,
            "source": "C4",
            "token": this.config.secureToken,
            "version": 1
        };
        await this.send(json);
    }

    /**
     * Connects to the Qolsys panel.
     *
     * @emits ack - Acknowledgement from panel after command is received
     * @emits data - Event payload from panel
     * @emits close - When the panel connection is closed with a boolean hasError value
     * @emits connect - When the panel has connected
     * @emits error - Emits an event with a string describing the error
     * @emits timeout - Emits an event when the inactivity timeout is reached
     */
    public connect(): void {
        if (this.client) {
            this.disconnect();
        }

        this.log.info(`connecting to the panel at ${this.config.host}:${this.config.port}`);
        this.client = tls.connect(this.config.port, this.config.host, {
            rejectUnauthorized: false
        });

        // Set encoding to UTF-8
        this.client.setEncoding("utf8");

        // Disable Nagle algorithm
        this.client.setNoDelay();

        // Socket event handlers
        this.client.on("close", this.onClose.bind(this));
        this.client.on("connect", this.onConnect.bind(this));
        this.client.on("data", this.onData.bind(this));
        this.client.on("error", (err) => this.emit("error", err));
    }

    /**
     * Disarm the panel partition.
     * @param partitionId The ID of the partition
     * @param userPinCode The user pin code (defaults to the configuration userPinCode)
     */
    public async disarm(partitionId: number, userPinCode: string = this.config.userPinCode): Promise<void> {
        if (!this.config.enableDisarming) {
            this.emit("error", new Error("disarming is not enabled in this adapter configuration"));
            return;
        }

        await this.send({
            "action": ActionType.ARMING,
            "arming_type": ArmingStateType.DISARM,
            "usercode": userPinCode,
            "nonce": generateNonce(),
            "partition_id": partitionId,
            "source": "C4",
            "token": this.config.secureToken,
            "version": 1
        });
    }

    /**
     * Disconnects from the Qolsys panel.
     * This will generate a close event.
     */
    public disconnect(): void {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = undefined;
        this.buffer = "";
        if (this.client) {
            this.client.destroy();
            this.client = undefined;
        }
    }

    /**
     * Requests panel summary.
     */
    public async requestSummary(): Promise<void> {
        await this.send({
            "action": ActionType.INFO,
            "info_type": InfoType.SUMMARY,
            "nonce": generateNonce(),
            "source": "C4",
            "token": this.config.secureToken,
            "version": 1
        });
    }

    /**
     * Trigger the specified panel alarm.
     * @param partitionId The partition ID
     * @param alarmType The alarm type {@link AlarmType}
     */
    public async trigger(partitionId: number, alarmType: AlarmType): Promise<void> {
        if (!this.config.enableAlarms) {
            this.emit("error", new Error("alarms are not enabled in this adapter configuration"));
            return;
        }

        await this.send({
            "action": ActionType.ALARM,
            "alarm_type": alarmType,
            "nonce": generateNonce(),
            "partition_id": partitionId,
            "source": "C4",
            "token": this.config.secureToken,
            "version": 1
        });
    }

    /**
     * Invoked upon socket close.
     * @param hadError whether the close was due to an error
     */
    private onClose(hadError: boolean): void {
        this.log.info(`disconnected from the panel (hadError: ${hadError})`);
        this.emit("close", hadError);
        clearInterval(this.pingTimer);
        this.pingTimer = undefined;
        this.scheduleReconnect();
    }

    /**
     * Invoked upon successful connection to the panel.
     */
    private onConnect(): void {
        this.log.info("connected to the panel");

        // Reset buffer
        this.buffer = "";

        // Connection successful, cancel reconnect and reset delay
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = undefined;
        this.reconnectInterval = RECONNECT_INTERVAL;

        // Set keep-alive timer
        this.pingTimer = setInterval(this.ping.bind(this), PING_INTERVAL);

        // Emit connected event
        this.emit("connect");
    }

    /**
     * Invoked when socket receives data.
     */
    private onData(data: string): void {
        this.buffer = this.parse(this.buffer + data);
    }

    /**
     * Parses a buffer string, extracting and handling each line as a separate event.
     * Recognizes "ACK" acknowledgement lines and parses other lines as JSON objects representing event payloads.
     * Remaining buffer after parsing all complete lines is returned.
     *
     * @param {string} buffer - A string containing one or more newline-separated lines to be parsed.
     *
     * @emits ack - Acknowledgement from panel
     * @emits data - Event payload from panel
     * @emits error - Error from panel
     *
     * @return {string} A string containing the remaining buffer (if any).
     */
    private parse(buffer: string): string {
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            // Extract next line and remove from buffer
            const line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            // Command acknowledged
            if (line === "ACK") {
                this.log.debug("received ACK");
                this.emit("ack");
                continue;
            }

            // Parse and handle the JSON object
            this.log.debug("received: " + line);
            try {
                const payload: PayloadJson = JSON.parse(line);
                this.emit("data", payload);
            } catch (err: any) {
                if (err instanceof SyntaxError) {
                    this.emit("error", new Error(`failed to parse JSON (${err.message}): ${line}`));
                }
            }
        }
        return buffer;
    }

    /**
     * Sends a no-op command to the panel in expectation of an ACK response.
     */
    private ping(): void {
        if (!this.isConnected) {
            this.disconnect();
            return;
        }
        this.log.debug(`sending ping`);
        this.client?.write("\n");
    }

    /**
     * Schedules a reconnect attempt to the panel.
     * If a reconnect attempt is not already in progress, a reconnect attempt will be scheduled after a delay.
     * The delay period doubles with each subsequent attempt up to a maximum of 60 seconds.
     */
    private scheduleReconnect(): void {
        if (!this._autoReconnect) return;

        // Don't schedule reconnect if we're already trying to reconnect
        if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
                // Double the reconnect delay for the next attempt, up to a maximum
                this.reconnectInterval = Math.min(this.reconnectInterval * 2, MAX_RECONNECT_INTERVAL);
                this.reconnectTimer = undefined;
                this.connect();
            }, this.reconnectInterval);

            this.log.info(`reconnecting to the panel in ${this.reconnectInterval / 1000} seconds`);
        }
    }

    /**
     * Send the specified JSON object to the client.
     *
     * @param data The JSON object to write
     * @returns A promise that resolves when the write operation is successful or rejects if there's an error
     */
    private async send(data: PayloadJson): Promise<void> {
        const { client } = this;
        if (!client) return;

        return new Promise((resolve, reject) => {
            const str = JSON.stringify(data);
            this.log.debug(`sending: ${str}`);
            client.write(str + "\n", "utf8", (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

/**
 * ACTION_KEY = ‘action’
 * ALARM_TYPE_KEY = ‘alarm_type’
 * ARMING_TYPE_KEY = ‘arming_type’
 * BYPASS_KEY = ‘bypass’
 * DELAY_KEY = ‘delay’
 * DESCRIPTION_KEY = ‘description’
 * ENTRY_DELAY_KEY = ‘entry_delay’
 * ERROR_TYPE_KEY = ‘error_type’
 * EVENT_KEY = ‘event’
 * EXIT_DELAY_KEY = ‘exit_delay’
 * ID_KEY = ‘id’
 * INFO_TYPE_KEY = ‘info_type’
 * NONCE_KEY = ‘nonce’
 * PARTITION_KEY = ‘partition_id’
 * PARTITION_LIST_KEY = ‘partition_list’
 * PARTITION_STATUS_KEY = ‘status’
 * SCOPE_KEY = ‘scope’
 * SECURE_ARM_KEY = ‘secure_arm’
 * SOURCE_KEY = ‘source’
 * TOKEN_KEY = ‘token’
 * USERCODE_KEY = ‘usercode’
 * VALUE_KEY = ‘value’
 * VERSION_KEY = ‘version’
 * ZONE_EVENT_TYPE_KEY = ‘zone_event_type’
 * ZONE_ID_KEY = ‘zone_id’
 * ZONE_KEY = ‘zone’
 * ZONE_LIST_KEY = ‘zone_list’
 * ZONE_NAME_KEY = ‘name’
 * ZONE_STATUS_KEY = ‘status’
 * ZONE_TYPE_KEY = ‘zone_type’
 *
 * ALARM_VAL = ‘ALARM’
 * ARMING_VAL = ‘ARMING’
 * ARM_AWAY_VAL = ‘ARM_AWAY’
 * ARM_STAY_VAL = ‘ARM_STAY’
 * AUX_VAL = ‘AUXILIARY’
 * DISARM_VAL = ‘DISARM’
 * FIRE_VAL = ‘FIRE’
 * INFO_VAL = ‘INFO’
 * POLICE_VAL = ‘POLICE’
 * SUMMARY_VAL = ‘SUMMARY’
 * ZONE_ACTIVATED_VAL = ‘Activated’
 * ZONE_ACTIVE_VAL = ‘Active’
 * ZONE_CLOSED_VAL = ‘Closed’
 * ZONE_EVENT_VAL = ‘ZONE_EVENT’
 * ZONE_IDLE_VAL = ‘Idle’
 * ZONE_NORMAL_VAL = ‘Normal’
 * ZONE_OPEN_VAL = ‘Open’
 */
