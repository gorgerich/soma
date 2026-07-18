import type { Point } from "@/features/anatomy/anatomy-types";
import styles from "./anatomy.module.css";

type Props = {
  position: Point;
  /** Scale-compensation so the marker keeps a constant on-screen size. */
  inverseScale?: number;
  /** Remounts (and so re-pulses once) when this key changes. */
  pulseKey: string;
};

/** Anchored selection marker: coral diffused halo, white ring, luminous
 *  yellow-lime core. Pulses exactly once per selection. Not a heat map —
 *  it only marks the place the user chose. */
export function AnatomySelectionMarker({ position, inverseScale = 1, pulseKey }: Props) {
  const [x, y] = position;
  const s = inverseScale;
  return (
    <g key={pulseKey} className={styles.markerGroup} transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={54} fill="url(#marker-halo)" />
      <circle r={21} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={5} />
      <circle r={12} fill="#DFFF45" stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} />
    </g>
  );
}

export function MarkerDefs() {
  return (
    <defs>
      <radialGradient id="marker-halo">
        <stop offset="0%" stopColor="rgba(255,126,154,0.4)" />
        <stop offset="70%" stopColor="rgba(255,126,154,0.18)" />
        <stop offset="100%" stopColor="rgba(255,126,154,0)" />
      </radialGradient>
    </defs>
  );
}
