import type {
  BodySide,
  FrequencyPattern,
  OnsetPattern,
  OnsetPreset,
  Progression,
  SensationType,
} from "./model";

/**
 * All user-facing Russian copy for the check-in flow, in one place.
 * « » — non-breaking space.
 */
export const copy = {
  appName: "Soma",
  appTagline: "Дневник самочувствия",

  nav: {
    home: "Главная",
    history: "История",
    settings: "Настройки",
  },

  region: {
    title: "Где болит?",
    subtitle: "Нажмите на область, которая вас беспокоит.",
    selectedPrefix: "Выбранная область",
    lowerBack: "Поясница",
    selectedState: "Выбранная область — поясница",
    nothingSelected: "Область пока не выбрана",
    tapAgainToClear: "Нажмите ещё раз, чтобы убрать выбор",
    selectLowerBack: "Выбрать поясницу",
    clearLowerBack: "Убрать выбор поясницы",
    describeInstead: "Описать словами",
    describeInsteadNote:
      "Пока можно отметить только поясницу. Если беспокоит другое место, опишите его словами на следующих шагах.",
    bodyLabelBack: "Тело, вид сзади",
    bodyLabelFront: "Тело, вид спереди",
  },

  sides: {
    front: "Спереди",
    back: "Сзади",
  } satisfies Record<BodySide, string>,

  severity: {
    title: "Насколько сильно болит сейчас?",
    sliderLabel: "Интенсивность боли от 0 до 10",
    outOfTen: "из 10",
    decrease: "Уменьшить",
    increase: "Увеличить",
    sensationsTitle: "Как ощущается боль?",
    sensationsHint: "Можно выбрать несколько вариантов.",
    freeTextLabel: "Описать своими словами",
    freeTextPlaceholder: "Например: тянет с утра и отдаёт в ногу…",
    charsLeft: (n: number) => `Осталось символов: ${n}`,
  },

  severityLabels: {
    none: "Не болит",
    mild: "Слабо",
    moderate: "Умеренно",
    severe: "Сильно",
    verySevere: "Очень сильно",
  },

  sensations: {
    sharp: "Острая",
    dull: "Тупая",
    burning: "Жгучая",
    pressing: "Давящая",
    pulsating: "Пульсирующая",
    cramping: "Схваткообразная",
    tingling: "Покалывание",
    numbness: "Онемение",
    hardToDescribe: "Сложно описать",
  } satisfies Record<SensationType, string>,

  timing: {
    title: "Когда это началось?",
    customDateLabel: "Дата начала",
    onsetPatternTitle: "Как началось?",
    frequencyTitle: "Боль постоянная?",
    progressionTitle: "Как меняется состояние?",
  },

  onsetPresets: {
    justNow: "Только что",
    today: "Сегодня",
    yesterday: "Вчера",
    fewDaysAgo: "Несколько дней назад",
    overAWeekAgo: "Больше недели назад",
    customDate: "Выбрать дату",
  } satisfies Record<OnsetPreset, string>,

  onsetPatterns: {
    sudden: "Внезапно",
    gradual: "Постепенно",
    unsure: "Сложно сказать",
  } satisfies Record<OnsetPattern, string>,

  frequencyPatterns: {
    constant: "Постоянная",
    comesAndGoes: "Появляется и проходит",
    onMovement: "Только при определённых движениях",
    unsure: "Сложно сказать",
  } satisfies Record<FrequencyPattern, string>,

  progressions: {
    improving: "Становится легче",
    unchanged: "Без изменений",
    worsening: "Становится сильнее",
    unsure: "Сложно сказать",
  } satisfies Record<Progression, string>,

  review: {
    title: "Вот что вы описали",
    region: "Область",
    bodySide: "Сторона тела",
    sideBack: "сзади",
    sideFront: "спереди",
    severity: "Интенсивность",
    sensations: "Ощущения",
    onset: "Начало",
    onsetPattern: "Характер начала",
    frequency: "Периодичность",
    progression: "Динамика",
    freeText: "Ваше описание",
    edit: "Изменить",
    notADiagnosis: "Это описание ваших ощущений, а не диагноз.",
    save: "Сохранить запись",
    startOver: "Начать заново",
  },

  saved: {
    title: "Запись сохранена",
    subtitle: "Она хранится только в этом браузере и не отправляется на сервер.",
    open: "Открыть запись",
    history: "Посмотреть историю",
    startNew: "Начать новую запись",
  },

  home: {
    title: "Как вы себя чувствуете?",
    latestEpisode: "Последняя запись",
    update: "Обновить состояние",
    startNew: "Начать новую запись",
    severityShort: (n: number) => `${n} из 10`,
  },

  history: {
    title: "История",
    empty: "Здесь появятся сохранённые записи о самочувствии.",
    createFirst: "Создать первую запись",
    open: "Открыть",
    close: "Свернуть",
    edit: "Изменить",
    duplicate: "Повторить как новую",
    remove: "Удалить",
    confirmDelete: "Удалить эту запись? Действие нельзя отменить.",
  },

  settings: {
    title: "Настройки",
    cityTitle: "Город",
    cityHint: "Необязательно. Поможет в будущем подсказывать, куда обратиться.",
    cityNone: "Не выбран",
    cities: {
      moscow: "Москва",
      spb: "Санкт-Петербург",
      other: "Другой город",
    },
    dataTitle: "Данные",
    dataNote: "Ваши записи хранятся только в этом браузере.",
    exportAction: "Экспортировать мои записи",
    deleteAll: "Удалить все записи",
    confirmDeleteAll:
      "Удалить все сохранённые записи из этого браузера? Действие нельзя отменить.",
    emergencyTitle: "Экстренная помощь",
    emergencyText:
      "Если состояние резко ухудшилось или есть угроза жизни, позвоните по номеру 112.",
    emergencyCall: "Позвонить 112",
    aboutTitle: "О приложении",
    aboutText:
      "Soma помогает структурировать описание самочувствия. Приложение не ставит диагнозы и не заменяет врача.",
  },

  common: {
    next: "Продолжить",
    back: "Назад",
    stepOf: (n: number, total: number) => `Шаг ${n} из ${total}`,
  },
} as const;

/** Plain-language label for a 0–10 severity value. */
export function severityLabel(value: number): string {
  if (value <= 0) return copy.severityLabels.none;
  if (value <= 3) return copy.severityLabels.mild;
  if (value <= 6) return copy.severityLabels.moderate;
  if (value <= 8) return copy.severityLabels.severe;
  return copy.severityLabels.verySevere;
}
