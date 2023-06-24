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
var alarm_type_enum_exports = {};
__export(alarm_type_enum_exports, {
  AlarmType: () => AlarmType
});
module.exports = __toCommonJS(alarm_type_enum_exports);
var AlarmType = /* @__PURE__ */ ((AlarmType2) => {
  AlarmType2["POLICE"] = "POLICE";
  AlarmType2["FIRE"] = "FIRE";
  AlarmType2["AUX"] = "AUXILIARY";
  return AlarmType2;
})(AlarmType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AlarmType
});
//# sourceMappingURL=alarm-type.enum.js.map
