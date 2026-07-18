"use client";

import { copy } from "@/features/symptom-check-in/copy.ru";
import type { BodySide } from "@/features/symptom-check-in/model";
import {
  BACK_CONTOUR_PATH,
  BODY_OUTLINE_PATH,
  BODY_VIEWBOX,
  FRONT_CONTOUR_PATH,
  LOWER_BACK_REGION,
} from "./body-outline";
import styles from "./body.module.css";

type Props = {
  side: BodySide;
  isLowerBackSelected: boolean;
  onToggleLowerBack: () => void;
  compact?: boolean;
};

/**
 * The interactive body scene. Silhouette, contour details, selection glow
 * and the hit target all share one 100 × 220 viewBox, so they stay aligned
 * at every size. The hit target itself is a real HTML button.
 */
export function BodyMap({
  side,
  isLowerBackSelected,
  onToggleLowerBack,
  compact = false,
}: Props) {
  const { cx, cy, rx, ry } = LOWER_BACK_REGION;
  const showRegion = side === "back";

  return (
    <div
      className={styles.stage}
      style={compact ? { maxWidth: 130 } : undefined}
      role="img"
      aria-label={side === "back" ? copy.region.bodyLabelBack : copy.region.bodyLabelFront}
    >
      <svg className={styles.svg} viewBox={BODY_VIEWBOX} aria-hidden="true">
        <defs>
          <linearGradient id="body-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--body-ivory)" />
            <stop offset="1" stopColor="var(--body-rose)" />
          </linearGradient>
          <radialGradient id="body-light" cx="0.5" cy="0.28" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="selection-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--coral)" stopOpacity="0.5" />
            <stop offset="0.6" stopColor="var(--lavender)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--lavender)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="selection-core" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--coral)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--lavender)" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Figure */}
        <path d={BODY_OUTLINE_PATH} fill="url(#body-fill)" />
        <path d={BODY_OUTLINE_PATH} fill="url(#body-light)" />
        <path
          d={BODY_OUTLINE_PATH}
          fill="none"
          stroke="var(--body-shade)"
          strokeOpacity="0.5"
          strokeWidth="0.6"
        />

        {/* Per-side contour details crossfade. */}
        <g className={`${styles.side} ${side === "back" ? "" : styles.sideHidden}`}>
          <path
            d={BACK_CONTOUR_PATH}
            fill="none"
            stroke="var(--body-contour)"
            strokeOpacity="0.22"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>
        <g className={`${styles.side} ${side === "front" ? "" : styles.sideHidden}`}>
          <path
            d={FRONT_CONTOUR_PATH}
            fill="none"
            stroke="var(--body-contour)"
            strokeOpacity="0.22"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>

        {/* Lower-back region visuals (back side only). */}
        {showRegion ? (
          isLowerBackSelected ? (
            <g>
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx * 2.2}
                ry={ry * 2.4}
                fill="url(#selection-glow)"
              />
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx * 1.4}
                ry={ry * 1.5}
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.85"
                strokeWidth="0.7"
              />
              <ellipse
                className={styles.selectedCore}
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill="url(#selection-core)"
                stroke="#ffffff"
                strokeOpacity="0.7"
                strokeWidth="0.5"
              />
            </g>
          ) : (
            <g>
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx * 0.9}
                ry={ry}
                fill="none"
                stroke="var(--lavender)"
                strokeOpacity="0.55"
                strokeWidth="0.7"
              />
              <circle cx={cx} cy={cy} r="1.6" fill="#ffffff" opacity="0.95" />
            </g>
          )
        ) : null}
      </svg>

      {showRegion && !compact ? (
        <button
          type="button"
          className={styles.regionButton}
          onClick={onToggleLowerBack}
          aria-pressed={isLowerBackSelected}
          aria-label={
            isLowerBackSelected
              ? `${copy.region.lowerBack}. ${copy.region.tapAgainToClear}`
              : copy.region.selectLowerBack
          }
        />
      ) : null}
    </div>
  );
}
