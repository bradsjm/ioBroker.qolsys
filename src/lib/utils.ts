import crypto from "crypto";
import { SecurityZoneType } from "../enums";
import { ZoneJson } from "../interfaces";

/**
 * Convert string to title case.
 * Examples:
 *
 * "yourStringHere" -> "Your String Here"
 * "AnotherStringHere" -> "Another String Here"
 * "someones_string" -> "Someones String"
 * "Another-String-Here" -> "Another String Here"
 * "myAWESOMEString" -> "My AWESOME String"
 *
 * @param str The string to convert
 * @return The converted string
 */
export function convertToTitleCase(str: string): string {
    return str
        .replace(/[_-]/g, " ")
        .trim()
        .replace(/\w\S*/g, function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
        })
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
}

/**
 * Get the ioBroker role of a zone
 *
 * @param zone - The zone
 * @return The ioBroker role or undefined if not found
 */
export function getZoneRole(zone: ZoneJson): string | undefined {
    switch (zone.zone_type) {
        case SecurityZoneType.MOTION:
        case SecurityZoneType.OCCUPANCY_SENSOR:
        case SecurityZoneType.PANEL_MOTION:
            return "sensor.motion";
        case SecurityZoneType.BREAKAGE:
        case SecurityZoneType.GLASSBREAK:
        case SecurityZoneType.PANEL_GLASS_BREAK:
        case SecurityZoneType.SHOCK:
        case SecurityZoneType.SHOCK_OTHERS:
        case SecurityZoneType.SHOCK_SENSOR_MULTI_FUNCTION:
            return "sensor.noise";
        case SecurityZoneType.SMOKE_HEAT:
        case SecurityZoneType.SMOKE_MULTI_FUNCTION:
            return "sensor.alarm.fire";
        case SecurityZoneType.CONTACT:
        case SecurityZoneType.CONTACT_MULTI_FUNCTION:
        case SecurityZoneType.TAKEOVER_MODULE:
        case SecurityZoneType.WIRED_SENSOR:
            return /window/i.exec(zone.name) ? "sensor.contact.window" : "sensor.contact.door";
        case SecurityZoneType.WATER:
        case SecurityZoneType.WATER_IQ_FLOOD:
        case SecurityZoneType.WATER_OTHER_FLOOD:
            return "sensor.alarm.flood";
        case SecurityZoneType.CARBON_MONOXIDE:
        case SecurityZoneType.FREEZE:
        case SecurityZoneType.RF_KEYPAD:
        case SecurityZoneType.TEMPERATURE:
        case SecurityZoneType.TEMPERATURE_MULTI_FUNCTION:
            return "sensor.alarm";
        default:
            return undefined;
    }
}

/**
 * Return path to a channel or state
 * @param device required device
 * @param channel required channel
 * @param stateName optional state name
 * @return path
 */
export function getPath(device: string, channel: string, stateName?: string): string {
    return `${device}.${channel}` + (stateName ? `.${stateName}` : "");
}

let counter = BigInt(0);

/**
 * Generates a 96-bit (12-byte) nonce string. The most significant 4 bytes are random,
 * while the final 8 bytes are a sequential counter. The counter is designed to accommodate
 * up to 2^64 messages without repeating within a single program execution.
 *
 * @returns {string} The generated nonce as a hexadecimal string
 */
export function generateNonce(): string {
    const random = crypto.randomBytes(4);
    const sequential = counter++;

    // Construct nonce from 4 bytes of random and 8 bytes sequential parts
    const nonceBuffer = Buffer.alloc(12);
    random.copy(nonceBuffer, 0, 0, 4); // Copy random part
    nonceBuffer.writeBigInt64BE(sequential, 4); // Write sequential part

    // Convert to hexadecimal string
    return nonceBuffer.toString("hex");
}
