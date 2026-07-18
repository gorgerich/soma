/**
 * Domain model for the symptom check-in flow.
 * Internal identifiers stay in English; users only ever see the Russian
 * labels from `copy.ru.ts`.
 */

import type { AnatomyRegionId } from "../anatomy/anatomy-types";

export type BodySide = "front" | "back";

export type BodyRegionId = AnatomyRegionId;

export type SensationType =
  | "sharp"
  | "dull"
  | "burning"
  | "pressing"
  | "pulsating"
  | "cramping"
  | "tingling"
  | "numbness"
  | "hardToDescribe";

export type OnsetPreset =
  | "justNow"
  | "today"
  | "yesterday"
  | "fewDaysAgo"
  | "overAWeekAgo"
  | "customDate";

export type OnsetPattern = "sudden" | "gradual" | "unsure";

export type FrequencyPattern =
  | "constant"
  | "comesAndGoes"
  | "onMovement"
  | "unsure";

export type Progression = "improving" | "unchanged" | "worsening" | "unsure";

export type EpisodeStatus = "active" | "resolved";

export type SymptomEpisode = {
  id: string;
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
  region: BodyRegionId;
  bodySide: BodySide;
  severity: number;
  sensations: SensationType[];
  freeText?: string;
  onsetPreset: OnsetPreset;
  onsetDate?: string;
  onsetPattern: OnsetPattern;
  frequencyPattern: FrequencyPattern;
  progression: Progression;
  status: EpisodeStatus;
};

export type CityId = "moscow" | "spb" | "other";

export type Settings = {
  schemaVersion: 1;
  city: CityId | null;
};

export const SENSATIONS: SensationType[] = [
  "sharp",
  "dull",
  "burning",
  "pressing",
  "pulsating",
  "cramping",
  "tingling",
  "numbness",
  "hardToDescribe",
];

export const ONSET_PRESETS: OnsetPreset[] = [
  "justNow",
  "today",
  "yesterday",
  "fewDaysAgo",
  "overAWeekAgo",
  "customDate",
];

export const ONSET_PATTERNS: OnsetPattern[] = ["sudden", "gradual", "unsure"];

export const FREQUENCY_PATTERNS: FrequencyPattern[] = [
  "constant",
  "comesAndGoes",
  "onMovement",
  "unsure",
];

export const PROGRESSIONS: Progression[] = [
  "improving",
  "unchanged",
  "worsening",
  "unsure",
];

export const FREE_TEXT_LIMIT = 500;

export const MAX_SEVERITY = 10;
