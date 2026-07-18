import { polygonBounds, polygonCentroid, pointInPolygon } from "./anatomy-geometry";
import type {
  AnatomyAssetId,
  AnatomyRegion,
  AnatomyRegionId,
  BodyOrientation,
  Point,
} from "./anatomy-types";

/**
 * Hotspot polygons in the full-body image coordinate space (1024 × 1280),
 * calibrated against the supplied assets via the ?debugAnatomy=1 overlay.
 *
 * Side naming follows the *person's* body, not the viewer: on the front view
 * the person's right limbs are on the viewer's left; on the back view they
 * coincide with the viewer's sides.
 */

type RegionSpec = {
  id: AnatomyRegionId;
  polygon: readonly Point[];
  targetScale: number;
  detailAsset?: AnatomyAssetId;
  detailAnchor?: Point;
};

/** Mirrors a polygon across the figure's vertical axis (x = 512). */
const mirror = (polygon: readonly Point[]): Point[] =>
  polygon.map(([x, y]) => [1024 - x, y] as const).reverse() as Point[];

/* --- Shared limb geometry (same pose on both assets). Bands authored for
 * the viewer-LEFT limb; the viewer-right limb is the mirror. --- */

const ARM_VIEWER_LEFT: Point[] = [
  [352, 300], [400, 290], [408, 420], [388, 520], [366, 640], [318, 636],
  [330, 500], [340, 400],
];
const HAND_VIEWER_LEFT: Point[] = [
  [318, 630], [368, 638], [352, 730], [330, 795], [272, 788], [252, 700],
];
const THIGH_VIEWER_LEFT: Point[] = [
  [424, 700], [512, 706], [508, 800], [498, 862], [432, 862], [420, 780],
];
const KNEE_VIEWER_LEFT: Point[] = [
  [428, 856], [502, 856], [500, 938], [432, 938],
];
const SHIN_VIEWER_LEFT: Point[] = [
  [432, 934], [500, 934], [494, 1050], [488, 1142], [438, 1142], [432, 1030],
];
const FOOT_VIEWER_LEFT: Point[] = [
  [430, 1138], [498, 1138], [512, 1200], [508, 1258], [412, 1258], [408, 1195],
];

