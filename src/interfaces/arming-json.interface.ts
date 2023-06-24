import { ArmingStateType } from "../enums";

export interface ArmingJson {
    arming_type: ArmingStateType;
    delay?: number;
    partition_id: number;
}
