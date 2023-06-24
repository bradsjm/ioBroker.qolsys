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
var event_type_enum_exports = {};
__export(event_type_enum_exports, {
  EventType: () => EventType
});
module.exports = __toCommonJS(event_type_enum_exports);
var EventType = /* @__PURE__ */ ((EventType2) => {
  EventType2["INFO"] = "INFO";
  EventType2["ZONE"] = "ZONE_EVENT";
  EventType2["ARMING"] = "ARMING";
  EventType2["ALARM"] = "ALARM";
  EventType2["ERROR"] = "ERROR";
  return EventType2;
})(EventType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EventType
});
//# sourceMappingURL=event-type.enum.js.map