const FRONT_SPECS: RegionSpec[] = [
  {
    id: "head",
    polygon: [
      [470, 26], [556, 26], [576, 80], [570, 140], [548, 182], [478, 182],
      [454, 140], [448, 80],
    ],
    targetScale: 2.6,
    detailAsset: "detailHeadNeck",
    detailAnchor: [480, 300],
  },
  {
    id: "throat",
    polygon: [
      [472, 178], [552, 178], [560, 248], [548, 262], [476, 262], [464, 248],
    ],
    targetScale: 2.7,
    detailAsset: "detailHeadNeck",
    detailAnchor: [480, 640],
  },
  {
    id: "rightShoulder", // viewer left
    polygon: [
      [330, 262], [416, 238], [430, 300], [408, 330], [352, 330], [334, 300],
    ],
    targetScale: 2.4,
  },
  {
    id: "leftShoulder", // viewer right
    polygon: mirror([
      [330, 262], [416, 238], [430, 300], [408, 330], [352, 330], [334, 300],
    ]),
    targetScale: 2.4,
  },
  {
    id: "chest",
    polygon: [
      [408, 250], [616, 250], [630, 340], [618, 440], [594, 472], [432, 472],
      [406, 440], [396, 340],
    ],
    targetScale: 2.0,
    detailAsset: "detailChestRibs",
    detailAnchor: [480, 600],
  },
  {
    id: "upperAbdomen",
    polygon: [
      [430, 470], [596, 470], [604, 528], [596, 576], [430, 576], [420, 528],
    ],
    targetScale: 2.1,
    detailAsset: "detailAbdomen",
    detailAnchor: [480, 500],
  },
  {
    id: "lowerAbdomen",
    polygon: [
      [430, 574], [596, 574], [602, 622], [594, 662], [432, 662], [424, 622],
    ],
    targetScale: 2.1,
    detailAsset: "detailAbdomen",
    detailAnchor: [480, 820],
  },
  {
    id: "pelvis",
    polygon: [
      [428, 660], [598, 660], [606, 700], [596, 742], [430, 742], [418, 700],
    ],
    targetScale: 2.1,
    detailAsset: "detailAbdomen",
    detailAnchor: [480, 1030],
  },
  { id: "rightArm", polygon: ARM_VIEWER_LEFT, targetScale: 2.0 },
  { id: "leftArm", polygon: mirror(ARM_VIEWER_LEFT), targetScale: 2.0 },
  {
    id: "rightHand",
    polygon: HAND_VIEWER_LEFT,
    targetScale: 2.9,
  },
  {
    id: "leftHand",
    polygon: mirror(HAND_VIEWER_LEFT),
    targetScale: 2.9,
  },
  {
    id: "rightThigh",
    polygon: THIGH_VIEWER_LEFT,
    targetScale: 2.0,
    detailAsset: "detailLegs",
    detailAnchor: [400, 300],
  },
  {
    id: "leftThigh",
    polygon: mirror(THIGH_VIEWER_LEFT),
    targetScale: 2.0,
    detailAsset: "detailLegs",
    detailAnchor: [560, 300],
  },
  {
    id: "rightKnee",
    polygon: KNEE_VIEWER_LEFT,
    targetScale: 2.5,
    detailAsset: "detailLegs",
    detailAnchor: [395, 560],
  },
  {
    id: "leftKnee",
    polygon: mirror(KNEE_VIEWER_LEFT),
    targetScale: 2.5,
    detailAsset: "detailLegs",
    detailAnchor: [565, 560],
  },
  {
    id: "rightShin",
    polygon: SHIN_VIEWER_LEFT,
    targetScale: 2.2,
    detailAsset: "detailLegs",
    detailAnchor: [390, 810],
  },
  {
    id: "leftShin",
    polygon: mirror(SHIN_VIEWER_LEFT),
    targetScale: 2.2,
    detailAsset: "detailLegs",
    detailAnchor: [575, 810],
  },
  {
    id: "rightFoot",
    polygon: FOOT_VIEWER_LEFT,
    targetScale: 2.9,
    detailAsset: "detailLegs",
    detailAnchor: [400, 1120],
  },
  {
    id: "leftFoot",
    polygon: mirror(FOOT_VIEWER_LEFT),
    targetScale: 2.9,
    detailAsset: "detailLegs",
    detailAnchor: [560, 1120],
  },
];

