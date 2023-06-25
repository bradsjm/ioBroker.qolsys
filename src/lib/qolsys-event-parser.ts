import { EventEmitter } from "events";
import { EventType, InfoType, ZoneEventType } from "../enums";
import { AlarmJson, ArmingJson, ErrorJson, PartitionJson, PayloadJson, ZoneJson } from "../interfaces";
import { CountdownTimer } from "./countdown-timer";

/**
 * Qolsys Panel Event Parser.
 */
export class QolsysEventParser extends EventEmitter {
    countdown = new CountdownTimer<ArmingJson>();
    private log: ioBroker.Logger;

    /**
     * Event parser constructor.
     *
     * @param {ioBroker.Logger} logger: Adapter logger.
     *
     * @emits alarm: Emits an event with an alarm type {AlarmType} payload.
     * @emits arming: Emits an event with an arming type {ArmingType} payload.
     * @emits error: Emits an event with a string describing the error.
     * @emits partition: Emits an event with a partition {PartitionJson} payload.
     * @emits secureArm: Emits an event with a secure arming payload.
     * @emits zone: Emits an event with a zone {ZoneJson} payload.
     */
    constructor(logger: ioBroker.Logger) {
        super({ captureRejections: true });
        this.log = logger;
        this.countdown.on("countdown", this.onCountdown.bind(this));
        this.countdown.on("stopped", this.onCountdownStopped.bind(this));
    }

    // List of partitions
    private _partitions: PartitionJson[] = [];

    /**
     * Returns the list of partitions
     *
     * @return {PartitionJson[]} List of partitions
     */
    public get partitions(): readonly PartitionJson[] {
        return this._partitions;
    }

    /**
     * Check if a partition is faulted by checking any zones report "Open"
     *
     * @param {number} partitionId: The ID of the partition (zero based)
     * @return {boolean|undefined} True if the partition is secure, undefined if partition does not exist
     */
    public isFaulted(partitionId: number): boolean | undefined {
        const partition = this.partitions.find(partition => partition.partition_id === partitionId);
        return partition?.zone_list.some((zone) => zone.status === "Open");
    }

    /**
     * Parses an event payload and emits events based on the event type and associated information.
     * Currently handles event types: INFO, ZONE, ARMING, ALARM, ERROR.
     * Any unrecognized event type is logged as a warning.
     *
     * @param {PayloadJson} payload: The event payload to parse.
     */
    public parseEventPayload(payload: PayloadJson): void {
        switch (payload.event) {
            case EventType.INFO:
                this.handleInfoEvent(payload);
                break;

            case EventType.ZONE:
                this.handleZone(payload);
                break;

            case EventType.ARMING:
                this.handleArmingEvent(payload);
                break;

            case EventType.ALARM:
                this.handleAlarmEvent(payload);
                break;

            case EventType.ERROR:
                this.handleErrorEvent(payload);
                break;

            default:
                this.log.warn("unknown event type: " + JSON.stringify(payload));
                break;
        }
    }

    /**
     * The handleAlarmEvent function is called when the alarm event is received from the system.
     * It emits an &quot;alarm&quot; event with a payload of type AlarmJson.
     *
     * @param payload: PayloadJson Pass the payload from the event to this function
     *
     * @emits alarm: Emits an event with an alarm type {AlarmJson} payload.
     */
    private handleAlarmEvent(payload: PayloadJson): void {
        if (payload.alarm_type != null && payload.partition_id != null) {
            const event: AlarmJson = {
                alarm_type: payload.alarm_type,
                partition_id: payload.partition_id
            };
            this.emit("alarm", event);
        }
    }

