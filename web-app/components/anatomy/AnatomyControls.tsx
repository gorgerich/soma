"use client";

import type { BodyOrientation } from "@/features/anatomy/anatomy-types";
import { copy } from "@/features/symptom-check-in/copy.ru";
import styles from "./anatomy.module.css";

type OrientationProps = {
  orientation: BodyOrientation;
  onChange: (orientation: BodyOrientation) => void;
};

export function AnatomyOrientationControl({ orientation, onChange }: OrientationProps) {
  return (
    <fieldset className={styles.controlsTop} style={{ border: "none" }} aria-label={copy.region.title}>
      {(["front", "back"] as const).map((side) => (
        <label key={side} className={styles.sideOption}>
          <input
            type="radio"
            name="anatomy-side"
            checked={orientation === side}
            onChange={() => onChange(side)}
            aria-label={side === "front" ? copy.sides.front : copy.sides.back}
          />
          {side === "front" ? copy.sides.front : copy.sides.back}
        </label>
      ))}
    </fieldset>
  );
}

type ZoomProps = {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function AnatomyZoomControls({ scale, onZoomIn, onZoomOut, onReset }: ZoomProps) {
  return (
    <div className={styles.controlsRight}>
      <button
        type="button"
        className={styles.roundControl}
        onClick={onZoomIn}
        disabled={scale >= 3.45}
        aria-label={copy.anatomy.zoomIn}
      >
        +
      </button>
      <button
        type="button"
        className={styles.roundControl}
        onClick={onZoomOut}
        disabled={scale <= 1.05}
        aria-label={copy.anatomy.zoomOut}
      >
        −
      </button>
      <button
        type="button"
        className={styles.roundControl}
        onClick={onReset}
        disabled={scale <= 1.05}
        aria-label={copy.anatomy.resetZoom}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M3 7V3h4M15 11v4h-4M15 3 3 15"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
