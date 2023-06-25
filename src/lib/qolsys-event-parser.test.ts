/*
Code Analysis

Main functionalities:
The QolsysEventParser class is responsible for parsing events received from a Qolsys security system and emitting corresponding events. It maintains a list of partitions and zones, and can determine if a partition is faulted based on the status of its zones. It can parse various types of events, including arming, alarm, error, info, and zone events, and emit corresponding events. It also includes a CountdownTimer instance to handle arming delays.

Methods:
- constructor(logger: ioBroker.Logger): creates a new instance of the class and initializes the logger and CountdownTimer instance
- get partitions(): returns a readonly array of PartitionJson objects
- isFaulted(partitionId: number): returns a boolean indicating if the partition with the given ID is faulted
- parseEventPayload(payload: PayloadJson): parses the given event payload and emits corresponding events
- handleAlarmEvent(payload: PayloadJson): handles an alarm event and emits an "alarm" event
- handleArmingEvent(payload: PayloadJson): handles an arming event and emits an "arming" event, possibly with a delay if specified
- handleErrorEvent(payload: PayloadJson): handles an error event and emits an "error" event
- handleInfoEvent(payload: PayloadJson): handles an info event and calls the appropriate handler function
- handlePartitionInfo(partitions: PartitionJson[]): emits a "partition" event for each partition and a "zone" event for each zone in each partition
- handleSecureArmInfo(payload: PayloadJson): handles a secure arm event and emits a "secureArm" event
- handleSummaryInfo(payload: PayloadJson): handles a summary info event and updates the list of partitions and zones
- handleZone(payload: PayloadJson): handles a zone event and calls the appropriate handler function
- handleZoneActive(zone: ZoneJson): handles a zone active event and emits a "zone" event with type "active"
- handleZoneDelete(zone: ZoneJson): handles a zone delete event and emits a "zone" event with type "delete"
- handleZoneUpdate(zone: ZoneJson): handles a zone update event and emits a "zone" event with type "update"
- onCountdown(seconds: number, payload: ArmingJson): handles a CountdownTimer "countdown" event and emits an "arming" event with the remaining delay
- onCountdownStopped(payload: ArmingJson): handles a CountdownTimer "stopped" event and emits an "arming" event

Fields:
- countdown: a CountdownTimer instance used to handle arming delays
- log: an instance of the ioBroker.Logger class used for logging
- _partitions: an array of PartitionJson objects representing the partitions in the security system
*/

import { assert, expect } from "chai";
import { AlarmType, ArmingStateType, EventType, InfoType, ZoneEventType } from "../enums";
import { QolsysEventParser } from "./qolsys-event-parser";
import { PartitionJson, PayloadJson, ZoneJson } from "../interfaces";

