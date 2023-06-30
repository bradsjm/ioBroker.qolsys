import * as utils from "@iobroker/adapter-core";
import { AlarmType, ArmingStateType } from "./enums";
import { AlarmJson, ArmingJson, ErrorJson, PartitionJson, ZoneJson } from "./interfaces";
import { QolsysEventParser } from "./lib/qolsys-event-parser";
import { QolsysPanelClient } from "./lib/qolsys-panel-client";
import { convertToTitleCase, getPath, getZoneRole } from "./lib/utils";
import { LanguagePack } from "./lib/language-pack";
import { EventEmitter } from "events";

/**
 * Qolsys IQ Panel adapter.
 */
class QolsysPanel extends utils.Adapter {
    private eventParser?: QolsysEventParser;
    private panel?: QolsysPanelClient;

    /**
     * The constructor function is called when the adapter instance is created.
     *
     * @param options: Adapter options
     *
     * @return An instance of the class
     */
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: "qolsys",
        });
        EventEmitter.captureRejections = true;
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * The OnPanelError function is called when the panel has an error.
     *
     * @param error: ErrorJson {ErrorJson} The panel error.
     */
    private async OnPanelError(error: ErrorJson): Promise<void> {
        const errorType = convertToTitleCase(error.error_type.toLowerCase())
        const value = (`${errorType}: ${error.description} (Partition ${error.partition_id + 1}) `);
        this.log.error(value);
        await this.setStateChangedAsync("panel.lastError", { val: value, ack: true });
    }

    /**
     * The createPartitionObjects function creates the following objects for each partition:
     * - Channel &quot;panel&quot; with name of partition
     * - State &quot;command&quot; with role value and writeable, defaulting to NOP (no operation)
     * - State &quot;alarmState&quot; with role indicator.alarm and read-only, defaulting to NONE (no alarm)
     * - State &quot;armDelay&quot; with role value.interval and read/write, defaulting to 60 seconds
     *   (the time between arming a panel in Away mode and when it becomes armed)
     *
     * @param id: {string} Object Identifier
     * @param partition: {PartitionJson} Create the states for the partition
     */
    private async createPartitionObjects(id: string, partition: PartitionJson): Promise<void> {
        await this.createChannelAsync("panel", id, { name: partition.name });
        await this.createStateAsync("panel", id, "command", {
            name: LanguagePack.PanelCommand,
            desc: LanguagePack.PanelCommandDescription,
            type: "string",
            states: {
                "ARM_AWAY": "Arm Away",
                "ARM_AWAY_INSTANT": "Arm Away (Instant)",
                "ARM_STAY": "Arm Stay",
                "DISARM": "Disarm",
                "AUXILIARY": "Auxiliary Alarm",
                "FIRE": "Fire Alarm",
                "POLICE": "Police Alarm",
                "NOP": "None"
            },
            role: "value",
            read: false,
            write: true,
            def: "NOP"
        }, { partition_id: partition.partition_id });

        await this.createStateAsync("panel", id, "alarmState", {
            name: LanguagePack.LastAlarmState,
            desc: LanguagePack.LastAlarmStateDescription,
            type: "string",
            states: {
                "AUXILIARY": "Auxiliary",
                "FIRE": "Fire",
                "POLICE": "Police",
                "NONE": "None"
            },
            role: "indicator.alarm",
            read: true,
            write: false,
            def: "NONE"
        });

        await this.createStateAsync("panel", id, "armDelay", {
            name: LanguagePack.ArmingDelay,
            desc: LanguagePack.ArmingDelayDescription,
            type: "number",
            min: 0,
            unit: "sec",
            role: "value.interval",
            read: true,
            write: true,
            def: 60
        });

        await this.createStateAsync("panel", id, "armState", {
            name: LanguagePack.ArmState,
            desc: LanguagePack.ArmStateDescription,
            type: "string",
            states: {
                "ARM-AWAY-EXIT-DELAY": "Exit Delay (Away)",
                "ARM-AWAY-ENTRY-DELAY": "Entry Delay (Away)",
                "ENTRY_DELAY": "Entry Delay",
                "EXIT_DELAY": "Exit Delay",
                "DISARM": "Disarmed",
                "ARM_STAY": "Armed Stay",
                "ARM_AWAY": "Armed Away"
            },
            role: "state",
            read: true,
            write: false,
            def: "DISARM"
        }, { partition_id: partition.partition_id });

        await this.createStateAsync("panel", id, "secureArm", {
            name: LanguagePack.RequirePin,
            desc: LanguagePack.RequirePinDescription,
            type: "boolean",
            role: "state",
            states: {
                "true": "Enabled",
                "false": "Disabled"
            },
            read: true,
            write: false,
            def: false
        });

        // Subscribe to changes of panel partition command
        await this.subscribeStatesAsync(getPath("panel", id, "command"));
    }

    /**
     * The createZoneObjects function creates the zone objects for each zone in the system.
     *
     * @param zone: {ZoneJson} Zone object to create
     * @param role: {string} The role of the object
     */
    private async createZoneObjects(zone: ZoneJson, role: string): Promise<void> {
        const zoneTypeTitle = `${convertToTitleCase(zone.type)} (${zone.group})`;
        await this.setObjectAsync(`zones.${zone.id}`, {
            type: "state",
            common: {
                name: zone.name,
                desc: zoneTypeTitle,
                type: "boolean",
                states: {
                    "true": "Open",
                    "false": "Closed"
                },
                role: role,
                read: true,
                write: false,
                def: false
            },
            native: {
                group: zone.group,
                partition_id: zone.partition_id,
                zone_alarm_type: zone.zone_alarm_type,
                zone_id: zone.zone_id,
                zone_physical_type: zone.zone_physical_type
            }
        });
    }

    /**
     * The getPartitionArmState function returns the armState of a partition.
     *
     * @param partition_id: {number} The partition to query
     *
     * @return {string|undefined} The arm state of the partition
     */
    private async getPartitionArmState(partition_id: number): Promise<string | undefined> {
        const id = `partition${partition_id + 1}`;
        const armStateId = getPath("panel", id, "armState");
        const armState = await this.getStateAsync(armStateId);
        return typeof armState?.val === "string" ? armState?.val : undefined;
    }

    /**
     * The getPartitionarmDelay function returns the arm delay for a given partition.
     *
     * @param partition_id: {number} The partition to query
     *
     * @return {number|undefined} The arm delay of the partition
     */
    private async getPartitionarmDelay(partition_id: number): Promise<number | undefined> {
        const id = `partition${partition_id + 1}`;
        const delayId = getPath("panel", id, "armDelay");
        const delayState = await this.getStateAsync(delayId);
        return typeof delayState?.val === "number" ? delayState?.val : undefined;
    }

    /**
     * The onAlarm function is called when the alarm state of a partition changes.
     * It updates the corresponding ioBroker state with the new alarm type.
     *
     * @param alarm: AlarmJson Get the partition_id of the alarm
     */
    private async onAlarm(alarm: AlarmJson): Promise<void> {
        const id = `partition${alarm.partition_id + 1}`;
        this.log.info(`triggering ${alarm.alarm_type} alarm on ${id}`);
        await this.setStateChangedAsync(getPath("panel", id, "alarmState"), {
            val: alarm.alarm_type ?? "NONE", ack: true
        });
    }

    /**
     * The onArmingChange function is called when the arming state of a partition changes.
     * It updates the armState and armDelay states for that partition.
     *
     * @param arming: {ArmingJson} Get the arming state of the partition
     */
    private async onArmingChange(arming: ArmingJson): Promise<void> {
        const id = `partition${arming.partition_id + 1}`;
        this.log.info(`arming state now ${arming.arming_type} on ${id} (delay: ${arming.delay ?? "n/a"})`);
        await this.setStateChangedAsync(getPath("panel", id, "armState"), {
            val: arming.arming_type, ack: true
        });
        if (arming.delay != null) {
            await this.setStateChangedAsync(getPath("panel", id, "armDelay"), {
                val: arming.delay, ack: true
            });
        }

    }

    /**
     * The onCommand function is called when a command is received from ioBroker
     *
     * @param partition_id: {number} Determine which partition to arm or disarm
     * @param value: {string} Determine what action to take
     */
    private async onCommand(partition_id: number, value: string): Promise<void> {
        const panel = this.panel;
        if (!panel) {
            return;
        }

        const armState = await this.getPartitionArmState(partition_id);

        // If the panel is already armed it must be disarmed first
        if (value !== ArmingStateType.DISARM && armState !== ArmingStateType.DISARM) {
            this.log.info(`disarming partition ${partition_id + 1} prior to arming`);
            await panel.disarm(partition_id, this.config.userPinCode);
        }

        switch (value) {
            case "ARM_AWAY_INSTANT":
                this.log.info(`arming away partition ${partition_id + 1} with no delay`);
                await panel.armAway(partition_id, 0);
                break;

            case ArmingStateType.ARM_AWAY:
                const delay = await this.getPartitionarmDelay(partition_id);
                this.log.info(`arming away partition ${partition_id + 1} with delay ${delay}`);
                await panel.armAway(partition_id, delay);
                break;

            case ArmingStateType.ARM_STAY:
                this.log.info(`arming stay partition ${partition_id + 1}`);
                await panel.armStay(partition_id);
                break;

            case ArmingStateType.DISARM:
                this.log.info(`disarming partition ${partition_id + 1}`);
                await panel.disarm(partition_id);
                break;

            case AlarmType.FIRE:
            case AlarmType.POLICE:
            case AlarmType.AUX:
                await panel.trigger(partition_id, value);
                break;

            default:
                this.log.warn(`unknown command ${value} on partition ${partition_id + 1}`);
                break;
        }
    }

    /**
     * The onPanelConnect function is called when the panel connects.
     * It sets the online status of this adapter to true and requests a summary from
     * the panel.
     */
    private async onPanelConnect(): Promise<void> {
        await this.setOnlineStatus(true);
        await this.panel?.requestSummary();
    }

    /**
     * The onPanelDisconnect function is called when the panel is disconnected.
     * This function sets the online status to false.
     */
    private async onPanelDisconnect(): Promise<void> {
        await this.setOnlineStatus(false);
    }

    /**
     * The onPanelError function is called when the panel encounters an error.
     * It logs and sets the lastError status to the error.
     *
     * @param error: Error {Error} to log
     */
    private async onPanelError(error: Error): Promise<void> {
        this.log.error(error.message);
        await this.setStateChangedAsync("panel.lastError", { val: error.message, ack: true });
    }

    /**
     * The onReady function is called when the adapter instance has been successfully created.
     * It is used to initialize the adapter instance (e.g., variables, functions, states).
     */
    private async onReady(): Promise<void> {
        // Reset the connection indicator to false
        await this.setOnlineStatus(false);

        // Check if the settings are configured
        if (!this.config.host || !this.config.port || !this.config.secureToken) {
            this.log.error("please set host, port and secure token in the instance settings");
            return
        }

        // Create event parser
        this.eventParser = new QolsysEventParser(this.log);
        this.eventParser.on("arming", this.onArmingChange.bind(this));
        this.eventParser.on("alarm", this.onAlarm.bind(this));
        this.eventParser.on("error", this.OnPanelError.bind(this));
        this.eventParser.on("partition", this.onReceivePartition.bind(this));
        this.eventParser.on("secureArm", this.onSecureArmChange.bind(this));
        this.eventParser.on("zone", this.onReceivedZone.bind(this));

        // Create client
        this.panel = new QolsysPanelClient(this.log, this.config);
        this.panel.on("close", this.onPanelDisconnect.bind(this));
        this.panel.on("connect", this.onPanelConnect.bind(this));
        this.panel.on("data", this.eventParser.parseEventPayload.bind(this.eventParser));
        this.panel.on("error", this.log.error.bind(this));

        // Start connection to the panel
        this.panel.connect();
    }

    /**
     * The onReceivePartition function is called when the partition object receives a new partition from the alarm panel.
     * It creates all of the objects for that partition, and then calls onArmingChange and onSecureArmChange to update
     * those values.  The id variable is used to create unique names for each object in ioBroker.  For example, if you have
     * two partitions in your alarm system, they will be named &quot;partition2&quot; and &quot;partition3&quot;.  This function also logs a debug message with information about which partition was received by ioBroker.
     *
     * @param partition: {PartitionJson} Partition to create objects for.
     */
    private async onReceivePartition(partition: PartitionJson): Promise<void> {
        this.log.debug(`received partition #${partition.partition_id} (${partition.name})`);
        const id = `partition${partition.partition_id + 1}`;
        await this.createPartitionObjects(id, partition);
        await this.onArmingChange({ partition_id: partition.partition_id, arming_type: partition.status });
        await this.onSecureArmChange(partition);
    }

    /**
     * The onReceivedZone function is called when a zone state change event is received from the panel.
     * It updates the state of the zone in ioBroker and also updates the partition fault state if necessary.
     *
     * @param zone: {ZoneJson} The zone object from the panel.
     * @param event: {string} The operation (update, add, delete)
     */
    private async onReceivedZone(zone: ZoneJson, event: string): Promise<void> {
        const role = getZoneRole(zone);
        if (!role) {
            return
        }

        const stateId = `zones.${zone.id}`;

        // Handle delete operations
        if (event === "delete") {
            this.log.info(`removing zone ${zone.id} (${zone.name})`);
            await this.deleteStateAsync(stateId);
            return
        }

        // Create or update zone object
        await this.createZoneObjects(zone, role);
        this.log.debug(`setting zone #${zone.zone_id} (${zone.name}) to ${zone.status}`);

        // Set the zone state
        const isOpen = zone.status === "Open";
        await this.setStateChangedAsync(stateId, { val: isOpen, ack: true });

        // Update the partition secure state
        await this.updatePartitionFaultState(zone.partition_id);
    }


    /**
     * The onSecureArmChange function is called when the secure arm state of a partition changes.
     * It updates the corresponding Secure Arm state object in ioBroker with the new value.
     *
     * @param partition: {PartitionJson} The partition object from the panel.
     */
    private async onSecureArmChange(partition: PartitionJson): Promise<void> {
        const id = `partition${partition.partition_id + 1}`;
        const secureArmId = getPath("panel", id, "secureArm");
        await this.setStateChangedAsync(secureArmId, { val: partition.secure_arm, ack: true });
    }

    /**
     * Invoked when a subscribed state changes.
     *
     * @param {string} id - The ID of the state change.
     * @param {ioBroker.State | null | undefined} state - The state that is changing.
     */
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        // Early return if the conditions are not met
        if (!state || state.ack || !this.panel || state.val == null) return;

        // Get which partition id is associated with the received command object
        const object = await this.getForeignObjectAsync(id);
        const partition_id = object?.native.partition_id;

        if (typeof partition_id === "number" && typeof state.val === "string") {
            this.log.debug(`received command ${state.val} for partition ${partition_id}`);
            await this.onCommand(partition_id, state.val);
        }
    }

    /**
     * The onUnload function is called when the adapter is deactivated.
     * It removes all listeners and disconnects from the panel.
     *
     * @param callback: () Tell the adapter that it is safe to shut down
     */
    private onUnload(callback: () => void): void {
        try {
            this.eventParser?.removeAllListeners();
            if (this.panel) {
                this.panel.autoReconnect = false;
                this.panel.removeAllListeners();
                this.panel.disconnect();
            }
        } finally {
            this.log.info("shutting down");
            callback();
        }
    }

    /**
     * The setOnlineStatus function sets the online status of the adapter.
     *
     * @param online: boolean Set the state of the adapter to true or false
     */
    private async setOnlineStatus(online: boolean): Promise<void> {
        await this.setStateAsync("info.connection", { val: online, ack: true });
    }

    /**
     * The updatePartitionFaultState function updates the state of a partition's faulted status.
     *
     * @param partitionId: {number} Identify which partition is being updated
     */
    private async updatePartitionFaultState(partitionId: number): Promise<void> {
        await this.createStateAsync("panel", `partition${partitionId + 1}`, "isFaulted", {
            name: {
                "en": "Is Faulted",
                "de": "Ist fehlgeschlagen",
                "ru": "Неисправен",
                "pt": "É falhado",
                "nl": "Is Faulted",
                "fr": "Est défectueux",
                "it": "E' inadeguato",
                "es": "Es culpado",
                "pl": "Is Faulted",
                "uk": "Є За замовчуванням",
                "zh-cn": "I.Fault"
            },
            desc: {
                "en": "Indicates if any partition zones are Open",
                "de": "Gibt an, ob Partitionszonen offen sind",
                "ru": "Указывает, если какие-либо зоны разделов открыты",
                "pt": "Indica se quaisquer zonas de partição são abertas",
                "nl": "Indicatie als er partitiezones open zijn",
                "fr": "Indique si toutes les zones de partition sont ouvertes",
                "it": "Indica se le zone di partizione sono aperte",
                "es": "Indica si hay zonas de partición abiertas",
                "pl": "Jeśli każda strefa podziału jest otwarta",
                "uk": "Індикатори, якщо відкриті будь-які розділи",
                "zh-cn": "说明任何地区均可进入"
            },
            type: "boolean",
            role: "state",
            states: {
                "true": "Faulted",
                "false": "Secure"
            },
            read: true,
            write: false
        });
        if (this.eventParser) {
            const isFaulted = this.eventParser.isFaulted(partitionId);
            if (isFaulted != undefined) {
                const id = `panel.partition${partitionId + 1}.isFaulted`;
                await this.setStateChangedAsync(id, { val: isFaulted, ack: true });
            }
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new QolsysPanel(options);
} else {
    // Otherwise start the instance directly
    (() => new QolsysPanel())();
}
