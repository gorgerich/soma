import { describe, expect, it } from "vitest";
import {
  buildEpisode,
  canGoNext,
  checkInReducer,
  initialCheckInState,
  type CheckInAction,
  type CheckInState,
} from "../features/symptom-check-in/reducer";
import type { SymptomEpisode } from "../features/symptom-check-in/model";

function run(actions: CheckInAction[], from: CheckInState = initialCheckInState) {
  return actions.reduce(checkInReducer, from);
}

/** State with every step answered, sitting on the review screen. */
function completedState(): CheckInState {
  return run([
    { type: "SELECT_REGION", region: "lowerBack" },
    { type: "GO_NEXT" },
    { type: "SET_SEVERITY", value: 6 },
    { type: "TOGGLE_SENSATION", sensation: "sharp" },
    { type: "TOGGLE_SENSATION", sensation: "tingling" },
    { type: "GO_NEXT" },
    { type: "SET_ONSET", preset: "yesterday" },
    { type: "SET_ONSET_PATTERN", pattern: "gradual" },
    { type: "SET_FREQUENCY", pattern: "constant" },
    { type: "SET_PROGRESSION", progression: "worsening" },
    { type: "GO_NEXT" },
  ]);
}

describe("checkInReducer", () => {
  it("starts on the region step, back side, nothing selected", () => {
    expect(initialCheckInState.step).toBe("region");
    expect(initialCheckInState.bodySide).toBe("back");
    expect(initialCheckInState.region).toBeNull();
    expect(canGoNext(initialCheckInState)).toBe(false);
  });

  it("selects and deselects the lower back", () => {
    const selected = run([{ type: "TOGGLE_REGION", region: "lowerBack" }]);
    expect(selected.region).toBe("lowerBack");
    expect(canGoNext(selected)).toBe(true);

    const cleared = run([{ type: "TOGGLE_REGION", region: "lowerBack" }], selected);
    expect(cleared.region).toBeNull();
    expect(canGoNext(cleared)).toBe(false);
  });

  it("does not advance from the region step without a selection", () => {
    const state = run([{ type: "GO_NEXT" }]);
    expect(state.step).toBe("region");
  });

  it("clamps severity into 0…10", () => {
    expect(run([{ type: "SET_SEVERITY", value: 14 }]).severity).toBe(10);
    expect(run([{ type: "SET_SEVERITY", value: -3 }]).severity).toBe(0);
    expect(run([{ type: "SET_SEVERITY", value: 6 }]).severity).toBe(6);
  });

  it("toggles multiple sensations independently", () => {
    const state = run([
      { type: "TOGGLE_SENSATION", sensation: "sharp" },
      { type: "TOGGLE_SENSATION", sensation: "tingling" },
      { type: "TOGGLE_SENSATION", sensation: "sharp" },
    ]);
    expect(state.sensations).toEqual(["tingling"]);
  });

  it("navigates region → severity → timing → review", () => {
    const state = completedState();
    expect(state.step).toBe("review");
  });

  it("requires all four timing answers before leaving the timing step", () => {
    const partial = run([
      { type: "SELECT_REGION", region: "lowerBack" },
      { type: "GO_NEXT" },
      { type: "GO_NEXT" },
      { type: "SET_ONSET", preset: "today" },
      { type: "SET_ONSET_PATTERN", pattern: "sudden" },
      { type: "GO_NEXT" },
    ]);
    expect(partial.step).toBe("timing");
  });

  it("requires a date when the custom-date onset is chosen", () => {
    const withoutDate = run([
      { type: "SELECT_REGION", region: "lowerBack" },
      { type: "GO_NEXT" },
      { type: "GO_NEXT" },
      { type: "SET_ONSET", preset: "customDate" },
      { type: "SET_ONSET_PATTERN", pattern: "sudden" },
      { type: "SET_FREQUENCY", pattern: "constant" },
      { type: "SET_PROGRESSION", progression: "unchanged" },
    ]);
    expect(canGoNext(withoutDate)).toBe(false);
    const withDate = checkInReducer(withoutDate, {
      type: "SET_ONSET_DATE",
      date: "2026-07-10",
    });
    expect(canGoNext(withDate)).toBe(true);
  });

  it("returns to review after editing a single step", () => {
    const edited = run(
      [
        { type: "EDIT_STEP", step: "severity" },
        { type: "SET_SEVERITY", value: 8 },
        { type: "GO_NEXT" },
      ],
      completedState(),
    );
    expect(edited.step).toBe("review");
    expect(edited.severity).toBe(8);
    expect(edited.returnToReview).toBe(false);
  });

  it("resets to the initial state", () => {
    const state = run([{ type: "RESET" }], completedState());
    expect(state).toEqual(initialCheckInState);
  });

  it("builds a complete episode from finished state", () => {
    const episode = buildEpisode(completedState(), new Date("2026-07-18T10:00:00Z"));
    expect(episode).not.toBeNull();
    expect(episode).toMatchObject({
      schemaVersion: 1,
      region: "lowerBack",
      bodySide: "back",
      severity: 6,
      sensations: ["sharp", "tingling"],
      onsetPreset: "yesterday",
      onsetPattern: "gradual",
      frequencyPattern: "constant",
      progression: "worsening",
      status: "active",
    });
    expect(episode?.createdAt).toBe("2026-07-18T10:00:00.000Z");
  });

  it("returns null instead of an episode when required answers are missing", () => {
    expect(buildEpisode(initialCheckInState)).toBeNull();
  });

  it("loads an existing episode for editing and keeps its id on save", () => {
    const source = buildEpisode(completedState()) as SymptomEpisode;
    const state = run([{ type: "LOAD_EPISODE", episode: source }]);
    expect(state.step).toBe("review");
    expect(state.editingEpisodeId).toBe(source.id);
    const rebuilt = buildEpisode(state);
    expect(rebuilt?.id).toBe(source.id);
  });
});
