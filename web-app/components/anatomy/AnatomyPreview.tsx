import { bodyAssetFor } from "@/features/anatomy/anatomy-assets";
import { getRegion } from "@/features/anatomy/anatomy-regions";
import type { AnatomyRegionId, BodyOrientation } from "@/features/anatomy/anatomy-types";
import {
  BODY_IMAGE_HEIGHT,
  BODY_IMAGE_WIDTH,
} from "@/features/anatomy/anatomy-types";
import { AnatomySelectionMarker, MarkerDefs } from "./AnatomySelectionMarker";
import styles from "./anatomy.module.css";

type Props = {
  orientation: BodyOrientation;
  regionId: AnatomyRegionId | null;
  width?: number;
};

/** Compact non-interactive body preview with the selection marker — used on
 *  the review step and other summaries. */
export function AnatomyPreview({ orientation, regionId, width = 110 }: Props) {
  const asset = bodyAssetFor(orientation);
  const region = regionId ? getRegion(orientation, regionId) : null;
  return (
    <div
      style={{
        position: "relative",
        width,
        aspectRatio: `${BODY_IMAGE_WIDTH} / ${BODY_IMAGE_HEIGHT}`,
        borderRadius: 16,
        overflow: "hidden",
        flex: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- shares an
          aspect-ratio box with the SVG marker overlay */}
      <img
        src={asset.src}
        alt={asset.altRu}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {region ? (
        <svg
          className={styles.overlay}
          viewBox={`0 0 ${BODY_IMAGE_WIDTH} ${BODY_IMAGE_HEIGHT}`}
          aria-hidden="true"
        >
          <MarkerDefs />
          <AnatomySelectionMarker
            position={region.centroid}
            inverseScale={2.2}
            pulseKey={`preview-${region.id}`}
          />
        </svg>
      ) : null}
    </div>
  );
}
