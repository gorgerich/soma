import {
  FREE_TEXT_LIMIT,
  MAX_SEVERITY,
  type BodyRegionId,
  type BodySide,
  type FrequencyPattern,
  type OnsetPattern,
  type OnsetPreset,
  type Progression,
  type SensationType,
  type SymptomEpisode,
} from "./model";

export type CheckInStep = "region" | "severity" | "timing" | "review" | "saved";

export const STEP_ORDER: CheckInStep[] = [
  "region",
  "severity",
  "timing",
  "review",
];

export type CheckInState = {
  step: CheckInStep;
  /** When editing a single step from the review screen, Next returns there. */
  returnToReview: boolean;
  /** Episode id when the flow edits an existing record. */
  editingEpisodeId: string | null;
  bodySide: BodySide;
  region: BodyRegionId | null;
  severity: number;
  sensations: SensationType[];
  freeText: string;
  onsetPreset: OnsetPreset | null;
  onsetDate: string | null;
  onsetPattern: OnsetPattern | null;
  frequencyPattern: FrequencyPattern | null;
  progression: Progression | null;
  savedEpisode: SymptomEpisode | null;
};

export type CheckInAction =
  | { type: "SET_BODY_SIDE"; side: BodySide }
  | { type: "SELECT_REGION"; region: BodyRegionId }
  | { type: "CLEAR_REGION" }
  | { type: "TOGGLE_REGION"; region: BodyRegionId }
  | { type: "SET_SEVERITY"; value: number }
  | { type: "TOGGLE_SENSATION"; sensation: SensationType }
  | { type: "SET_FREE_TEXT"; text: string }
  | { type: "SET_ONSET"; preset: OnsetPreset; date?: string }
  | { type: "SET_ONSET_DATE"; date: string }
  | { type: "SET_ONSET_PATTERN"; pattern: OnsetPattern }
  | { type: "SET_FREQUENCY"; pattern: FrequencyPattern }
  | { type: "SET_PROGRESSION"; progression: Progression }
  | { type: "GO_NEXT" }
  | { type: "GO_BACK" }
  | { type: "EDIT_STEP"; step: CheckInStep }
  | { type: "RESET" }
  | { type: "LOAD_EPISODE"; episode: SymptomEpisode }
  | { type: "MARK_SAVED"; episode: SymptomEpisode };

export const initialCheckInState: CheckInState = {
  step: "region",
  returnToReview: false,
  editingEpisodeId: null,
  bodySide: "back",
  region: null,
  severity: 5,
  sensations: [],
  freeText: "",
  onsetPreset: null,
  onsetDate: null,
  onsetPattern: null,
  frequencyPattern: null,
  progression: null,
  savedEpisode: null,
};

/** Whether the current step's required answers are complete. */
export function canGoNext(state: CheckInState): boolean {
  switch (state.step) {
    case "region":
      return state.region !== null;
    case "severity":
      return true;
    case "timing":
      return (
        state.onsetPreset !== null &&
        (state.onsetPreset !== "customDate" || state.onsetDate !== null) &&
        state.onsetPattern !== null &&
        state.frequencyPattern !== null &&
        state.progression !== null
      );
    case "review":
    case "saved":
      return false;
  }
}

/** Builds the episode payload from completed flow state. */
export function buildEpisode(
  state: CheckInState,
  now: Date = new Date(),
): SymptomEpisode | null {
  if (
    state.region === null ||
    state.onsetPreset === null ||
    state.onsetPattern === null ||
    state.frequencyPattern === null ||
    state.progression === null
  ) {
    return null;
  }
  const timestamp = now.toISOString();
  const freeText = state.freeText.trim();
  return {
    id: state.editingEpisodeId ?? cryptoRandomId(),
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    region: state.region,
    bodySide: state.bodySide,
    severity: state.severity,
    sensations: [...state.sensations],
    ...(freeText.length > 0 ? { freeText } : {}),
    onsetPreset: state.onsetPreset,
    ...(state.onsetPreset === "customDate" && state.onsetDate
      ? { onsetDate: state.onsetDate }
      : {}),
    onsetPattern: state.onsetPattern,
    frequencyPattern: state.frequencyPattern,
    progression: state.progression,
    status: "active",
  };
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ep-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function checkInReducer(
  state: CheckInState,
  action: CheckInAction,
): CheckInState {
  switch (action.type) {
    case "SET_BODY_SIDE":
      return { ...state, bodySide: action.side };

    case "SELECT_REGION":
      return { ...state, region: action.region };

    case "CLEAR_REGION":
      return { ...state, region: null };

    case "TOGGLE_REGION":
      return {
        ...state,
        region: state.region === action.region ? null : action.region,
      };

    case "SET_SEVERITY": {
      const value = Math.min(MAX_SEVERITY, Math.max(0, Math.round(action.value)));
      return { ...state, severity: value };
    }

    case "TOGGLE_SENSATION": {
      const has = state.sensations.includes(action.sensation);
      return {
        ...state,
        sensations: has
          ? state.sensations.filter((s) => s !== action.sensation)
          : [...state.sensations, action.sensation],
      };
    }

    case "SET_FREE_TEXT":
      return { ...state, freeText: action.text.slice(0, FREE_TEXT_LIMIT) };

    case "SET_ONSET":
      return {
        ...state,
        onsetPreset: action.preset,
        onsetDate:
          action.preset === "customDate" ? (action.date ?? state.onsetDate) : null,
      };

    case "SET_ONSET_DATE":
      return { ...state, onsetDate: action.date, onsetPreset: "customDate" };

    case "SET_ONSET_PATTERN":
      return { ...state, onsetPattern: action.pattern };

    case "SET_FREQUENCY":
      return { ...state, frequencyPattern: action.pattern };

    case "SET_PROGRESSION":
      return { ...state, progression: action.progression };

    case "GO_NEXT": {
      if (!canGoNext(state)) return state;
      if (state.returnToReview) {
        return { ...state, step: "review", returnToReview: false };
      }
      const index = STEP_ORDER.indexOf(state.step);
      const next = STEP_ORDER[index + 1];
      return next ? { ...state, step: next } : state;
    }

    case "GO_BACK": {
      if (state.returnToReview) {
        return { ...state, step: "review", returnToReview: false };
      }
      const index = STEP_ORDER.indexOf(state.step);
      if (index <= 0) return state;
      return { ...state, step: STEP_ORDER[index - 1] };
    }

    case "EDIT_STEP":
      return { ...state, step: action.step, returnToReview: true };

    case "RESET":
      return { ...initialCheckInState };

    case "LOAD_EPISODE": {
      const e = action.episode;
      return {
        ...initialCheckInState,
        editingEpisodeId: e.id,
        bodySide: e.bodySide,
        region: e.region,
        severity: e.severity,
        sensations: [...e.sensations],
        freeText: e.freeText ?? "",
        onsetPreset: e.onsetPreset,
        onsetDate: e.onsetDate ?? null,
        onsetPattern: e.onsetPattern,
        frequencyPattern: e.frequencyPattern,
        progression: e.progression,
        step: "review",
      };
    }

    case "MARK_SAVED":
      return { ...state, step: "saved", savedEpisode: action.episode };
  }
}
