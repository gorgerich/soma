import { copy, severityLabel } from "./copy.ru";
import type { SymptomEpisode } from "./model";

const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDateTime(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  return dateTimeFormat.format(new Date(time));
}

export function formatDate(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  return dateFormat.format(new Date(time));
}

/** «6 из 10 — умеренно» */
export function formatSeverity(value: number): string {
  return `${value} ${copy.severity.outOfTen} — ${severityLabel(value).toLowerCase()}`;
}

export function formatSensations(episode: SymptomEpisode): string {
  if (episode.sensations.length === 0) return "—";
  return episode.sensations
    .map((s) => copy.sensations[s].toLowerCase())
    .join(", ");
}

export function formatOnset(episode: SymptomEpisode): string {
  if (episode.onsetPreset === "customDate" && episode.onsetDate) {
    return formatDate(episode.onsetDate);
  }
  return copy.onsetPresets[episode.onsetPreset];
}

/** Today's date as an input[type=date] max value (local time). */
export function todayInputValue(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
