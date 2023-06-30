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
var qolsys_event_parser_exports = {};
__export(qolsys_event_parser_exports, {
  QolsysEventParser: () => QolsysEventParser
});
module.exports = __toCommonJS(qolsys_event_parser_exports);
var import_events = require("events");
var import_enums = require("../enums");
var import_countdown_timer = require("./countdown-timer");
class QolsysEventParser extends import_events.EventEmitter {
  constructor(logger) {
    super();
    this.countdown = new import_countdown_timer.CountdownTimer();
    this._partitions = [];
    this.log = logger;
    this.countdown.on("countdown", this.onCountdown.bind(this));
    this.countdown.on("stopped", this.onCountdownStopped.bind(this));
  }
  get partitions() {
    return this._partitions;
  }
  isFaulted(partitionId) {
    const partition = this.partitions.find((partition2) => partition2.partition_id === partitionId);
    return partition == null ? void 0 : partition.zone_list.some((zone) => zone.status === "Open");
  }
  parseEventPayload(payload) {
    switch (payload.event) {
      case import_enums.EventType.INFO:
        this.handleInfoEvent(payload);
        break;
      case import_enums.EventType.ZONE:
        this.handleZone(payload);
        break;
      case import_enums.EventType.ARMING:
        this.handleArmingEvent(payload);
        break;
      case import_enums.EventType.ALARM:
        this.handleAlarmEvent(payload);
        break;
      case import_enums.EventType.ERROR:
        this.handleErrorEvent(payload);
        break;
      default:
        this.log.warn("unknown event type: " + JSON.stringify(payload));
        break;
    }
  }
  handleAlarmEvent(payload) {
    if (payload.alarm_type != null && payload.partition_id != null) {
      const event = {
        alarm_type: payload.alarm_type,
        partition_id: payload.partition_id
      };
      this.emit("alarm", event);
    }
  }
  handleArmingEvent(payload) {
    if (payload.arming_type != null && payload.partition_id != null) {
      const event = {
        arming_type: payload.arming_type,
        partition_id: payload.partition_id,
        delay: payload.delay
      };
      if (event.delay != null) {
        this.countdown.start(event.delay, event);
        return;
      } else if (this.countdown.isRunning) {
        this.countdown.stop();
      }
      this.emit("arming", event);
    } else {
      this.log.warn("unknown ARMING event: " + JSON.stringify(payload));
    }
  }
  handleErrorEvent(payload) {
    if (payload.error_type != null && payload.description != null && payload.partition_id != null) {
      const event = {
        description: payload.description,
        error_type: payload.error_type,
        partition_id: payload.partition_id
      };
      this.emit("error", event);
    } else {
      this.log.warn("unknown ERROR event: " + JSON.stringify(payload));
    }
  }
  handleInfoEvent(payload) {
    switch (payload.info_type) {
      case import_enums.InfoType.SUMMARY:
        this.handleSummaryInfo(payload);
        break;
      case import_enums.InfoType.SECURE_ARM:
        this.handleSecureArmInfo(payload);
        break;
      default:
        this.log.warn("unknown INFO type: " + payload.info_type);
        break;
    }
  }
  handlePartitionInfo(partitions) {
    partitions.forEach((partition) => {
      this.emit("partition", partition);
    });
    partitions.forEach((partition) => {
      partition.zone_list.forEach((zone) => {
        this.emit("zone", zone, "info");
      });
    });
  }
  handleSecureArmInfo(payload) {
    if (typeof payload.value === "boolean" && payload.partition_id) {
      this.emit("secureArm", {
        partition_id: payload.partition_id,
        secureArm: payload.value
      });
    } else {
      this.log.warn("unknown secureArm event: " + JSON.stringify(payload));
    }
  }
  handleSummaryInfo(payload) {
    this.log.debug("summary: " + JSON.stringify(payload));
    if (payload.partition_list) {
      this._partitions = payload.partition_list;
      this.handlePartitionInfo(payload.partition_list);
    } else {
      this.log.warn("unknown partition event: " + JSON.stringify(payload));
    }
  }
  handleZone(payload) {
    if (payload.zone) {
      switch (payload.zone_event_type) {
        case import_enums.ZoneEventType.ZONE_ACTIVE:
          this.handleZoneActive(payload.zone);
          break;
        case import_enums.ZoneEventType.ZONE_ADD:
        case import_enums.ZoneEventType.ZONE_UPDATE:
          this.handleZoneUpdate(payload.zone);
          break;
        case import_enums.ZoneEventType.ZONE_DELETE:
          this.handleZoneDelete(payload.zone);
          break;
        default:
          this.log.warn("unknown zone event type: " + JSON.stringify(payload));
          break;
      }
    }
  }
  handleZoneActive(payload) {
    this.log.debug("zone active: " + JSON.stringify(payload));
    if (!this._partitions.some((partition) => {
      return partition.zone_list.some((zone) => {
        if (zone.zone_id === payload.zone_id) {
          this.emit("zone", Object.assign(zone, payload), "active");
          return true;
        }
        return false;
      });
    })) {
      this.log.warn("zone not found: " + JSON.stringify(payload));
    }
  }
  handleZoneDelete(payload) {
    this.log.debug("zone delete: " + JSON.stringify(payload));
    this._partitions = this._partitions.map((partition) => {
      const updatedPartition = { ...partition };
      updatedPartition.zone_list = updatedPartition.zone_list.filter((z) => z.zone_id !== payload.zone_id);
      if (updatedPartition.zone_list.length < partition.zone_list.length) {
        this.emit("zone", payload, "delete");
      } else {
        this.log.debug("unable to delete zone: " + JSON.stringify(payload));
      }
      return updatedPartition;
    });
  }
  handleZoneUpdate(payload) {
    this.log.debug("zone update: " + JSON.stringify(payload));
    const partition = this._partitions.find((p) => p.partition_id === payload.partition_id);
    if (partition !== void 0) {
      const idx = partition.zone_list.findIndex((z) => z.zone_id === payload.zone_id);
      if (idx === -1) {
        partition.zone_list.push(payload);
      } else {
        partition.zone_list[idx] = payload;
      }
    }
    this.emit("zone", payload, "update");
  }
  onCountdown(seconds, payload) {
    this.emit("arming", {
      arming_type: payload.arming_type,
      partition_id: payload.partition_id,
      delay: seconds || payload.delay
    });
  }
  onCountdownStopped(payload) {
    this.emit("arming", payload);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QolsysEventParser
});
//# sourceMappingURL=qolsys-event-parser.js.map