    /**
     * The handleArmingEvent function is called when the payload.event_type is &quot;ARMING&quot;.
     * It checks if the arming_type and partition_id are not null, then it creates an ArmingJson object with those values.
     * If there's a delay value in the payload, it starts a countdown using that value and passes in the event object as well.
     * If there's no delay or if there was already a countdown running (which would be stopped), then this function emits an &quot;arming&quot; event with that event object as its argument.
     *
     * @param payload: PayloadJson Pass the payload from the event to this function
     *
     * @emits arming: Emits an event with an arming type {ArmingType} payload.
     */
    private handleArmingEvent(payload: PayloadJson): void {
        if (payload.arming_type != null && payload.partition_id != null) {
            const event: ArmingJson = {
                arming_type: payload.arming_type,
                partition_id: payload.partition_id,
                delay: payload.delay
            };
            if (event.delay != null) {
                this.countdown.start(event.delay, event);
                return;
            } else if (this.countdown.isRunning) {
                this.countdown.stop();
            }
            this.emit("arming", event);
        } else {
            this.log.warn("unknown ARMING event: " + JSON.stringify(payload));
        }
    }

    /**
     * The handleErrorEvent function is called when the client receives an ERROR event from the system.
     * The function emits a &quot;error&quot; event with an ErrorJson object as its payload.
     *
     * @param {PayloadJson} payload: The payload of the event
     *
     * @emits error: Emits an event with an error type {ErrorJson} payload.
     */
    private handleErrorEvent(payload: PayloadJson): void {
        if (payload.error_type != null && payload.description != null && payload.partition_id != null) {
            const event: ErrorJson = {
                description: payload.description,
                error_type: payload.error_type,
                partition_id: payload.partition_id
            }
            this.emit("error", event);
        } else {
            this.log.warn("unknown ERROR event: " + JSON.stringify(payload));
        }
    }

    /**
     * The handleInfoEvent function handles the INFO event.
     *
     * @param {PayloadJson} payload: The payload of the message
     */
    private handleInfoEvent(payload: PayloadJson): void {
        switch (payload.info_type) {
            case InfoType.SUMMARY:
                this.handleSummaryInfo(payload);
                break;

            case InfoType.SECURE_ARM:
                this.handleSecureArmInfo(payload);
                break;

            default:
                this.log.warn("unknown INFO type: " + payload.info_type);
                break;
        }
    }

    /**
     * The handlePartitionInfo function is called when the system sends a partition event.
     * It parses an array of PartitionJson objects, emitting 'partition' and 'zone' events.
     *
     * @param {PartitionJson[]} partitions: An array of PartitionJson objects to parse.
     *
     * @emits partition: Emits an event with a {PartitionJson} object.
     * @emits zone: Emits an event with a {ZoneJson} object.
     */
    private handlePartitionInfo(partitions: PartitionJson[]): void {
        // emit all partition events
        partitions.forEach((partition) => {
            this.emit("partition", partition);
        });

        // emit all zone events
        partitions.forEach((partition) => {
            partition.zone_list.forEach((zone) => {
                this.emit("zone", zone, "info");
            })
        });
    }

    /**
     * The handleSecureArmInfo function is called when the system sends a secureArm event.
     * The function emits an event with the partition_id and secureArm value from the payload.
     *
     * @param {PayloadJson} payload: The payload of the event
     */
    private handleSecureArmInfo(payload: PayloadJson): void {
        if (typeof payload.value === "boolean" && payload.partition_id) {
            this.emit("secureArm", {
                partition_id: payload.partition_id,
                secureArm: payload.value
            });
        } else {
            this.log.warn("unknown secureArm event: " + JSON.stringify(payload));
        }
    }

    /**
     * The handleSummaryInfo function is called when the client receives a summary event.
     * The function parses the payload and updates the partitions array with new partition information.
     *
     * @param {PayloadJson} payload: The payload of the event
     */
    private handleSummaryInfo(payload: PayloadJson): void {
        this.log.debug("summary: " + JSON.stringify(payload));
        if (payload.partition_list) {
            this._partitions = payload.partition_list;
            this.handlePartitionInfo(payload.partition_list);
        } else {
            this.log.warn("unknown partition event: " + JSON.stringify(payload));
        }
    }

