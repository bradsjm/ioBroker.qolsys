import { AlarmType } from "../enums";

export interface AlarmJson {
    alarm_type: AlarmType;
    partition_id: number;
}
