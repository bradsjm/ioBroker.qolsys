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
var interfaces_exports = {};
__export(interfaces_exports, {
  AlarmJson: () => import_alarm_json.AlarmJson,
  ArmingJson: () => import_arming_json.ArmingJson,
  ErrorJson: () => import_error_json.ErrorJson,
  PartitionJson: () => import_partition_json.PartitionJson,
  PayloadJson: () => import_payload_json.PayloadJson,
  ZoneJson: () => import_zone_json.ZoneJson
});
module.exports = __toCommonJS(interfaces_exports);
var import_alarm_json = require("./alarm-json.interface");
var import_arming_json = require("./arming-json.interface");
var import_error_json = require("./error-json.interface");
var import_partition_json = require("./partition-json.interface");
var import_payload_json = require("./payload-json.interface");
var import_zone_json = require("./zone-json.interface");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AlarmJson,
  ArmingJson,
  ErrorJson,
  PartitionJson,
  PayloadJson,
  ZoneJson
});
//# sourceMappingURL=index.js.map
