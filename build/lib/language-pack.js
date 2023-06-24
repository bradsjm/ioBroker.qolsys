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
var language_pack_exports = {};
__export(language_pack_exports, {
  LanguagePack: () => LanguagePack
});
module.exports = __toCommonJS(language_pack_exports);
const LanguagePack = {
  ArmState: {
    "en": "Arm State",
    "de": "Armer Staat",
    "ru": "Arm \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u043E",
    "pt": "Estado do bra\xE7o",
    "nl": "Arm State",
    "fr": "Arm State",
    "it": "Stato",
    "es": "Estado de armas",
    "pl": "Pa\u0144stwo",
    "uk": "\u0421\u0442\u0430\u043D \u0437\u0431\u0440\u043E\u0457",
    "zh-cn": "\u519B \u56FD"
  },
  ArmStateDescription: {
    "en": "Indicates the partition arm state",
    "de": "Zeigt den Trennarmzustand an",
    "ru": "\u0423\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0440\u0443\u043A\u0438 \u0440\u0430\u0437\u0434\u0435\u043B\u0430",
    "pt": "Indica o estado do bra\xE7o da parti\xE7\xE3o",
    "nl": "Dat wijst op de partitiele arm",
    "fr": "Indique l'\xE9tat du bras de partition",
    "it": "Indica lo stato del braccio divisorio",
    "es": "Indica el estado del brazo de la partici\xF3n",
    "pl": "Cz\u0119\u015B\u0107 z nich wymaga podzia\u0142u ramienia pa\u0144stwa",
    "uk": "\u041F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u044F\u0454 \u0441\u0442\u0430\u043D \u043F\u0435\u0440\u0435\u0433\u043E\u0440\u043E\u0434\u043A\u0438",
    "zh-cn": "\u6B66\u88C5\u90E8\u961F"
  },
  ArmingDelay: {
    "en": "Arming Delay",
    "de": "Armierungsdelay",
    "ru": "\u0410\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0438",
    "pt": "Delay de bra\xE7o",
    "nl": "Arming Delay",
    "fr": "Relais d ' armement",
    "it": "Ritaglio d'armatura",
    "es": "Arming Delay",
    "pl": "Armi\u0119 Delay",
    "uk": "\u0410\u0440\u043C\u0443\u0432\u0430\u043D\u043D\u044F",
    "zh-cn": "\u505C \u804C"
  },
  ArmingDelayDescription: {
    "en": "Time before arming away",
    "de": "Zeit vor dem Abwracken",
    "ru": "\u0412\u0440\u0435\u043C\u044F \u043F\u0435\u0440\u0435\u0434 \u0434\u043E\u0441\u043F\u0435\u0445\u043E\u043C",
    "pt": "Tempo antes de se afastar",
    "nl": "Tijd voor de wapens",
    "fr": "Temps avant de s'armer",
    "it": "Tempo prima di armarsi via",
    "es": "Tiempo antes de armar",
    "pl": "Czas przed zawieszeniem broni",
    "uk": "\u0427\u0430\u0441 \u043F\u0435\u0440\u0435\u0434 \u043E\u0431\u0440\u0456\u0437\u0430\u043D\u043D\u044F\u043C",
    "zh-cn": "\u505C\u6B62\u6218\u65F6"
  },
  LastAlarmState: {
    "en": "Last alarm state",
    "de": "Letzter Alarmzustand",
    "ru": "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0442\u0440\u0435\u0432\u043E\u0433\u0438",
    "pt": "\xDAltimo estado de alarme",
    "nl": "Laatste alarm staat",
    "fr": "Derni\xE8re alarme",
    "it": "Ultimo stato di allarme",
    "es": "\xDAltimo estado de alarma",
    "pl": "Stan alarmowy",
    "uk": "\u0421\u0442\u0430\u043D \u0441\u0438\u0433\u043D\u0430\u043B\u0456\u0437\u0430\u0446\u0456\u0457",
    "zh-cn": "\u4EE4\u4EBA\u6DF1\u611F\u9707\u60CA\u7684\u56FD\u5BB6"
  },
  LastAlarmStateDescription: {
    "en": "Indicates the last alarm state",
    "de": "Zeigt den letzten Alarmzustand an",
    "ru": "\u0423\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0442\u0440\u0435\u0432\u043E\u0433\u0438",
    "pt": "Indica o \xFAltimo estado de alarme",
    "nl": "Het laatste alarm staat",
    "fr": "Indique le dernier \xE9tat d'alarme",
    "it": "Indica l'ultimo stato di allarme",
    "es": "Indica el \xFAltimo estado de alarma",
    "pl": "C\xF3rka ostatniego stanu alarmowego",
    "uk": "\u041F\u0440\u0438\u0437\u043D\u0430\u0447\u0430\u0454 \u043E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0441\u0442\u0430\u043D \u0441\u0438\u0433\u043D\u0430\u043B\u0456\u0437\u0430\u0446\u0456\u0457",
    "zh-cn": "\u63D0\u9192\u6700\u540E\u4E00\u4E2A\u9707\u60CA\u7684\u56FD\u5BB6"
  },
  PanelCommand: {
    "en": "Panel Command",
    "de": "Kommandozeile",
    "ru": "\u041F\u0430\u043D\u0435\u043B\u044C Command",
    "pt": "Comando do painel",
    "nl": "Panel Commando",
    "fr": "Commandant du Groupe",
    "it": "Comando del pannello",
    "es": "Comando del Grupo",
    "pl": "Panel Command",
    "uk": "\u041F\u0430\u043D\u0435\u043B\u044C \u041A\u043E\u043C\u0430\u043D\u0434\u0438",
    "zh-cn": "\u4E13\u5BB6\u5C0F\u7EC4"
  },
  PanelCommandDescription: {
    "en": "Send command to the panel",
    "de": "Befehl an das Panel senden",
    "ru": "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043A\u043E\u043C\u0430\u043D\u0434\u0443 \u0432 \u043F\u0430\u043D\u0435\u043B\u044C",
    "pt": "Enviar comando para o painel",
    "nl": "Stuur het bevel naar het paneel",
    "fr": "Envoyer la commande au panneau",
    "it": "Invia comando al pannello",
    "es": "Enviar comando al panel",
    "pl": "Send command to panel",
    "uk": "\u041D\u0430\u0434\u0456\u0441\u043B\u0430\u0442\u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u0443 \u0432 \u043F\u0430\u043D\u0435\u043B\u044C",
    "zh-cn": "\u5C0F\u7EC4\u6210\u5458\u7684\u603B\u7ED3\u6307\u6325"
  },
  RequirePin: {
    "en": "Require PIN",
    "de": "Erforderliche PIN",
    "ru": "\u0422\u0440\u0435\u0431\u043E\u0432\u0430\u0442\u044C PIN",
    "pt": "Exig\xEAncia de PIN",
    "nl": "Verzoek PIN",
    "fr": "N\xE9cessit\xE9 de PIN",
    "it": "Richiedi PIN",
    "es": "Require PIN",
    "pl": "Require PIN (ang.)",
    "uk": "\u0412\u0438\u043C\u0430\u0433\u0430\u0442\u0438 PIN",
    "zh-cn": "D. \u8C03\u67E5\u4E0E\u8C03\u67E5"
  },
  RequirePinDescription: {
    "en": "Indicates if arming requires a pin code",
    "de": "Zeigt an, ob die Armierung einen Pincode ben\xF6tigt",
    "ru": "\u0423\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0435\u0441\u043B\u0438 \u0434\u043E\u0441\u043F\u0435\u0445 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u043F\u0438\u043D-\u043A\u043E\u0434",
    "pt": "Indica se o armamento requer um c\xF3digo de pino",
    "nl": "Dat wijst op een bewapening",
    "fr": "Indique si l'armage n\xE9cessite un code pin",
    "it": "Indica se l'armatura richiede un codice pin",
    "es": "Indica si la armadura requiere un c\xF3digo de pin",
    "pl": "W przypadku gdy uzbrojenie wymaga kodu pinowego",
    "uk": "\u0406\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0438, \u044F\u043A\u0449\u043E \u043E\u0431\u0440\u043E\u0431\u043A\u0430 \u0432\u0438\u043C\u0430\u0433\u0430\u0454 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u043E\u0433\u043E \u043A\u043E\u0434\u0443",
    "zh-cn": "\u5982\u679C\u8981\u505A\u4E8B,\u5219\u5FC5\u987B\u6709\u6761\u76EE\u3002"
  },
  State: {
    "en": "State",
    "de": "Staat",
    "ru": "\u0413\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u043E",
    "pt": "Estado",
    "nl": "Staats State",
    "fr": "\xC9tat",
    "it": "Stato",
    "es": "Estado",
    "pl": "Pa\u0144stwo",
    "uk": "\u0421\u0442\u0430\u043D",
    "zh-cn": "$\u56FD\u5BB6"
  },
  Tamper: {
    "en": "Tamper",
    "de": "Tamper",
    "ru": "\u0422\u0430\u043C\u043F\u0435\u0440\u0435",
    "pt": "Tamp\xE3o",
    "nl": "Tamper",
    "fr": "Tamper",
    "it": "Ammortizzatore",
    "es": "Tamper",
    "pl": "Tamper",
    "uk": "\u0422\u0430\u043C\u043F\u0435\u0440",
    "zh-cn": "\u5766\u4F69\u5C14"
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LanguagePack
});
//# sourceMappingURL=language-pack.js.map
