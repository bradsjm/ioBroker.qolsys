import * as utils from "@iobroker/adapter-core";
import { AlarmType, ArmingStateType } from "./enums";

import { AlarmJson, ArmingJson, ErrorJson, PartitionJson, ZoneJson } from "./interfaces";
import { QolsysEventParser } from "./lib/qolsys-event-parser";
import { QolsysPanelClient } from "./lib/qolsys-panel-client";
import { convertToTitleCase, getPath, getZoneRole } from "./lib/utils";
import {
    PanelAlarmStateCommon,
    PanelArmDelayCommon,
    PanelArmStateCommon,
    PanelCommandStateCommon,
    PanelSecureArmCommon
} from "./lib/iobroker-states";

/**
 * Qolsys IQ Panel adapter.
 */
class QolsysPanel extends utils.Adapter {
    private eventParser?: QolsysEventParser;
    private panel?: QolsysPanelClient;

    /**
     * Qolsys adapter constructor.
     *
     * @param {Partial<utils.AdapterOptions>} options - Adapter options.
     */
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: "qolsys",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Create partition objects if they do not exist and subscribe to state changes.
     *
     * @param id - The ID of the partition object
     * @param partition - The partition object
     */
    private async createPartitionObjects(id: string, partition: PartitionJson): Promise<void> {
        await this.createChannelAsync("panel", id, { name: partition.name });
        await this.createStateAsync("panel", id, "command", PanelCommandStateCommon, { partition_id: partition.partition_id });
        await this.createStateAsync("panel", id, "alarmState", PanelAlarmStateCommon);
        await this.createStateAsync("panel", id, "armDelay", PanelArmDelayCommon);
        await this.createStateAsync("panel", id, "armState", PanelArmStateCommon, { partition_id: partition.partition_id });
        await this.createStateAsync("panel", id, "secureArm", PanelSecureArmCommon);

        // Subscribe to changes of panel partition command
        await this.subscribeStatesAsync(getPath("panel", id, "command"));
    }

