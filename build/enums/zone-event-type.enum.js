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
var zone_event_type_enum_exports = {};
__export(zone_event_type_enum_exports, {
  ZoneEventType: () => ZoneEventType
});
module.exports = __toCommonJS(zone_event_type_enum_exports);
var ZoneEventType = /* @__PURE__ */ ((ZoneEventType2) => {
  ZoneEventType2["ZONE_ACTIVE"] = "ZONE_ACTIVE";
  ZoneEventType2["ZONE_ADD"] = "ZONE_ADD";
  ZoneEventType2["ZONE_DELETE"] = "ZONE_DELETE";
  ZoneEventType2["ZONE_UPDATE"] = "ZONE_UPDATE";
  return ZoneEventType2;
})(ZoneEventType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ZoneEventType
});
//# sourceMappingURL=zone-event-type.enum.js.map
