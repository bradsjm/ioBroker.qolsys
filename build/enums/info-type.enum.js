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
var info_type_enum_exports = {};
__export(info_type_enum_exports, {
  InfoType: () => InfoType
});
module.exports = __toCommonJS(info_type_enum_exports);
var InfoType = /* @__PURE__ */ ((InfoType2) => {
  InfoType2["SUMMARY"] = "SUMMARY";
  InfoType2["SECURE_ARM"] = "SECURE_ARM";
  return InfoType2;
})(InfoType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InfoType
});
//# sourceMappingURL=info-type.enum.js.map
