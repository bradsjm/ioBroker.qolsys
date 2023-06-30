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
var countdown_timer_exports = {};
__export(countdown_timer_exports, {
  CountdownTimer: () => CountdownTimer
});
module.exports = __toCommonJS(countdown_timer_exports);
var import_events = require("events");
class CountdownTimer extends import_events.EventEmitter {
  constructor() {
    super();
    this._countdownSeconds = this._remainingTime = 0;
  }
  get countdownSeconds() {
    return this._countdownSeconds;
  }
  get payload() {
    return this._payload;
  }
  get remainingTime() {
    return this._remainingTime;
  }
  get isRunning() {
    return this.intervalId !== void 0;
  }
  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = void 0;
      this.emit("paused", this._payload);
    }
  }
  resume() {
    if (!this.intervalId && this._remainingTime > 0) {
      this.intervalId = setInterval(this.countdown.bind(this), 1e3);
      this.emit("resumed", this._payload);
    }
  }
  start(seconds, payload) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this._remainingTime = this._countdownSeconds = seconds;
    if (payload) {
      this._payload = payload;
    }
    this._remainingTime = this._countdownSeconds;
    this.intervalId = setInterval(this.countdown.bind(this), 1e3);
  }
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = void 0;
      this.emit("stopped", this._payload);
    }
  }
  countdown() {
    if (this._remainingTime >= 0) {
      this.emit("countdown", this._remainingTime, this._payload);
      this._remainingTime--;
    } else {
      this.stop();
      this.emit("completed", this._payload);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CountdownTimer
});
//# sourceMappingURL=countdown-timer.js.map