const BACK_SPECS: RegionSpec[] = [
  {
    id: "backOfHead",
    polygon: [
      [468, 26], [558, 26], [578, 82], [570, 142], [546, 180], [478, 180],
      [452, 142], [446, 82],
    ],
    targetScale: 2.6,
    detailAsset: "detailHeadNeck",
    detailAnchor: [480, 300],
  },
  {
    id: "neck",
    polygon: [
      [470, 176], [554, 176], [562, 252], [548, 268], [476, 268], [462, 252],
    ],
    targetScale: 2.7,
    detailAsset: "detailHeadNeck",
    detailAnchor: [480, 600],
  },
  {
    id: "leftShoulder", // back view: viewer left = person's left
    polygon: [
      [330, 262], [416, 238], [430, 300], [408, 330], [352, 330], [334, 300],
    ],
    targetScale: 2.4,
  },
  {
    id: "rightShoulder",
    polygon: mirror([
      [330, 262], [416, 238], [430, 300], [408, 330], [352, 330], [334, 300],
    ]),
    targetScale: 2.4,
  },
  {
    id: "upperBack",
    polygon: [
      [408, 250], [616, 250], [628, 340], [614, 428], [410, 428], [398, 340],
    ],
    targetScale: 2.0,
    detailAsset: "detailChestRibs",
    detailAnchor: [480, 520],
  },
  {
    id: "middleBack",
    polygon: [
      [412, 426], [614, 426], [608, 490], [598, 546], [428, 546], [418, 490],
    ],
    targetScale: 2.2,
    detailAsset: "detailChestRibs",
    detailAnchor: [480, 900],
  },
  {
    id: "lowerBack",
    polygon: [
      [428, 544], [598, 544], [606, 600], [598, 662], [430, 662], [420, 600],
    ],
    targetScale: 2.3,
    // No dedicated lower-back asset: focus mode uses a deeper zoom of the
    // back body image instead of a detail layer.
  },
  {
    id: "leftGlute",
    polygon: [
      [424, 658], [512, 660], [510, 790], [438, 788], [420, 720],
    ],
    targetScale: 2.2,
  },
  {
    id: "rightGlute",
    polygon: mirror([
      [424, 658], [512, 660], [510, 790], [438, 788], [420, 720],
    ]),
    targetScale: 2.2,
  },
  { id: "leftArm", polygon: ARM_VIEWER_LEFT, targetScale: 2.0 },
  { id: "rightArm", polygon: mirror(ARM_VIEWER_LEFT), targetScale: 2.0 },
  { id: "leftHand", polygon: HAND_VIEWER_LEFT, targetScale: 2.9 },
  { id: "rightHand", polygon: mirror(HAND_VIEWER_LEFT), targetScale: 2.9 },
  {
    id: "leftThigh",
    polygon: [
      [424, 786], [510, 788], [506, 862], [432, 862], [420, 820],
    ],
    targetScale: 2.0,
    detailAsset: "detailLegs",
    detailAnchor: [400, 300],
  },
  {
    id: "rightThigh",
    polygon: mirror([
      [424, 786], [510, 788], [506, 862], [432, 862], [420, 820],
    ]),
    targetScale: 2.0,
    detailAsset: "detailLegs",
    detailAnchor: [560, 300],
  },
  {
    id: "leftKnee",
    polygon: KNEE_VIEWER_LEFT,
    targetScale: 2.5,
    detailAsset: "detailLegs",
    detailAnchor: [395, 560],
  },
  {
    id: "rightKnee",
    polygon: mirror(KNEE_VIEWER_LEFT),
    targetScale: 2.5,
    detailAsset: "detailLegs",
    detailAnchor: [565, 560],
  },
  {
    id: "leftCalf",
    polygon: SHIN_VIEWER_LEFT,
    targetScale: 2.2,
    detailAsset: "detailLegs",
    detailAnchor: [390, 810],
  },
  {
    id: "rightCalf",
    polygon: mirror(SHIN_VIEWER_LEFT),
    targetScale: 2.2,
    detailAsset: "detailLegs",
    detailAnchor: [575, 810],
  },
  {
    id: "leftFoot",
    polygon: FOOT_VIEWER_LEFT,
    targetScale: 2.9,
    detailAsset: "detailLegs",
    detailAnchor: [400, 1120],
  },
  {
    id: "rightFoot",
    polygon: mirror(FOOT_VIEWER_LEFT),
    targetScale: 2.9,
    detailAsset: "detailLegs",
    detailAnchor: [560, 1120],
  },
];

function build(orientation: BodyOrientation, specs: RegionSpec[]): AnatomyRegion[] {
  return specs.map((spec) => ({
    id: spec.id,
    orientation,
    polygon: spec.polygon,
    centroid: polygonCentroid(spec.polygon),
    bounds: polygonBounds(spec.polygon),
    targetScale: spec.targetScale,
    ...(spec.detailAsset ? { detailAsset: spec.detailAsset } : {}),
    ...(spec.detailAnchor ? { detailAnchor: spec.detailAnchor } : {}),
  }));
}

export const FRONT_REGIONS: AnatomyRegion[] = build("front", FRONT_SPECS);
export const BACK_REGIONS: AnatomyRegion[] = build("back", BACK_SPECS);

export const ALL_REGION_IDS: AnatomyRegionId[] = Array.from(
  new Set([...FRONT_REGIONS, ...BACK_REGIONS].map((r) => r.id)),
);

export function regionsFor(orientation: BodyOrientation): AnatomyRegion[] {
  return orientation === "front" ? FRONT_REGIONS : BACK_REGIONS;
}

export function getRegion(
  orientation: BodyOrientation,
  id: AnatomyRegionId,
): AnatomyRegion | null {
  return regionsFor(orientation).find((r) => r.id === id) ?? null;
}

/** Which orientation a region id belongs to (front preferred when both). */
export function orientationForRegion(id: AnatomyRegionId): BodyOrientation {
  if (FRONT_REGIONS.some((r) => r.id === id)) return "front";
  return "back";
}

export function findRegionAt(
  orientation: BodyOrientation,
  point: Point,
): AnatomyRegion | null {
  // Later entries would win overlaps; regions are authored non-overlapping.
  return (
    regionsFor(orientation).find((region) => pointInPolygon(point, region.polygon)) ??
    null
  );
}
