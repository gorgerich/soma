import {
  FREQUENCY_PATTERNS,
  MAX_SEVERITY,
  ONSET_PATTERNS,
  ONSET_PRESETS,
  SENSATIONS,
  type CityId,
  type SensationType,
  type Settings,
  type SymptomEpisode,
} from "./model";

export const EPISODES_KEY = "soma.episodes.v1";
export const SETTINGS_KEY = "soma.settings.v1";

const CITIES: CityId[] = ["moscow", "spb", "other"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validates one stored entry; malformed data is dropped, never thrown. */
export function parseEpisode(value: unknown): SymptomEpisode | null {
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== 1) return null;
  if (typeof value.id !== "string" || value.id.length === 0) return null;
  if (typeof value.createdAt !== "string" || Number.isNaN(Date.parse(value.createdAt))) return null;
  if (typeof value.updatedAt !== "string" || Number.isNaN(Date.parse(value.updatedAt))) return null;
  if (value.region !== "lowerBack") return null;
  if (value.bodySide !== "front" && value.bodySide !== "back") return null;
  if (
    typeof value.severity !== "number" ||
    !Number.isFinite(value.severity) ||
    value.severity < 0 ||
    value.severity > MAX_SEVERITY
  ) {
    return null;
  }
  if (!Array.isArray(value.sensations)) return null;
  const sensations = value.sensations.filter((s): s is SensationType =>
    (SENSATIONS as string[]).includes(s as string),
  );
  if (!(ONSET_PRESETS as string[]).includes(value.onsetPreset as string)) return null;
  if (!(ONSET_PATTERNS as string[]).includes(value.onsetPattern as string)) return null;
  if (!(FREQUENCY_PATTERNS as string[]).includes(value.frequencyPattern as string)) return null;
  if (!["improving", "unchanged", "worsening", "unsure"].includes(value.progression as string)) return null;
  if (value.status !== "active" && value.status !== "resolved") return null;

  return {
    id: value.id,
    schemaVersion: 1,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    region: "lowerBack",
    bodySide: value.bodySide,
    severity: Math.round(value.severity),
    sensations,
    ...(typeof value.freeText === "string" && value.freeText.length > 0
      ? { freeText: value.freeText }
      : {}),
    onsetPreset: value.onsetPreset as SymptomEpisode["onsetPreset"],
    ...(typeof value.onsetDate === "string" ? { onsetDate: value.onsetDate } : {}),
    onsetPattern: value.onsetPattern as SymptomEpisode["onsetPattern"],
    frequencyPattern: value.frequencyPattern as SymptomEpisode["frequencyPattern"],
    progression: value.progression as SymptomEpisode["progression"],
    status: value.status,
  };
}

/** Parses raw storage JSON into valid episodes; invalid entries are skipped. */
export function parseEpisodeList(raw: string | null): SymptomEpisode[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .map(parseEpisode)
      .filter((e): e is SymptomEpisode => e !== null);
  } catch {
    return [];
  }
}

export function parseSettings(raw: string | null): Settings {
  const fallback: Settings = { schemaVersion: 1, city: null };
  if (!raw) return fallback;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.schemaVersion !== 1) return fallback;
    const city = (CITIES as string[]).includes(data.city as string)
      ? (data.city as CityId)
      : null;
    return { schemaVersion: 1, city };
  } catch {
    return fallback;
  }
}

/* Browser-only helpers. Never called during server rendering — components
   read storage inside effects after mount. */

function storageAvailable(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function loadEpisodes(): SymptomEpisode[] {
  if (!storageAvailable()) return [];
  return parseEpisodeList(window.localStorage.getItem(EPISODES_KEY));
}

function persistEpisodes(episodes: SymptomEpisode[]): void {
  if (!storageAvailable()) return;
  window.localStorage.setItem(EPISODES_KEY, JSON.stringify(episodes));
}

/** Inserts or updates one episode; newest first. */
export function upsertEpisode(episode: SymptomEpisode): SymptomEpisode[] {
  const existing = loadEpisodes();
  const index = existing.findIndex((e) => e.id === episode.id);
  let next: SymptomEpisode[];
  if (index >= 0) {
    const merged: SymptomEpisode = {
      ...episode,
      createdAt: existing[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    next = [...existing];
    next[index] = merged;
  } else {
    next = [episode, ...existing];
  }
  next.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  persistEpisodes(next);
  return next;
}

export function deleteEpisode(id: string): SymptomEpisode[] {
  const next = loadEpisodes().filter((e) => e.id !== id);
  persistEpisodes(next);
  return next;
}

export function deleteAllEpisodes(): void {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(EPISODES_KEY);
}

export function exportEpisodesJson(): string {
  return JSON.stringify(loadEpisodes(), null, 2);
}

export function loadSettings(): Settings {
  if (!storageAvailable()) return { schemaVersion: 1, city: null };
  return parseSettings(window.localStorage.getItem(SETTINGS_KEY));
}

export function saveSettings(settings: Settings): void {
  if (!storageAvailable()) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