    /**
     * The handleZone function is called when a zone event occurs.
     *
     * @param {PayloadJson} payload: The payload of the event
     */
    private handleZone(payload: PayloadJson): void {
        if (payload.zone) {
            switch (payload.zone_event_type) {
                case ZoneEventType.ZONE_ACTIVE:
                    this.handleZoneActive(payload.zone);
                    break;

                case ZoneEventType.ZONE_ADD:
                case ZoneEventType.ZONE_UPDATE:
                    this.handleZoneUpdate(payload.zone);
                    break;

                case ZoneEventType.ZONE_DELETE:
                    this.handleZoneDelete(payload.zone);
                    break;

                default:
                    this.log.warn("unknown zone event type: " + JSON.stringify(payload));
                    break;
            }
        }
    }

    /**
     * The handleZone function is called when a zone active event occurs.
     * It locates and updates the matching partition zone detail and emits a complete 'zone' event.
     *
     * @param {ZoneJson} payload: The zone object of the event.
     *
     * @emits zone: Emits an event with a {ZoneJson} object
     */
    private handleZoneActive(payload: ZoneJson): void {
        this.log.debug("zone active: " + JSON.stringify(payload));
        if (!this._partitions.some((partition) => {
            return partition.zone_list.some((zone) => {
                if (zone.zone_id === payload.zone_id) {
                    this.emit("zone", Object.assign(zone, payload), "active");
                    return true;
                }
                return false;
            })
        })) {
            this.log.warn("zone not found: " + JSON.stringify(payload));
        }
    }

    /**
     * The handleZoneDelete function is called when a zone delete event occurs.
     * Remove the matching partition zone and emits a complete 'zone' event.
     *
     * @param {ZoneJson} payload: The zone object of the event.
     * *
     * @emits zone: If the zone was found, emits a delete event with a {ZoneJson} object
     */
    private handleZoneDelete(payload: ZoneJson): void {
        this.log.debug("zone delete: " + JSON.stringify(payload));
        this._partitions = this._partitions.map((partition) => {
            const updatedPartition = { ...partition }; // Copy the partition object to avoid mutation
            updatedPartition.zone_list = updatedPartition.zone_list.filter((z) => z.zone_id !== payload.zone_id);

            // If zone was removed, emit 'delete' event
            if (updatedPartition.zone_list.length < partition.zone_list.length) {
                this.emit("zone", payload, "delete");
            } else {
                this.log.debug("unable to delete zone: " + JSON.stringify(payload));
            }

            return updatedPartition;
        });
    }

    /**
     * The handleZoneUpdate function is called when a zone update event occurs.
     * It locates and updates any matching partition zone detail or adds a new one
     * and emits a complete 'zone' event.
     *
     * @param {ZoneJson} payload: The zone object of the event
     *
     * @emits zone: Emits an event with a {ZoneJson} object
     */
    private handleZoneUpdate(payload: ZoneJson): void {
        this.log.debug("zone update: " + JSON.stringify(payload));
        const partition = this._partitions.find(p => p.partition_id === payload.partition_id);
        if (partition !== undefined) {
            const idx = partition.zone_list.findIndex((z) => z.zone_id === payload.zone_id);
            if (idx === -1) {
                partition.zone_list.push(payload);
            } else {
                partition.zone_list[idx] = payload;
            }
        }
        this.emit("zone", payload, "update");
    }

    /**
     * The onCountdown function is called when the countdown timer has been started.
     * It emits an event to the client with a payload containing information about
     * what type of arming is being performed, which partition it's for, and how many seconds are left in the delay.
     *
     * @param {number} seconds: Number of seconds left before the alarm is armed
     * @param {ArmingJson} payload: The payload from the arming event to this function
     */
    private onCountdown(seconds: number, payload: ArmingJson): void {
        this.emit("arming", {
            arming_type: payload.arming_type,
            partition_id: payload.partition_id,
            delay: seconds || payload.delay
        });
    }

    /**
     * The onCountdownStopped function is called when the countdown has stopped or completed.
     * It emits the original arming payload event.
     *
     * @param {ArmingJson} payload: The payload from the arming event
     *
     * @emits arming: Emits an event with a {ArmingJson} object
     */
    private onCountdownStopped(payload: ArmingJson): void {
        this.emit("arming", payload);
    }
}
