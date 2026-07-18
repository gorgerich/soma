import {
  IDENTITY_TRANSFORM,
  MAX_SCALE,
  MIN_SCALE,
  type AnatomyTransform,
  type Bounds,
} from "./anatomy-types";

export type Size = { width: number; height: number };

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/**
 * Clamps translation so the scaled content always covers the viewport where
 * possible (no irretrievable off-screen states). Content is the displayed
 * stage at scale 1; transform maps stage → viewport.
 */
export function clampTransform(
  transform: AnatomyTransform,
  viewport: Size,
  content: Size,
): AnatomyTransform {
  const scale = clampScale(transform.scale);
  const scaledW = content.width * scale;
  const scaledH = content.height * scale;

  const minTx = Math.min(0, viewport.width - scaledW);
  const maxTx = Math.max(0, viewport.width - scaledW);
  const minTy = Math.min(0, viewport.height - scaledH);
  const maxTy = Math.max(0, viewport.height - scaledH);

  return {
    scale,
    tx: Math.min(maxTx, Math.max(minTx, transform.tx)),
    ty: Math.min(maxTy, Math.max(minTy, transform.ty)),
  };
}

/** Zooms around a fixed viewport point (pinch midpoint / double-tap point). */
export function zoomAroundPoint(
  current: AnatomyTransform,
  nextScale: number,
  point: { x: number; y: number },
  viewport: Size,
  content: Size,
): AnatomyTransform {
  const scale = clampScale(nextScale);
  const ratio = scale / current.scale;
  return clampTransform(
    {
      scale,
      tx: point.x - (point.x - current.tx) * ratio,
      ty: point.y - (point.y - current.ty) * ratio,
    },
    viewport,
    content,
  );
}

export type FocusParams = {
  viewport: Size;
  /** Displayed content size at scale 1 (aspect-fit of the image). */
  content: Size;
  /** Region bounds in *displayed* content coordinates. */
  regionBounds: Bounds;
  /** Height of UI overlapping the viewport bottom (sheet). */
  bottomInset: number;
  targetScale: number;
};

/**
 * Computes a transform that centres the region in the part of the viewport
 * left visible above the bottom sheet, clamped so the image stays on screen.
 */
export function calculateFocusTransform({
  viewport,
  content,
  regionBounds,
  bottomInset,
  targetScale,
}: FocusParams): AnatomyTransform {
  const scale = clampScale(targetScale);
  const cx = regionBounds.x + regionBounds.width / 2;
  const cy = regionBounds.y + regionBounds.height / 2;
  const visibleHeight = Math.max(120, viewport.height - bottomInset);
  return clampTransform(
    {
      scale,
      tx: viewport.width / 2 - cx * scale,
      ty: visibleHeight / 2 - cy * scale,
    },
    viewport,
    content,
  );
}

export function resetTransform(): AnatomyTransform {
  return { ...IDENTITY_TRANSFORM };
}

/** Aspect-fit of an image inside a viewport ("contain"). */
export function containSize(image: Size, viewport: Size): Size {
  const scale = Math.min(viewport.width / image.width, viewport.height / image.height);
  return { width: image.width * scale, height: image.height * scale };
}
