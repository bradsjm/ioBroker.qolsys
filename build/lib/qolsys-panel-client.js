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
var qolsys_panel_client_exports = {};
__export(qolsys_panel_client_exports, {
  QolsysPanelClient: () => QolsysPanelClient
});
module.exports = __toCommonJS(qolsys_panel_client_exports);
var import_events = require("events");
var import_timers = require("timers");
var import_utils = require("./utils");
var tls = __toESM(require("tls"));
var import_enums = require("../enums");
const RECONNECT_INTERVAL = 1e4;
const MAX_RECONNECT_INTERVAL = 6e4;
const PING_INTERVAL = 3e4;
class QolsysPanelClient extends import_events.EventEmitter {
  constructor(logger, config) {
    super();
    this.buffer = "";
    this.reconnectInterval = RECONNECT_INTERVAL;
    this._autoReconnect = true;
    this._lastAck = 0;
    this.config = config;
    this.log = logger;
  }
  get autoReconnect() {
    return this._autoReconnect;
  }
  set autoReconnect(value) {
    this._autoReconnect = value;
    if (!value) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = void 0;
    }
  }
  get lastAck() {
    return this._lastAck;
  }
  get isConnected() {
    var _a;
    return ((_a = this.client) == null ? void 0 : _a.readyState) === "open";
  }
  async armAway(partitionId, delay) {
    if (!this.config.enableArming) {
      this.emit("error", new Error("arming is not enabled in this adapter configuration"));
      return;
    }
    const json = {
      "action": import_enums.ActionType.ARMING,
      "arming_type": import_enums.ArmingStateType.ARM_AWAY,
      "nonce": (0, import_utils.generateNonce)(),
      "partition_id": partitionId,
      "source": "C4",
      "token": this.config.secureToken,
      "version": 1
    };
    if (delay != null) {
      json["delay"] = delay;
    }
    await this.send(json);
  }
  async armStay(partitionId) {
    if (!this.config.enableArming) {
      this.emit("error", new Error("arming is not enabled in this adapter configuration"));
      return;
    }
    const json = {
      "action": import_enums.ActionType.ARMING,
      "arming_type": import_enums.ArmingStateType.ARM_STAY,
      "nonce": (0, import_utils.generateNonce)(),
      "partition_id": partitionId,
      "source": "C4",
      "token": this.config.secureToken,
      "version": 1
    };
    await this.send(json);
  }
  connect() {
    if (this.client) {
      this.disconnect();
    }
    this.log.info(`connecting to the panel at ${this.config.host}:${this.config.port}`);
    this.client = tls.connect(this.config.port, this.config.host, {
      rejectUnauthorized: false
    });
    this.client.setEncoding("utf8");
    this.client.setNoDelay();
    this.client.on("close", this.onClose.bind(this));
    this.client.on("connect", this.onConnect.bind(this));
    this.client.on("data", this.onData.bind(this));
    this.client.on("error", (err) => this.emit("error", err));
  }
  async disarm(partitionId, userPinCode = this.config.userPinCode) {
    if (!this.config.enableDisarming) {
      this.emit("error", new Error("disarming is not enabled in this adapter configuration"));
      return;
    }
    await this.send({
      "action": import_enums.ActionType.ARMING,
      "arming_type": import_enums.ArmingStateType.DISARM,
      "usercode": userPinCode,
      "nonce": (0, import_utils.generateNonce)(),
      "partition_id": partitionId,
      "source": "C4",
      "token": this.config.secureToken,
      "version": 1
    });
  }
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = void 0;
    }
    this.buffer = "";
    if (this.client) {
      this.client.destroy();
      this.client = void 0;
    }
  }
  async requestSummary() {
    await this.send({
      "action": import_enums.ActionType.INFO,
      "info_type": import_enums.InfoType.SUMMARY,
      "nonce": (0, import_utils.generateNonce)(),
      "source": "C4",
      "token": this.config.secureToken,
      "version": 1
    });
  }
  async trigger(partitionId, alarmType) {
    if (!this.config.enableAlarms) {
      this.emit("error", new Error("alarms are not enabled in this adapter configuration"));
      return;
    }
    await this.send({
      "action": import_enums.ActionType.ALARM,
      "alarm_type": alarmType,
      "nonce": (0, import_utils.generateNonce)(),
      "partition_id": partitionId,
      "source": "C4",
      "token": this.config.secureToken,
      "version": 1
    });
  }
  onClose(hadError) {
    this.log.info(`disconnected from the panel (hadError: ${hadError})`);
    this.emit("close", hadError);
    (0, import_timers.clearInterval)(this.pingTimer);
    this.pingTimer = void 0;
    this.scheduleReconnect();
  }
  onConnect() {
    this.log.info("connected to the panel");
    this.buffer = "";
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = void 0;
    this.reconnectInterval = RECONNECT_INTERVAL;
    this.pingTimer = setInterval(this.ping.bind(this), PING_INTERVAL);
    this.emit("connect");
  }
  onData(data) {
    this.buffer = this.parse(this.buffer + data);
  }
  parse(buffer) {
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line === "ACK") {
        this.log.debug("received ACK");
        this.emit("ack");
        this._lastAck = Date.now();
        continue;
      }
      this.log.debug("received: " + line);
      try {
        const payload = JSON.parse(line);
        this.emit("data", payload);
      } catch (err) {
        if (err instanceof SyntaxError) {
          this.emit("error", new Error(`failed to parse JSON (${err.message}): ${line}`));
        }
      }
    }
    return buffer;
  }
  ping() {
    var _a;
    if (!this.isConnected || Date.now() - this._lastAck > PING_INTERVAL * 2) {
      this.disconnect();
      return;
    }
    this.log.debug(`sending ping`);
    (_a = this.client) == null ? void 0 : _a.write("\n");
  }
  scheduleReconnect() {
    if (!this._autoReconnect)
      return;
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectInterval = Math.min(this.reconnectInterval * 2, MAX_RECONNECT_INTERVAL);
        this.reconnectTimer = void 0;
        this.connect();
      }, this.reconnectInterval);
      this.log.info(`reconnecting to the panel in ${this.reconnectInterval / 1e3} seconds`);
    }
  }
  async send(data) {
    const { client } = this;
    if (!client)
      return;
    return new Promise((resolve, reject) => {
      const str = JSON.stringify(data);
      this.log.debug(`sending: ${str}`);
      client.write(str + "\n", "utf8", (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QolsysPanelClient
});
//# sourceMappingURL=qolsys-panel-client.js.map