/* eslint-disable @typescript-eslint/no-empty-function */
describe("QolsysEventParser", () => {
    const logger: ioBroker.Logger = {
        level: "debug",
        debug: () => {
        },
        warn: () => {
        },
        info: () => {
        },
        error: () => {
        },
        silly: () => {
        }
    };

    // Tests that parsing a valid event payload triggers the corresponding event
    it("test_parse_event_payload_valid_payload", () => {
        const parser = new QolsysEventParser(logger);
        const payload = {
            event: EventType.INFO,
            info_type: InfoType.SUMMARY,
            partition_list: [
                {
                    name: "Partition 1",
                    partition_id: 1,
                    secure_arm: true,
                    status: ArmingStateType.ARM_AWAY,
                    zone_list: [
                        {
                            group: "Group 1",
                            id: "1",
                            name: "Zone 1",
                            partition_id: 1,
                            state: "Normal",
                            status: "Closed",
                            type: "Entry/Exit",
                            zone_alarm_type: 0,
                            zone_id: 1,
                            zone_physical_type: 0,
                            zone_type: 0
                        }
                    ]
                }
            ]
        };
        let eventEmitted = false;
        parser.on("partition", (partition) => {
            eventEmitted = true;
            expect(partition).to.deep.equal(payload.partition_list[0]);
        });
        parser.parseEventPayload(payload);
        expect(eventEmitted).to.be.true;
    });

    // Tests that parsing a valid event payload triggers the corresponding event
    it("test_happy_path_parse_event_payload", () => {
        const parser = new QolsysEventParser(logger);
        const payload = {
            event: EventType.INFO,
            info_type: InfoType.SUMMARY,
            partition_list: [ {
                name: "Partition 1",
                partition_id: 1,
                secure_arm: false,
                status: ArmingStateType.DISARM,
                zone_list: []
            } ]
        };
        let eventEmitted = false;
        parser.on("partition", (partition) => {
            eventEmitted = true;
            expect(partition).to.deep.equal(payload.partition_list[0]);
        });
        parser.parseEventPayload(payload);
        expect(eventEmitted).to.be.true;
    });

    // Tests that isFaulted method returns correct value for faulted and non-faulted partitions
    it("test_happy_path_is_faulted", () => {
        const parser = new QolsysEventParser(logger);
        parser.parseEventPayload({
            event: EventType.INFO,
            info_type: InfoType.SUMMARY,
            partition_list: [ {
                name: "Partition 1",
                partition_id: 1,
                secure_arm: false,
                status: ArmingStateType.DISARM,
                zone_list: [ {
                    group: "Group 1",
                    id: "1",
                    name: "Zone 1",
                    partition_id: 1,
                    state: "Normal",
                    status: "Closed",
                    type: "Entry/Exit",
                    zone_alarm_type: 0,
                    zone_id: 1,
                    zone_physical_type: 0,
                    zone_type: 0
                } ]
            } ]
        });
        expect(parser.isFaulted(1)).to.be.false;
        parser.parseEventPayload({
            event: EventType.ZONE,
            zone_event_type: ZoneEventType.ZONE_ACTIVE,
            zone: {
                group: "Group 1",
                id: "1",
                name: "Zone 1",
                partition_id: 1,
                state: "Normal",
                status: "Open",
                type: "Entry/Exit",
                zone_alarm_type: 0,
                zone_id: 1,
                zone_physical_type: 0,
                zone_type: 0
            }
        });
        expect(parser.isFaulted(1)).to.be.true;
    });

    it("test_parse_event_payload_valid_arming", () => {
        const parser = new QolsysEventParser(logger);
        const payload = {
            event: EventType.ARMING,
            arming_type: ArmingStateType.ARM_AWAY,
            partition_id: 1,
            delay: 30
        };
        let armingEventEmitted = false;
        parser.on("arming", (arming) => {
            armingEventEmitted = true;
            assert.deepStrictEqual(arming, {
                arming_type: payload.arming_type,
                partition_id: payload.partition_id,
                delay: payload.delay
            });
        });
        parser.parseEventPayload(payload);
        assert.strictEqual(parser.countdown.isRunning, true);
        assert.strictEqual(armingEventEmitted, false);
        parser.countdown.stop();
        assert.strictEqual(parser.countdown.isRunning, false);
        assert.strictEqual(armingEventEmitted, true);
    });

    it("test_parse_event_payload_valid_alarm", () => {
        const parser = new QolsysEventParser(logger);
        const payload = {
            event: EventType.ALARM,
            alarm_type: AlarmType.POLICE,
            partition_id: 1
        };
        let alarmEventEmitted = false;
        parser.on("alarm", (alarm) => {
            alarmEventEmitted = true;
            assert.deepStrictEqual(alarm, {
                alarm_type: payload.alarm_type,
                partition_id: payload.partition_id
            });
        });
        parser.parseEventPayload(payload);
        assert.strictEqual(alarmEventEmitted, true);
    });

    it("test_zone_delete", () => {
        const parser = new QolsysEventParser(logger);
        const zone: ZoneJson = {
            group: "Test Group",
            id: "Test ID",
            name: "Test Zone",
            partition_id: 1,
            state: "Closed",
            status: "Normal",
            type: "Entry/Exit",
            zone_alarm_type: 0,
            zone_id: 1,
            zone_physical_type: 0,
            zone_type: 0
        };
        const partition: PartitionJson = {
            name: "Test Partition",
            partition_id: 1,
            secure_arm: false,
            status: ArmingStateType.DISARM,
            zone_list: [ zone ]
        };
        parser["_partitions"] = [ partition ];
        const payload: PayloadJson = {
            event: EventType.ZONE,
            zone_event_type: ZoneEventType.ZONE_DELETE,
            zone
        };
        let eventEmitted = false;
        parser.on("zone", (z) => {
            eventEmitted = true;
            expect(z).to.deep.equal(zone);
        });

        parser["handleZone"](payload);
        expect(parser["_partitions"]).to.not.include(partition);
        expect(eventEmitted).to.be.true;
    });
});
