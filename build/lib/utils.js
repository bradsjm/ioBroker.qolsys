"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var utils_exports = {};
__export(utils_exports, {
  convertToTitleCase: () => convertToTitleCase,
  generateNonce: () => generateNonce,
  getPath: () => getPath,
  getZoneRole: () => getZoneRole
});
module.exports = __toCommonJS(utils_exports);
var import_crypto = __toESM(require("crypto"));
var import_enums = require("../enums");
function convertToTitleCase(str) {
  return str.replace(/[_-]/g, " ").trim().replace(/\w\S*/g, function(str2) {
    return str2.charAt(0).toUpperCase() + str2.slice(1);
  }).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
}
function getZoneRole(zone) {
  switch (zone.zone_type) {
    case import_enums.SecurityZoneType.MOTION:
    case import_enums.SecurityZoneType.OCCUPANCY_SENSOR:
    case import_enums.SecurityZoneType.PANEL_MOTION:
      return "sensor.motion";
    case import_enums.SecurityZoneType.BREAKAGE:
    case import_enums.SecurityZoneType.GLASSBREAK:
    case import_enums.SecurityZoneType.PANEL_GLASS_BREAK:
    case import_enums.SecurityZoneType.SHOCK:
    case import_enums.SecurityZoneType.SHOCK_OTHERS:
    case import_enums.SecurityZoneType.SHOCK_SENSOR_MULTI_FUNCTION:
      return "sensor.noise";
    case import_enums.SecurityZoneType.SMOKE_HEAT:
    case import_enums.SecurityZoneType.SMOKE_MULTI_FUNCTION:
      return "sensor.alarm.fire";
    case import_enums.SecurityZoneType.CONTACT:
    case import_enums.SecurityZoneType.CONTACT_MULTI_FUNCTION:
    case import_enums.SecurityZoneType.TAKEOVER_MODULE:
    case import_enums.SecurityZoneType.WIRED_SENSOR:
      return /window/i.exec(zone.name) ? "sensor.contact.window" : "sensor.contact.door";
    case import_enums.SecurityZoneType.WATER:
    case import_enums.SecurityZoneType.WATER_IQ_FLOOD:
    case import_enums.SecurityZoneType.WATER_OTHER_FLOOD:
      return "sensor.alarm.flood";
    case import_enums.SecurityZoneType.CARBON_MONOXIDE:
    case import_enums.SecurityZoneType.FREEZE:
    case import_enums.SecurityZoneType.RF_KEYPAD:
    case import_enums.SecurityZoneType.TEMPERATURE:
    case import_enums.SecurityZoneType.TEMPERATURE_MULTI_FUNCTION:
      return "sensor.alarm";
    default:
      return void 0;
  }
}
function getPath(device, channel, stateName) {
  return `${device}.${channel}` + (stateName ? `.${stateName}` : "");
}
let counter = BigInt(0);
function generateNonce() {
  const random = import_crypto.default.randomBytes(4);
  const sequential = counter++;
  const nonceBuffer = Buffer.alloc(12);
  random.copy(nonceBuffer, 0, 0, 4);
  nonceBuffer.writeBigInt64BE(sequential, 4);
  return nonceBuffer.toString("hex");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  convertToTitleCase,
  generateNonce,
  getPath,
  getZoneRole
});
//# sourceMappingURL=utils.js.map
