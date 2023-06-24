type LanguageKeys =
    "ArmState"
    | "ArmStateDescription"
    | "ArmingDelay"
    | "ArmingDelayDescription"
    | "LastAlarmState"
    | "LastAlarmStateDescription"
    | "PanelCommand"
    | "PanelCommandDescription"
    | "RequirePin"
    | "RequirePinDescription"
    | "State"
    | "Tamper";

export const LanguagePack: Record<LanguageKeys, ioBroker.StringOrTranslated> = {
    ArmState: {
        "en": "Arm State",
        "de": "Armer Staat",
        "ru": "Arm государство",
        "pt": "Estado do braço",
        "nl": "Arm State",
        "fr": "Arm State",
        "it": "Stato",
        "es": "Estado de armas",
        "pl": "Państwo",
        "uk": "Стан зброї",
        "zh-cn": "军 国"
    },
    ArmStateDescription: {
        "en": "Indicates the partition arm state",
        "de": "Zeigt den Trennarmzustand an",
        "ru": "Указывает состояние руки раздела",
        "pt": "Indica o estado do braço da partição",
        "nl": "Dat wijst op de partitiele arm",
        "fr": "Indique l'état du bras de partition",
        "it": "Indica lo stato del braccio divisorio",
        "es": "Indica el estado del brazo de la partición",
        "pl": "Część z nich wymaga podziału ramienia państwa",
        "uk": "Повідомляє стан перегородки",
        "zh-cn": "武装部队"
    },
    ArmingDelay: {
        "en": "Arming Delay",
        "de": "Armierungsdelay",
        "ru": "Армирование задержки",
        "pt": "Delay de braço",
        "nl": "Arming Delay",
        "fr": "Relais d ' armement",
        "it": "Ritaglio d'armatura",
        "es": "Arming Delay",
        "pl": "Armię Delay",
        "uk": "Армування",
        "zh-cn": "停 职"
    },
    ArmingDelayDescription: {
        "en": "Time before arming away",
        "de": "Zeit vor dem Abwracken",
        "ru": "Время перед доспехом",
        "pt": "Tempo antes de se afastar",
        "nl": "Tijd voor de wapens",
        "fr": "Temps avant de s'armer",
        "it": "Tempo prima di armarsi via",
        "es": "Tiempo antes de armar",
        "pl": "Czas przed zawieszeniem broni",
        "uk": "Час перед обрізанням",
        "zh-cn": "停止战时"
    },
    LastAlarmState: {
        "en": "Last alarm state",
        "de": "Letzter Alarmzustand",
        "ru": "Последнее состояние тревоги",
        "pt": "Último estado de alarme",
        "nl": "Laatste alarm staat",
        "fr": "Dernière alarme",
        "it": "Ultimo stato di allarme",
        "es": "Último estado de alarma",
        "pl": "Stan alarmowy",
        "uk": "Стан сигналізації",
        "zh-cn": "令人深感震惊的国家"
    },
    LastAlarmStateDescription: {
        "en": "Indicates the last alarm state",
        "de": "Zeigt den letzten Alarmzustand an",
        "ru": "Указывает последнее состояние тревоги",
        "pt": "Indica o último estado de alarme",
        "nl": "Het laatste alarm staat",
        "fr": "Indique le dernier état d'alarme",
        "it": "Indica l'ultimo stato di allarme",
        "es": "Indica el último estado de alarma",
        "pl": "Córka ostatniego stanu alarmowego",
        "uk": "Призначає останній стан сигналізації",
        "zh-cn": "提醒最后一个震惊的国家"
    },
    PanelCommand: {
        "en": "Panel Command",
        "de": "Kommandozeile",
        "ru": "Панель Command",
        "pt": "Comando do painel",
        "nl": "Panel Commando",
        "fr": "Commandant du Groupe",
        "it": "Comando del pannello",
        "es": "Comando del Grupo",
        "pl": "Panel Command",
        "uk": "Панель Команди",
        "zh-cn": "专家小组"
    },
    PanelCommandDescription: {
        "en": "Send command to the panel",
        "de": "Befehl an das Panel senden",
        "ru": "Отправить команду в панель",
        "pt": "Enviar comando para o painel",
        "nl": "Stuur het bevel naar het paneel",
        "fr": "Envoyer la commande au panneau",
        "it": "Invia comando al pannello",
        "es": "Enviar comando al panel",
        "pl": "Send command to panel",
        "uk": "Надіслати команду в панель",
        "zh-cn": "小组成员的总结指挥"
    },
    RequirePin: {
        "en": "Require PIN",
        "de": "Erforderliche PIN",
        "ru": "Требовать PIN",
        "pt": "Exigência de PIN",
        "nl": "Verzoek PIN",
        "fr": "Nécessité de PIN",
        "it": "Richiedi PIN",
        "es": "Require PIN",
        "pl": "Require PIN (ang.)",
        "uk": "Вимагати PIN",
        "zh-cn": "D. 调查与调查"
    },
    RequirePinDescription: {
        "en": "Indicates if arming requires a pin code",
        "de": "Zeigt an, ob die Armierung einen Pincode benötigt",
        "ru": "Указывает, если доспех требует пин-код",
        "pt": "Indica se o armamento requer um código de pino",
        "nl": "Dat wijst op een bewapening",
        "fr": "Indique si l'armage nécessite un code pin",
        "it": "Indica se l'armatura richiede un codice pin",
        "es": "Indica si la armadura requiere un código de pin",
        "pl": "W przypadku gdy uzbrojenie wymaga kodu pinowego",
        "uk": "Індикатори, якщо обробка вимагає контактного коду",
        "zh-cn": "如果要做事,则必须有条目。"
    },
    State: {
        "en": "State",
        "de": "Staat",
        "ru": "Государство",
        "pt": "Estado",
        "nl": "Staats State",
        "fr": "État",
        "it": "Stato",
        "es": "Estado",
        "pl": "Państwo",
        "uk": "Стан",
        "zh-cn": "$国家"
    },
    Tamper: {
        "en": "Tamper",
        "de": "Tamper",
        "ru": "Тампере",
        "pt": "Tampão",
        "nl": "Tamper",
        "fr": "Tamper",
        "it": "Ammortizzatore",
        "es": "Tamper",
        "pl": "Tamper",
        "uk": "Тампер",
        "zh-cn": "坦佩尔"
    }
};
