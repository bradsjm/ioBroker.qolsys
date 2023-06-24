import { ActionType, AlarmType, ArmingStateType, EventType, InfoType, ZoneEventType } from "../enums";
import { PartitionJson } from "./partition-json.interface";
import { ZoneJson } from "./zone-json.interface";

export interface PayloadJson {
    action?: ActionType;
    alarm_type?: AlarmType;
    arming_type?: ArmingStateType;
    bypass?: boolean;
    delay?: number;
    description?: string;
    entry_delay?: number;
    error_type?: string;
    event?: EventType;
    exit_delay?: number;
    info_type?: InfoType;
    nonce?: string;
    partition_id?: number;
    partition_list?: PartitionJson[];
    requestId?: string;
    source?: string;
    token?: string;
    usercode?: string;
    value?: unknown;
    version?: number;
    zone?: ZoneJson;
    zone_event_type?: ZoneEventType;
}
