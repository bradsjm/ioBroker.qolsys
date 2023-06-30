"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var utils = __toESM(require("@iobroker/adapter-core"));
var import_enums = require("./enums");
var import_qolsys_event_parser = require("./lib/qolsys-event-parser");
var import_qolsys_panel_client = require("./lib/qolsys-panel-client");
var import_utils = require("./lib/utils");
var import_language_pack = require("./lib/language-pack");
var import_events = require("events");
class QolsysPanel extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "qolsys"
    });
    import_events.EventEmitter.captureRejections = true;
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async OnPanelError(error) {
    const errorType = (0, import_utils.convertToTitleCase)(error.error_type.toLowerCase());
    const value = `${errorType}: ${error.description} (Partition ${error.partition_id + 1}) `;
    this.log.error(value);
    await this.setStateChangedAsync("panel.lastError", { val: value, ack: true });
  }
  async createPartitionObjects(id, partition) {
    await this.createChannelAsync("panel", id, { name: partition.name });
    await this.createStateAsync("panel", id, "command", {
      name: import_language_pack.LanguagePack.PanelCommand,
      desc: import_language_pack.LanguagePack.PanelCommandDescription,
      type: "string",
      states: {
        "ARM_AWAY": "Arm Away",
        "ARM_AWAY_INSTANT": "Arm Away (Instant)",
        "ARM_STAY": "Arm Stay",
        "DISARM": "Disarm",
        "AUXILIARY": "Auxiliary Alarm",
        "FIRE": "Fire Alarm",
        "POLICE": "Police Alarm",
        "NOP": "None"
      },
      role: "value",
      read: false,
      write: true,
      def: "NOP"
    }, { partition_id: partition.partition_id });
    await this.createStateAsync("panel", id, "alarmState", {
      name: import_language_pack.LanguagePack.LastAlarmState,
      desc: import_language_pack.LanguagePack.LastAlarmStateDescription,
      type: "string",
      states: {
        "AUXILIARY": "Auxiliary",
        "FIRE": "Fire",
        "POLICE": "Police",
        "NONE": "None"
      },
      role: "indicator.alarm",
      read: true,
      write: false,
      def: "NONE"
    });
    await this.createStateAsync("panel", id, "armDelay", {
      name: import_language_pack.LanguagePack.ArmingDelay,
      desc: import_language_pack.LanguagePack.ArmingDelayDescription,
      type: "number",
      min: 0,
      unit: "sec",
      role: "value.interval",
      read: true,
      write: true,
      def: 60
    });
    await this.createStateAsync("panel", id, "armState", {
      name: import_language_pack.LanguagePack.ArmState,
      desc: import_language_pack.LanguagePack.ArmStateDescription,
      type: "string",
      states: {
        "ARM-AWAY-EXIT-DELAY": "Exit Delay (Away)",
        "ARM-AWAY-ENTRY-DELAY": "Entry Delay (Away)",
        "ENTRY_DELAY": "Entry Delay",
        "EXIT_DELAY": "Exit Delay",
        "DISARM": "Disarmed",
        "ARM_STAY": "Armed Stay",
        "ARM_AWAY": "Armed Away"
      },
      role: "state",
      read: true,
      write: false,
      def: "DISARM"
    }, { partition_id: partition.partition_id });
    await this.createStateAsync("panel", id, "secureArm", {
      name: import_language_pack.LanguagePack.RequirePin,
      desc: import_language_pack.LanguagePack.RequirePinDescription,
      type: "boolean",
      role: "state",
      states: {
        "true": "Enabled",
        "false": "Disabled"
      },
      read: true,
      write: false,
      def: false
    });
    await this.subscribeStatesAsync((0, import_utils.getPath)("panel", id, "command"));
  }
  async createZoneObjects(zone, role) {
    const zoneTypeTitle = `${(0, import_utils.convertToTitleCase)(zone.type)} (${zone.group})`;
    await this.setObjectAsync(`zones.${zone.id}`, {
      type: "state",
      common: {
        name: zone.name,
        desc: zoneTypeTitle,
        type: "boolean",
        states: {
          "true": "Open",
          "false": "Closed"
        },
        role,
        read: true,
        write: false,
        def: false
      },
      native: {
        group: zone.group,
        partition_id: zone.partition_id,
        zone_alarm_type: zone.zone_alarm_type,
        zone_id: zone.zone_id,
        zone_physical_type: zone.zone_physical_type
      }
    });
  }
  async getPartitionArmState(partition_id) {
    const id = `partition${partition_id + 1}`;
    const armStateId = (0, import_utils.getPath)("panel", id, "armState");
    const armState = await this.getStateAsync(armStateId);
    return typeof (armState == null ? void 0 : armState.val) === "string" ? armState == null ? void 0 : armState.val : void 0;
  }
  async getPartitionarmDelay(partition_id) {
    const id = `partition${partition_id + 1}`;
    const delayId = (0, import_utils.getPath)("panel", id, "armDelay");
    const delayState = await this.getStateAsync(delayId);
    return typeof (delayState == null ? void 0 : delayState.val) === "number" ? delayState == null ? void 0 : delayState.val : void 0;
  }
  async onAlarm(alarm) {
    var _a;
    const id = `partition${alarm.partition_id + 1}`;
    this.log.info(`triggering ${alarm.alarm_type} alarm on ${id}`);
    await this.setStateChangedAsync((0, import_utils.getPath)("panel", id, "alarmState"), {
      val: (_a = alarm.alarm_type) != null ? _a : "NONE",
      ack: true
    });
  }
  async onArmingChange(arming) {
    var _a;
    const id = `partition${arming.partition_id + 1}`;
    this.log.info(`arming state now ${arming.arming_type} on ${id} (delay: ${(_a = arming.delay) != null ? _a : "n/a"})`);
    await this.setStateChangedAsync((0, import_utils.getPath)("panel", id, "armState"), {
      val: arming.arming_type,
      ack: true
    });
    if (arming.delay != null) {
      await this.setStateChangedAsync((0, import_utils.getPath)("panel", id, "armDelay"), {
        val: arming.delay,
        ack: true
      });
    }
  }
  async onCommand(partition_id, value) {
    const panel = this.panel;
    if (!panel) {
      return;
    }
    const armState = await this.getPartitionArmState(partition_id);
    if (value !== import_enums.ArmingStateType.DISARM && armState !== import_enums.ArmingStateType.DISARM) {
      this.log.info(`disarming partition ${partition_id + 1} prior to arming`);
      await panel.disarm(partition_id, this.config.userPinCode);
    }
    switch (value) {
      case "ARM_AWAY_INSTANT":
        this.log.info(`arming away partition ${partition_id + 1} with no delay`);
        await panel.armAway(partition_id, 0);
        break;
      case import_enums.ArmingStateType.ARM_AWAY:
        const delay = await this.getPartitionarmDelay(partition_id);
        this.log.info(`arming away partition ${partition_id + 1} with delay ${delay}`);
        await panel.armAway(partition_id, delay);
        break;
      case import_enums.ArmingStateType.ARM_STAY:
        this.log.info(`arming stay partition ${partition_id + 1}`);
        await panel.armStay(partition_id);
        break;
      case import_enums.ArmingStateType.DISARM:
        this.log.info(`disarming partition ${partition_id + 1}`);
        await panel.disarm(partition_id);
        break;
      case import_enums.AlarmType.FIRE:
      case import_enums.AlarmType.POLICE:
      case import_enums.AlarmType.AUX:
        await panel.trigger(partition_id, value);
        break;
      default:
        this.log.warn(`unknown command ${value} on partition ${partition_id + 1}`);
        break;
    }
  }
  async onPanelConnect() {
    var _a;
    await this.setOnlineStatus(true);
    await ((_a = this.panel) == null ? void 0 : _a.requestSummary());
  }
  async onPanelDisconnect() {
    await this.setOnlineStatus(false);
  }
  async onPanelError(error) {
    this.log.error(error.message);
    await this.setStateChangedAsync("panel.lastError", { val: error.message, ack: true });
  }
  async onReady() {
    await this.setOnlineStatus(false);
    if (!this.config.host || !this.config.port || !this.config.secureToken) {
      this.log.error("please set host, port and secure token in the instance settings");
      return;
    }
    this.eventParser = new import_qolsys_event_parser.QolsysEventParser(this.log);
    this.eventParser.on("arming", this.onArmingChange.bind(this));
    this.eventParser.on("alarm", this.onAlarm.bind(this));
    this.eventParser.on("error", this.OnPanelError.bind(this));
    this.eventParser.on("partition", this.onReceivePartition.bind(this));
    this.eventParser.on("secureArm", this.onSecureArmChange.bind(this));
    this.eventParser.on("zone", this.onReceivedZone.bind(this));
    this.panel = new import_qolsys_panel_client.QolsysPanelClient(this.log, this.config);
    this.panel.on("close", this.onPanelDisconnect.bind(this));
    this.panel.on("connect", this.onPanelConnect.bind(this));
    this.panel.on("data", this.eventParser.parseEventPayload.bind(this.eventParser));
    this.panel.on("error", this.log.error.bind(this));
    this.panel.connect();
  }
  async onReceivePartition(partition) {
    this.log.debug(`received partition #${partition.partition_id} (${partition.name})`);
    const id = `partition${partition.partition_id + 1}`;
    await this.createPartitionObjects(id, partition);
    await this.onArmingChange({ partition_id: partition.partition_id, arming_type: partition.status });
    await this.onSecureArmChange(partition);
  }
  async onReceivedZone(zone, event) {
    const role = (0, import_utils.getZoneRole)(zone);
    if (!role) {
      return;
    }
    const stateId = `zones.${zone.id}`;
    if (event === "delete") {
      this.log.info(`removing zone ${zone.id} (${zone.name})`);
      await this.deleteStateAsync(stateId);
      return;
    }
    await this.createZoneObjects(zone, role);
    this.log.debug(`setting zone #${zone.zone_id} (${zone.name}) to ${zone.status}`);
    const isOpen = zone.status === "Open";
    await this.setStateChangedAsync(stateId, { val: isOpen, ack: true });
    await this.updatePartitionFaultState(zone.partition_id);
  }
  async onSecureArmChange(partition) {
    const id = `partition${partition.partition_id + 1}`;
    const secureArmId = (0, import_utils.getPath)("panel", id, "secureArm");
    await this.setStateChangedAsync(secureArmId, { val: partition.secure_arm, ack: true });
  }
  async onStateChange(id, state) {
    if (!state || state.ack || !this.panel || state.val == null)
      return;
    const object = await this.getForeignObjectAsync(id);
    const partition_id = object == null ? void 0 : object.native.partition_id;
    if (typeof partition_id === "number" && typeof state.val === "string") {
      this.log.debug(`received command ${state.val} for partition ${partition_id}`);
      await this.onCommand(partition_id, state.val);
    }
  }
  onUnload(callback) {
    var _a;
    try {
      (_a = this.eventParser) == null ? void 0 : _a.removeAllListeners();
      if (this.panel) {
        this.panel.autoReconnect = false;
        this.panel.removeAllListeners();
        this.panel.disconnect();
      }
    } finally {
      this.log.info("shutting down");
      callback();
    }
  }
  async setOnlineStatus(online) {
    await this.setStateAsync("info.connection", { val: online, ack: true });
  }
  async updatePartitionFaultState(partitionId) {
    await this.createStateAsync("panel", `partition${partitionId + 1}`, "isFaulted", {
      name: {
        "en": "Is Faulted",
        "de": "Ist fehlgeschlagen",
        "ru": "\u041D\u0435\u0438\u0441\u043F\u0440\u0430\u0432\u0435\u043D",
        "pt": "\xC9 falhado",
        "nl": "Is Faulted",
        "fr": "Est d\xE9fectueux",
        "it": "E' inadeguato",
        "es": "Es culpado",
        "pl": "Is Faulted",
        "uk": "\u0404 \u0417\u0430 \u0437\u0430\u043C\u043E\u0432\u0447\u0443\u0432\u0430\u043D\u043D\u044F\u043C",
        "zh-cn": "I.Fault"
      },
      desc: {
        "en": "Indicates if any partition zones are Open",
        "de": "Gibt an, ob Partitionszonen offen sind",
        "ru": "\u0423\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0435\u0441\u043B\u0438 \u043A\u0430\u043A\u0438\u0435-\u043B\u0438\u0431\u043E \u0437\u043E\u043D\u044B \u0440\u0430\u0437\u0434\u0435\u043B\u043E\u0432 \u043E\u0442\u043A\u0440\u044B\u0442\u044B",
        "pt": "Indica se quaisquer zonas de parti\xE7\xE3o s\xE3o abertas",
        "nl": "Indicatie als er partitiezones open zijn",
        "fr": "Indique si toutes les zones de partition sont ouvertes",
        "it": "Indica se le zone di partizione sono aperte",
        "es": "Indica si hay zonas de partici\xF3n abiertas",
        "pl": "Je\u015Bli ka\u017Cda strefa podzia\u0142u jest otwarta",
        "uk": "\u0406\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0438, \u044F\u043A\u0449\u043E \u0432\u0456\u0434\u043A\u0440\u0438\u0442\u0456 \u0431\u0443\u0434\u044C-\u044F\u043A\u0456 \u0440\u043E\u0437\u0434\u0456\u043B\u0438",
        "zh-cn": "\u8BF4\u660E\u4EFB\u4F55\u5730\u533A\u5747\u53EF\u8FDB\u5165"
      },
      type: "boolean",
      role: "state",
      states: {
        "true": "Faulted",
        "false": "Secure"
      },
      read: true,
      write: false
    });
    if (this.eventParser) {
      const isFaulted = this.eventParser.isFaulted(partitionId);
      if (isFaulted != void 0) {
        const id = `panel.partition${partitionId + 1}.isFaulted`;
        await this.setStateChangedAsync(id, { val: isFaulted, ack: true });
      }
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new QolsysPanel(options);
} else {
  (() => new QolsysPanel())();
}
//# sourceMappingURL=main.js.map
