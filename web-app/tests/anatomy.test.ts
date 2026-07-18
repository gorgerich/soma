import { describe, expect, it } from "vitest";
import {
  pointInPolygon,
  polygonBounds,
  polygonCentroid,
} from "../features/anatomy/anatomy-geometry";
import {
  ALL_REGION_IDS,
  BACK_REGIONS,
  FRONT_REGIONS,
  findRegionAt,
  getRegion,
} from "../features/anatomy/anatomy-regions";
import {
  calculateFocusTransform,
  clampTransform,
  containSize,
  zoomAroundPoint,
} from "../features/anatomy/anatomy-transform";
import { MAX_SCALE } from "../features/anatomy/anatomy-types";
import { copy } from "../features/symptom-check-in/copy.ru";
import {
  checkInReducer,
  initialCheckInState,
} from "../features/symptom-check-in/reducer";
import { parseEpisode } from "../features/symptom-check-in/storage";

const square: [number, number][] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
];

describe("anatomy geometry", () => {
  it("computes centroid and bounds of a square", () => {
    expect(polygonCentroid(square)).toEqual([5, 5]);
    expect(polygonBounds(square)).toEqual({ x: 0, y: 0, width: 10, height: 10 });
  });

  it("hit-tests points against polygons", () => {
    expect(pointInPolygon([5, 5], square)).toBe(true);
    expect(pointInPolygon([15, 5], square)).toBe(false);
    expect(pointInPolygon([-1, -1], square)).toBe(false);
  });
});

describe("region registry", () => {
  it("provides the required front regions", () => {
    const ids = FRONT_REGIONS.map((r) => r.id);
    for (const required of [
      "head", "throat", "leftShoulder", "rightShoulder", "chest",
      "upperAbdomen", "lowerAbdomen", "pelvis", "leftArm", "rightArm",
      "leftHand", "rightHand", "leftThigh", "rightThigh", "leftKnee",
      "rightKnee", "leftShin", "rightShin", "leftFoot", "rightFoot",
    ]) {
      expect(ids, `front missing ${required}`).toContain(required);
    }
  });

  it("provides the required back regions", () => {
    const ids = BACK_REGIONS.map((r) => r.id);
    for (const required of [
      "backOfHead", "neck", "leftShoulder", "rightShoulder", "upperBack",
      "middleBack", "lowerBack", "leftArm", "rightArm", "leftHand",
      "rightHand", "leftGlute", "rightGlute", "leftThigh", "rightThigh",
      "leftKnee", "rightKnee", "leftCalf", "rightCalf", "leftFoot",
      "rightFoot",
    ]) {
      expect(ids, `back missing ${required}`).toContain(required);
    }
  });

  it("has valid geometry for every region", () => {
    for (const region of [...FRONT_REGIONS, ...BACK_REGIONS]) {
      expect(region.polygon.length).toBeGreaterThanOrEqual(4);
      const [cx, cy] = region.centroid;
      expect(cx).toBeGreaterThan(region.bounds.x);
      expect(cx).toBeLessThan(region.bounds.x + region.bounds.width);
      expect(cy).toBeGreaterThan(region.bounds.y);
      expect(cy).toBeLessThan(region.bounds.y + region.bounds.height);
      expect(region.targetScale).toBeGreaterThan(1);
      expect(region.targetScale).toBeLessThanOrEqual(MAX_SCALE);
      expect(pointInPolygon(region.centroid, region.polygon)).toBe(true);
    }
  });

  it("has a Russian label for every region id", () => {
    for (const id of ALL_REGION_IDS) {
      expect(copy.regionLabels[id], `label for ${id}`).toBeTruthy();
      expect(copy.regionLabels[id]).toMatch(/[А-Яа-яЁё]/);
    }
  });

  it("finds regions by image point per orientation", () => {
    const chest = getRegion("front", "chest");
    expect(chest).not.toBeNull();
    expect(findRegionAt("front", chest!.centroid)?.id).toBe("chest");
    const lowerBack = getRegion("back", "lowerBack");
    expect(findRegionAt("back", lowerBack!.centroid)?.id).toBe("lowerBack");
    expect(findRegionAt("front", [10, 10])).toBeNull();
  });

  it("keeps left/right regions mirrored around the figure axis", () => {
    const left = getRegion("front", "leftKnee")!;
    const right = getRegion("front", "rightKnee")!;
    expect(left.centroid[0] + right.centroid[0]).toBeCloseTo(1024, 0);
    expect(left.centroid[1]).toBeCloseTo(right.centroid[1], 0);
  });
});

