import { describe, expect, it } from "vitest";
import {
  parseEpisode,
  parseEpisodeList,
  parseSettings,
} from "../features/symptom-check-in/storage";

const validEpisode = {
  id: "abc",
  schemaVersion: 1,
  createdAt: "2026-07-18T10:00:00.000Z",
  updatedAt: "2026-07-18T10:00:00.000Z",
  region: "lowerBack",
  bodySide: "back",
  severity: 6,
  sensations: ["sharp", "tingling"],
  onsetPreset: "yesterday",
  onsetPattern: "gradual",
  frequencyPattern: "constant",
  progression: "worsening",
  status: "active",
};

describe("stored data validation", () => {
  it("accepts a valid episode", () => {
    expect(parseEpisode(validEpisode)).not.toBeNull();
  });

  it("rejects wrong schema versions and malformed entries", () => {
    expect(parseEpisode({ ...validEpisode, schemaVersion: 2 })).toBeNull();
    expect(parseEpisode({ ...validEpisode, severity: 99 })).toBeNull();
    expect(parseEpisode({ ...validEpisode, region: "unknown-region" })).toBeNull();
    expect(parseEpisode(null)).toBeNull();
    expect(parseEpisode("string")).toBeNull();
  });

  it("drops unknown sensations instead of failing", () => {
    const parsed = parseEpisode({
      ...validEpisode,
      sensations: ["sharp", "unknown-sensation"],
    });
    expect(parsed?.sensations).toEqual(["sharp"]);
  });

  it("never throws on corrupt JSON and skips invalid list entries", () => {
    expect(parseEpisodeList("not json {{{")).toEqual([]);
    expect(parseEpisodeList(null)).toEqual([]);
    expect(parseEpisodeList(JSON.stringify({ nope: true }))).toEqual([]);
    const mixed = JSON.stringify([validEpisode, { broken: true }, 42]);
    expect(parseEpisodeList(mixed)).toHaveLength(1);
  });

  it("falls back to default settings on corrupt data", () => {
    expect(parseSettings("###")).toEqual({ schemaVersion: 1, city: null });
    expect(parseSettings(JSON.stringify({ schemaVersion: 1, city: "moscow" }))).toEqual({
      schemaVersion: 1,
      city: "moscow",
    });
    expect(parseSettings(JSON.stringify({ schemaVersion: 1, city: "mars" }))).toEqual({
      schemaVersion: 1,
      city: null,
    });
  });
});
