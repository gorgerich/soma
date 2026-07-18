export type BodyOrientation = "front" | "back";

export type AnatomyAssetId =
  | "bodyFront"
  | "bodyBack"
  | "detailHeadNeck"
  | "detailChestRibs"
  | "detailAbdomen"
  | "detailLegs";

export type AnatomyRegionId =
  // Front
  | "head"
  | "throat"
  | "chest"
  | "upperAbdomen"
  | "lowerAbdomen"
  | "pelvis"
  // Back
  | "backOfHead"
  | "neck"
  | "upperBack"
  | "middleBack"
  | "lowerBack"
  | "leftGlute"
  | "rightGlute"
  // Shared limbs (exist on both orientations)
  | "leftShoulder"
  | "rightShoulder"
  | "leftArm"
  | "rightArm"
  | "leftHand"
  | "rightHand"
  | "leftThigh"
  | "rightThigh"
  | "leftKnee"
  | "rightKnee"
  | "leftShin"
  | "rightShin"
  | "leftCalf"
  | "rightCalf"
  | "leftFoot"
  | "rightFoot";

export type Point = readonly [number, number];

export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AnatomyAsset = {
  id: AnatomyAssetId;
  src: string;
  width: number;
  height: number;
  altRu: string;
};

export type AnatomyRegion = {
  id: AnatomyRegionId;
  orientation: BodyOrientation;
  polygon: readonly Point[];
  centroid: Point;
  bounds: Bounds;
  targetScale: number;
  detailAsset?: AnatomyAssetId;
  /** Marker anchor inside the detail asset's own coordinate space. */
  detailAnchor?: Point;
};

export type AnatomyTransform = {
  scale: number;
  tx: number;
  ty: number;
};

export const IDENTITY_TRANSFORM: AnatomyTransform = { scale: 1, tx: 0, ty: 0 };

export const MIN_SCALE = 1;
export const MAX_SCALE = 3.5;

/** Full-body image coordinate space (actual asset size). */
export const BODY_IMAGE_WIDTH = 1024;
export const BODY_IMAGE_HEIGHT = 1280;

/** Detail image coordinate space (actual asset size). */
export const DETAIL_IMAGE_WIDTH = 960;
export const DETAIL_IMAGE_HEIGHT = 1280;
