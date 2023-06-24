import { ArmingStateType } from "../enums";
import { ZoneJson } from "./zone-json.interface";

export interface PartitionJson {
    name: string;
    partition_id: number;
    secure_arm: boolean;
    status: ArmingStateType;
    zone_list: ZoneJson[];
}
