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
var enums_exports = {};
__export(enums_exports, {
  ActionType: () => import_action_type.ActionType,
  AlarmType: () => import_alarm_type.AlarmType,
  ArmingStateType: () => import_arming_type.ArmingStateType,
  EventType: () => import_event_type.EventType,
  InfoType: () => import_info_type.InfoType,
  SecurityZoneType: () => import_security_zone_type.SecurityZoneType,
  ZoneEventType: () => import_zone_event_type.ZoneEventType
});
module.exports = __toCommonJS(enums_exports);
var import_action_type = require("./action-type.enum");
var import_alarm_type = require("./alarm-type.enum");
var import_arming_type = require("./arming-type.enum");
var import_event_type = require("./event-type.enum");
var import_info_type = require("./info-type.enum");
var import_security_zone_type = require("./security-zone-type.enum");
var import_zone_event_type = require("./zone-event-type.enum");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActionType,
  AlarmType,
  ArmingStateType,
  EventType,
  InfoType,
  SecurityZoneType,
  ZoneEventType
});
//# sourceMappingURL=index.js.map