    /**
     * Create zone objects if they do not exist.
     *
     * @param zone - The {ZoneJson} of the partition object
     * @param role - The object role
     */
    private async createZoneObjects(zone: ZoneJson, role: string): Promise<void> {
        const title = convertToTitleCase(zone.type);
        await this.createChannelAsync("zones", zone.id, { name: zone.name }, {
            zone_id: zone.zone_id,
            partition_id: zone.partition_id
        });
        await this.createStateAsync("zones", zone.id, "state", {
            name: {
                "en": `${zone.name} State`,
                "de": `${zone.name} Staat`,
                "ru": `${zone.name} Государство`,
                "pt": `${zone.name} Estado`,
                "nl": `${zone.name} Staats State`,
                "fr": `${zone.name} État`,
                "it": `${zone.name} Stato`,
                "es": `${zone.name} Estado`,
                "pl": `${zone.name} Państwo`,
                "uk": `${zone.name} Стан`,
                "zh-cn": "${zone.name} 国家"
            },
            desc: {
                "en": `${title} Sensor`,
                "de": `${title} Sensor`,
                "ru": `${title} Сенсор`,
                "pt": `${title} Sensor de sensor`,
                "nl": `${title} Sensor`,
                "fr": `${title} Senseur`,
                "it": `${title} Sensore`,
                "es": `${title} Sensor`,
                "pl": `${title} Sensor`,
                "uk": `${title} Страхування`,
                "zh-cn": `${title} 许可证`
            },
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
        {
            group: zone.group,
            partition_id: zone.partition_id,
            zone_alarm_type: zone.zone_alarm_type,
            zone_id: zone.zone_id,
            zone_physical_type: zone.zone_physical_type
        });
        await this.createStateAsync("zones", zone.id, "tamper", {
            name: {
                "en": `${zone.name} Tamper`,
                "de": `${zone.name} Tamper`,
                "ru": `${zone.name} Тампере`,
                "pt": `${zone.name} Tampão`,
                "nl": `${zone.name} Tamper`,
                "fr": `${zone.name} Tamper`,
                "it": `${zone.name} Ammortizzatore`,
                "es": `${zone.name} Tamper`,
                "pl": `${zone.name} Tamper`,
                "uk": `${zone.name} Тампер`,
                "zh-cn": `${zone.name} 坦佩尔`
            },
            desc: {
                "en": `${title} Tamper State`,
                "de": `${title} Mitgliedstaat`,
                "ru": `${title} Тампере государство`,
                "pt": `${title} Estado de Tampão`,
                "nl": `${title} Tamper State`,
                "fr": `${title} État de Tamper`,
                "it": `${title} Tamper Stato`,
                "es": `${title} Tamper State`,
                "pl": `${title} Tamper`,
                "uk": `${title} Тамперська держава`,
                "zh-cn": `${title} 坦佩尔州`
            },
            type: "boolean",
            states: {
                "true": "Tampered",
                "false": "Normal"
            },
            role: "indicator.alarm",
            read: true,
            write: false,
            def: false
        },
        { partition_id: zone.partition_id });
    }

    /**
     * Retrieve arm state value or undefined if not set.
     * @param partition_id the Partition ID
     * @return the arm state value or undefined
     */
    private async getPartitionArmState(partition_id: number): Promise<string | undefined> {
        const id = `partition${partition_id + 1}`;
        const armStateId = getPath("panel", id, "armState");
        const armState = await this.getStateAsync(armStateId);
        return typeof armState?.val === "string" ? armState?.val : undefined;
    }

    /**
     * Retrieve arming delay value or undefined if not set.
     * @param partition_id the Partition ID
     * @return the arming delay value or undefined
     */
    private async getPartitionarmDelay(partition_id: number): Promise<number | undefined> {
        const id = `partition${partition_id + 1}`;
        const delayId = getPath("panel", id, "armDelay");
        const delayState = await this.getStateAsync(delayId);
        return typeof delayState?.val === "number" ? delayState?.val : undefined;
    }

    /**
     * Asynchronously invoked when panel alarm event is received.
     *
     * @param {AlarmJson} alarm - Alarm type
     */
    private async onAlarm(alarm: AlarmJson): Promise<void> {
        const id = `partition${alarm.partition_id + 1}`;
        this.log.info(`triggering ${alarm.alarm_type} alarm on ${id}`);
        await this.setStateChangedAsync(getPath("panel", id, "alarmState"), {
            val: alarm.alarm_type, ack: true
        });
    }

    /**
     * Asynchronously invoked when panel arming event is received.
     *
     * @param {ArmingJson} arming - Arming event
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
     * Handles changes in to command state.
     *
     * @param {number} partition_id - The numerical ID of the partition.
     * @param {any} value - The value of the command.
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
     * Asynchronously invoked when the panel is connected
     */
    private async onPanelConnect(): Promise<void> {
        await this.setOnlineStatus(true);
        await this.panel?.requestSummary();
    }

    // When the connection is closed, set connection state to false
    private async onPanelDisconnect(): Promise<void> {
        await this.setOnlineStatus(false);
    }

    // Log and update connection errors
    private async onPanelError(error: Error): Promise<void> {
        this.log.error(error.message);
        await this.setStateChangedAsync("panel.lastError", { val: error.message, ack: true });
    }

    // Log and update partition errors
    private async onPartitionError(error: ErrorJson): Promise<void> {
        const errorType = convertToTitleCase(error.error_type.toLowerCase())
        const value = (`${errorType}: ${error.description} (Partition ${error.partition_id + 1}) `);
        this.log.error(value);
        await this.setStateChangedAsync("panel.lastError", { val: value, ack: true });
    }

    /**
     * Asynchronously invoked when the adapter is ready to start and connect to panel.
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
        this.eventParser.on("error", this.onPartitionError.bind(this));
        this.eventParser.on("partition", this.onReceivedPartition.bind(this));
        this.eventParser.on("secureArm", this.onSecureArmChange.bind(this));
        this.eventParser.on("zone", this.onReceivedZone.bind(this));

        // Create client
        this.panel = new QolsysPanelClient(this.log, this.config);
        this.panel.on("close", this.onPanelDisconnect.bind(this));
        this.panel.on("connect", this.onPanelConnect.bind(this));
        this.panel.on("data", this.eventParser.parseEventPayload.bind(this.eventParser));
        this.panel.on("error", this.onPanelError.bind(this));

        // Start connection to the panel
        this.panel.connect();
    }

    /**
     * Creates a partition if it does not exist.
     * Sets the initial status and secure arm state of the partition.
     */
    private async onReceivedPartition(partition: PartitionJson): Promise<void> {
        this.log.debug(`received partition #${partition.partition_id} (${partition.name})`);
        const id = `partition${partition.partition_id + 1}`;
        await this.createPartitionObjects(id, partition);
        await this.onArmingChange({ partition_id: partition.partition_id, arming_type: partition.status });
        await this.onSecureArmChange(partition);
    }

    /**
     * Parses and creates a zone within a partition. Sets the initial status of the zone.
     * @param {ZoneJson} zone - An object containing information about the zone.
     * @param {string} event - The event (info, active, update) that occurred.
     */
    private async onReceivedZone(zone: ZoneJson, event: string): Promise<void> {
        const role = getZoneRole(zone);
        if (!role) {
            return
        }

        if (event === "delete") {
            // Not currently implemented
            this.log.info(`zone ${zone.id} delete not currently implemented`);
            return
        }

        await this.createZoneObjects(zone, role);
        const stateId = `zones.${zone.id}.state`;

        if (event === "active") {
            await this.updateZoneTamperState(zone);
        }

        this.log.debug(`setting zone #${zone.zone_id} (${zone.name}) to ${zone.status}`);
        const isOpen = zone.status === "Open";

        // Set the zone state
        await this.setStateChangedAsync(stateId, { val: isOpen, ack: true });

        // Update the partition secure state
        await this.updatePartitionFaultState(zone.partition_id);
    }

    /**
     * Updates secure arm state of a partition
     * @param partition the partition
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
        if (!state || state.ack || !this.panel || !state.val) return;

        // Get which partition id is associated with the received command object
        const object = await this.getForeignObjectAsync(id);
        const partition_id = object?.native.partition_id;

        if (typeof partition_id === "number" && typeof state.val === "string") {
            this.log.debug(`received command ${state.val} for partition ${partition_id}`);
            await this.onCommand(partition_id, state.val);
        }
    }

    /**
     * Invoked when the adapter is unloaded.
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
     * Set the online status
     *
     * @param online - The new online status
     */
    private async setOnlineStatus(online: boolean): Promise<void> {
        await this.setStateAsync("info.connection", { val: online, ack: true });
    }

    /**
     * Updates the tracked fault state of a partition
     * @param partitionId - The partition ID to update
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

    /**
     * Update tamper state of zone
     * @param zone the zone
     */
    private async updateZoneTamperState(zone: ZoneJson): Promise<void> {
        const stateId = `zones.${zone.id}.state`;
        const tamperId = `zones.${zone.id}.tamper`;
        const isOpen = zone.status === "Open";

        const currentState = await this.getStateAsync(stateId);
        const tamperState = await this.getStateAsync(tamperId);

        if (isOpen && currentState?.val) {
            // An Open sensor being Open through ZONE_ACTIVE is now tampered
            this.log.debug(`tampering zone #${zone.zone_id} (${zone.name})`);
            await this.setStateChangedAsync(tamperId, { val: true, ack: true });
        } else if (!isOpen && tamperState?.val) {
            // A tampered sensor being Closed through ZONE_ACTIVE is no more tampered
            this.log.debug(`not tampering zone #${zone.zone_id} (${zone.name})`);
            await this.setStateChangedAsync(tamperId, { val: false, ack: true });
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