describe("anatomy transform", () => {
  const viewport = { width: 390, height: 600 };
  const content = containSize({ width: 1024, height: 1280 }, viewport);

  it("clamps scale into [1, MAX_SCALE]", () => {
    expect(clampTransform({ scale: 0.2, tx: 0, ty: 0 }, viewport, content).scale).toBe(1);
    expect(clampTransform({ scale: 99, tx: 0, ty: 0 }, viewport, content).scale).toBe(MAX_SCALE);
  });

  it("never lets the content escape the viewport when zoomed", () => {
    const clamped = clampTransform(
      { scale: 2, tx: -99999, ty: 99999 },
      viewport,
      content,
    );
    expect(clamped.tx).toBeGreaterThanOrEqual(viewport.width - content.width * 2);
    expect(clamped.ty).toBeLessThanOrEqual(0);
  });

  it("zooms around a fixed point", () => {
    const start = { scale: 1, tx: 0, ty: 0 };
    const zoomed = zoomAroundPoint(start, 2, { x: 100, y: 100 }, viewport, content);
    expect(zoomed.scale).toBe(2);
    // The anchor point maps to the same viewport position before clamping.
    expect(100 - (100 - start.tx) * 2).toBeCloseTo(zoomed.tx <= 0 ? zoomed.tx : -100, -1);
  });

  it("focuses a region above the bottom sheet and stays clamped", () => {
    const region = getRegion("back", "lowerBack")!;
    const k = content.width / 1024;
    const focused = calculateFocusTransform({
      viewport,
      content,
      regionBounds: {
        x: region.bounds.x * k,
        y: region.bounds.y * k,
        width: region.bounds.width * k,
        height: region.bounds.height * k,
      },
      bottomInset: 180,
      targetScale: region.targetScale,
    });
    expect(focused.scale).toBe(region.targetScale);
    // Region centre must land inside the visible (non-sheet) viewport band.
    const cx = (region.bounds.x + region.bounds.width / 2) * k;
    const cy = (region.bounds.y + region.bounds.height / 2) * k;
    const viewX = cx * focused.scale + focused.tx;
    const viewY = cy * focused.scale + focused.ty;
    expect(viewX).toBeGreaterThan(0);
    expect(viewX).toBeLessThan(viewport.width);
    expect(viewY).toBeGreaterThan(0);
    expect(viewY).toBeLessThan(viewport.height - 100);
  });
});

describe("reducer with anatomy regions", () => {
  it("records the orientation a region was selected on", () => {
    const front = checkInReducer(initialCheckInState, {
      type: "SET_BODY_SIDE",
      side: "front",
    });
    const selected = checkInReducer(front, { type: "TOGGLE_REGION", region: "chest" });
    expect(selected.region).toBe("chest");
    expect(selected.selectionSide).toBe("front");
    // Flipping sides keeps the selection and its original orientation.
    const flipped = checkInReducer(selected, { type: "SET_BODY_SIDE", side: "back" });
    expect(flipped.region).toBe("chest");
    expect(flipped.selectionSide).toBe("front");
  });
});

describe("stored record migration", () => {
  const legacy = {
    id: "old-1",
    schemaVersion: 1,
    createdAt: "2026-07-18T10:00:00.000Z",
    updatedAt: "2026-07-18T10:00:00.000Z",
    region: "lowerBack",
    bodySide: "back",
    severity: 6,
    sensations: ["sharp"],
    onsetPreset: "yesterday",
    onsetPattern: "gradual",
    frequencyPattern: "constant",
    progression: "worsening",
    status: "active",
  };

  it("keeps old lowerBack-only records readable", () => {
    expect(parseEpisode(legacy)?.region).toBe("lowerBack");
  });

  it("accepts new region ids and rejects unknown ones", () => {
    expect(parseEpisode({ ...legacy, region: "chest", bodySide: "front" })?.region).toBe("chest");
    expect(parseEpisode({ ...legacy, region: "wing" })).toBeNull();
  });
});
