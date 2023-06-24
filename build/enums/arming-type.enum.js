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
var arming_type_enum_exports = {};
__export(arming_type_enum_exports, {
  ArmingStateType: () => ArmingStateType
});
module.exports = __toCommonJS(arming_type_enum_exports);
var ArmingStateType = /* @__PURE__ */ ((ArmingStateType2) => {
  ArmingStateType2["AWAY_EXIT_DELAY"] = "ARM-AWAY-EXIT-DELAY";
  ArmingStateType2["STAY_EXIT_DELAY"] = "ARM-STAY-EXIT-DELAY";
  ArmingStateType2["ENTRY_DELAY"] = "ENTRY_DELAY";
  ArmingStateType2["EXIT_DELAY"] = "EXIT_DELAY";
  ArmingStateType2["DISARM"] = "DISARM";
  ArmingStateType2["ARM_STAY"] = "ARM_STAY";
  ArmingStateType2["ARM_AWAY"] = "ARM_AWAY";
  return ArmingStateType2;
})(ArmingStateType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ArmingStateType
});
//# sourceMappingURL=arming-type.enum.js.map
