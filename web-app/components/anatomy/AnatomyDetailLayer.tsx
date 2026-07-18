"use client";

import { ANATOMY_ASSETS } from "@/features/anatomy/anatomy-assets";
import type { AnatomyAssetId, Point } from "@/features/anatomy/anatomy-types";
import {
  DETAIL_IMAGE_HEIGHT,
  DETAIL_IMAGE_WIDTH,
} from "@/features/anatomy/anatomy-types";
import { AnatomySelectionMarker, MarkerDefs } from "./AnatomySelectionMarker";
import styles from "./anatomy.module.css";

type Props = {
  assetId: AnatomyAssetId | null;
  visible: boolean;
  label: string;
  anchor: Point | null;
};

/** Detail anatomical view crossfading over the zoomed body; the selection
 *  label stays visible and the marker re-anchors to the detail image. */
export function AnatomyDetailLayer({ assetId, visible, label, anchor }: Props) {
  const asset = assetId ? ANATOMY_ASSETS[assetId] : null;
  return (
    <div
      className={`${styles.detailLayer} ${visible && asset ? styles.detailLayerVisible : ""}`}
      aria-hidden={!visible || !asset}
    >
      {asset ? (
        <div className={styles.detailStage}>
          {/* eslint-disable-next-line @next/next/no-img-element -- detail
              stage shares an aspect-ratio box with its SVG marker overlay */}
          <img src={asset.src} alt={asset.altRu} className={styles.detailImage} loading="lazy" />
          {anchor ? (
            <svg
              className={styles.overlay}
              viewBox={`0 0 ${DETAIL_IMAGE_WIDTH} ${DETAIL_IMAGE_HEIGHT}`}
              aria-hidden="true"
            >
              <MarkerDefs />
              <AnatomySelectionMarker
                position={anchor}
                pulseKey={`${asset.id}-${anchor[0]}-${anchor[1]}`}
              />
            </svg>
          ) : null}
          <div className={styles.detailLabel}>{label}</div>
        </div>
      ) : null}
    </div>
  );
}
