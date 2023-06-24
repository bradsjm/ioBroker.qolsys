"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var security_zone_type_enum_exports = {};
__export(security_zone_type_enum_exports, {
  SecurityZoneType: () => SecurityZoneType
});
module.exports = __toCommonJS(security_zone_type_enum_exports);
var SecurityZoneType = /* @__PURE__ */ ((SecurityZoneType2) => {
  SecurityZoneType2[SecurityZoneType2["UNKNOWN"] = 0] = "UNKNOWN";
  SecurityZoneType2[SecurityZoneType2["CONTACT"] = 1] = "CONTACT";
  SecurityZoneType2[SecurityZoneType2["MOTION"] = 2] = "MOTION";
  SecurityZoneType2[SecurityZoneType2["SOUND"] = 3] = "SOUND";
  SecurityZoneType2[SecurityZoneType2["BREAKAGE"] = 4] = "BREAKAGE";
  SecurityZoneType2[SecurityZoneType2["SMOKE_HEAT"] = 5] = "SMOKE_HEAT";
  SecurityZoneType2[SecurityZoneType2["CARBON_MONOXIDE"] = 6] = "CARBON_MONOXIDE";
  SecurityZoneType2[SecurityZoneType2["RADON"] = 7] = "RADON";
  SecurityZoneType2[SecurityZoneType2["TEMPERATURE"] = 8] = "TEMPERATURE";
  SecurityZoneType2[SecurityZoneType2["PANIC_BUTTON"] = 9] = "PANIC_BUTTON";
  SecurityZoneType2[SecurityZoneType2["CONTROL"] = 10] = "CONTROL";
  SecurityZoneType2[SecurityZoneType2["CAMERA"] = 11] = "CAMERA";
  SecurityZoneType2[SecurityZoneType2["LIGHT"] = 12] = "LIGHT";
  SecurityZoneType2[SecurityZoneType2["GPS"] = 13] = "GPS";
  SecurityZoneType2[SecurityZoneType2["SIREN"] = 14] = "SIREN";
  SecurityZoneType2[SecurityZoneType2["WATER"] = 15] = "WATER";
  SecurityZoneType2[SecurityZoneType2["TILT"] = 16] = "TILT";
  SecurityZoneType2[SecurityZoneType2["FREEZE"] = 17] = "FREEZE";
  SecurityZoneType2[SecurityZoneType2["TAKEOVER_MODULE"] = 18] = "TAKEOVER_MODULE";
  SecurityZoneType2[SecurityZoneType2["GLASSBREAK"] = 19] = "GLASSBREAK";
  SecurityZoneType2[SecurityZoneType2["TRANSLATOR"] = 20] = "TRANSLATOR";
  SecurityZoneType2[SecurityZoneType2["MEDICAL_PENDANT"] = 21] = "MEDICAL_PENDANT";
  SecurityZoneType2[SecurityZoneType2["WATER_IQ_FLOOD"] = 22] = "WATER_IQ_FLOOD";
  SecurityZoneType2[SecurityZoneType2["WATER_OTHER_FLOOD"] = 23] = "WATER_OTHER_FLOOD";
  SecurityZoneType2[SecurityZoneType2["IMAGE_SENSOR"] = 30] = "IMAGE_SENSOR";
  SecurityZoneType2[SecurityZoneType2["WIRED_SENSOR"] = 100] = "WIRED_SENSOR";
  SecurityZoneType2[SecurityZoneType2["RF_SENSOR"] = 101] = "RF_SENSOR";
  SecurityZoneType2[SecurityZoneType2["KEYFOB"] = 102] = "KEYFOB";
  SecurityZoneType2[SecurityZoneType2["WALLFOB"] = 103] = "WALLFOB";
  SecurityZoneType2[SecurityZoneType2["RF_KEYPAD"] = 104] = "RF_KEYPAD";
  SecurityZoneType2[SecurityZoneType2["PANEL"] = 105] = "PANEL";
  SecurityZoneType2[SecurityZoneType2["WTTS_OR_SECONDARY"] = 106] = "WTTS_OR_SECONDARY";
  SecurityZoneType2[SecurityZoneType2["SHOCK"] = 107] = "SHOCK";
  SecurityZoneType2[SecurityZoneType2["SHOCK_SENSOR_MULTI_FUNCTION"] = 108] = "SHOCK_SENSOR_MULTI_FUNCTION";
  SecurityZoneType2[SecurityZoneType2["DOOR_BELL"] = 109] = "DOOR_BELL";
  SecurityZoneType2[SecurityZoneType2["CONTACT_MULTI_FUNCTION"] = 110] = "CONTACT_MULTI_FUNCTION";
  SecurityZoneType2[SecurityZoneType2["SMOKE_MULTI_FUNCTION"] = 111] = "SMOKE_MULTI_FUNCTION";
  SecurityZoneType2[SecurityZoneType2["TEMPERATURE_MULTI_FUNCTION"] = 112] = "TEMPERATURE_MULTI_FUNCTION";
  SecurityZoneType2[SecurityZoneType2["SHOCK_OTHERS"] = 113] = "SHOCK_OTHERS";
  SecurityZoneType2[SecurityZoneType2["OCCUPANCY_SENSOR"] = 114] = "OCCUPANCY_SENSOR";
  SecurityZoneType2[SecurityZoneType2["BLUETOOTH"] = 115] = "BLUETOOTH";
  SecurityZoneType2[SecurityZoneType2["PANEL_GLASS_BREAK"] = 116] = "PANEL_GLASS_BREAK";
  SecurityZoneType2[SecurityZoneType2["POWERG_SIREN"] = 117] = "POWERG_SIREN";
  SecurityZoneType2[SecurityZoneType2["BLUETOOTH_SPEAKER"] = 118] = "BLUETOOTH_SPEAKER";
  SecurityZoneType2[SecurityZoneType2["PANEL_MOTION"] = 119] = "PANEL_MOTION";
  SecurityZoneType2[SecurityZoneType2["ZWAVE_SIREN"] = 120] = "ZWAVE_SIREN";
  SecurityZoneType2[SecurityZoneType2["COUNT"] = 121] = "COUNT";
  return SecurityZoneType2;
})(SecurityZoneType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SecurityZoneType
});
//# sourceMappingURL=security-zone-type.enum.js.map
