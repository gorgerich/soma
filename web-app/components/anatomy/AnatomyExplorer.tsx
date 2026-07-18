"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { bodyAssetFor } from "@/features/anatomy/anatomy-assets";
import {
  findRegionAt,
  getRegion,
  regionsFor,
} from "@/features/anatomy/anatomy-regions";
import {
  calculateFocusTransform,
  clampScale,
  resetTransform,
  zoomAroundPoint,
} from "@/features/anatomy/anatomy-transform";
import type {
  AnatomyRegion,
  AnatomyRegionId,
  AnatomyTransform,
  BodyOrientation,
} from "@/features/anatomy/anatomy-types";
import { copy, regionLabel } from "@/features/symptom-check-in/copy.ru";
import { AnatomyDetailLayer } from "./AnatomyDetailLayer";
import { AnatomyOrientationControl, AnatomyZoomControls } from "./AnatomyControls";
import { AnatomyRegionListDrawer } from "./AnatomyRegionListDrawer";
import { AnatomyRegionSheet } from "./AnatomyRegionSheet";
import { AnatomyViewport, type ViewportGeometry } from "./AnatomyViewport";
import styles from "./anatomy.module.css";

export type ExplorerMode = "body" | "detail";

type Props = {
  orientation: BodyOrientation;
  selectedRegionId: AnatomyRegionId | null;
  onOrientationChange: (orientation: BodyOrientation) => void;
  onToggleRegion: (id: AnatomyRegionId) => void;
  onDescribe: () => void;
  onContinue: () => void;
  onModeChange?: (mode: ExplorerMode) => void;
};

type LoadStatus = "loading" | "ready" | "error";

/**
 * Orchestrates the anatomy scene: orientation, zoom/pan transform, focus
 * zoom, detail layer, loading states, prefetch, the region list drawer and
 * accessibility announcements. Selection state itself lives in the check-in
 * reducer — this component only reports taps upward.
 */
export function AnatomyExplorer({
  orientation,
  selectedRegionId,
  onOrientationChange,
  onToggleRegion,
  onDescribe,
  onContinue,
  onModeChange,
}: Props) {
  const searchParams = useSearchParams();
  const debug =
    process.env.NODE_ENV !== "production" && searchParams.get("debugAnatomy") === "1";

  const [geometry, setGeometry] = useState<ViewportGeometry | null>(null);
  const [transform, setTransform] = useState<AnatomyTransform>(resetTransform());
  const [animated, setAnimated] = useState(false);
  const [mode, setMode] = useState<ExplorerMode>("body");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [status, setStatus] = useState<Record<BodyOrientation, LoadStatus>>({
    front: "loading",
    back: "loading",
  });
  const [retryToken, setRetryToken] = useState(0);
  const prefetchedRef = useRef(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [bottomInset, setBottomInset] = useState(180);

  useEffect(() => {
    const node = sheetRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      setBottomInset(entries[0].contentRect.height + 16);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const asset = bodyAssetFor(orientation);
  const regions = regionsFor(orientation);
  const selectedRegion: AnatomyRegion | null = selectedRegionId
    ? getRegion(orientation, selectedRegionId)
    : null;

  const centerTransform = useCallback(
    (g: ViewportGeometry): AnatomyTransform => ({
      scale: 1,
      tx: (g.viewport.width - g.content.width) / 2,
      ty: (g.viewport.height - g.content.height) / 2,
    }),
    [],
  );

  const selectedRegionRef = useRef(selectedRegion);
  useEffect(() => {
    selectedRegionRef.current = selectedRegion;
  }, [selectedRegion]);

  const bottomInsetRef = useRef(bottomInset);
  useEffect(() => {
    bottomInsetRef.current = bottomInset;
  }, [bottomInset]);

  const handleGeometry = useCallback(
    (g: ViewportGeometry) => {
      setGeometry((previous) => {
        if (
          previous &&
          Math.abs(previous.viewport.width - g.viewport.width) < 1 &&
          Math.abs(previous.viewport.height - g.viewport.height) < 1
        ) {
          return previous;
        }
        const region = selectedRegionRef.current;
        if (region) {
          const k = g.displayScale;
          setTransform(
            calculateFocusTransform({
              viewport: g.viewport,
              content: g.content,
              regionBounds: {
                x: region.bounds.x * k,
                y: region.bounds.y * k,
                width: region.bounds.width * k,
                height: region.bounds.height * k,
              },
              bottomInset: bottomInsetRef.current,
              targetScale: region.targetScale,
            }),
          );
        } else {
          setTransform(centerTransform(g));
        }
        return g;
      });
    },
    [centerTransform],
  );

  const changeMode = useCallback(
    (next: ExplorerMode) => {
      setMode(next);
      onModeChange?.(next);
    },
    [onModeChange],
  );

  /** Region bounds in displayed-content pixels. */
  const displayedBounds = useCallback(
    (region: AnatomyRegion) => {
      const k = geometry?.displayScale ?? 1;
      return {
        x: region.bounds.x * k,
        y: region.bounds.y * k,
        width: region.bounds.width * k,
        height: region.bounds.height * k,
      };
    },
    [geometry],
  );

  const focusRegion = useCallback(
    (region: AnatomyRegion) => {
      if (!geometry) return;
      setAnimated(true);
      setTransform(
        calculateFocusTransform({
          viewport: geometry.viewport,
          content: geometry.content,
          regionBounds: displayedBounds(region),
          bottomInset,
          targetScale: region.targetScale,
        }),
      );
    },
    [geometry, displayedBounds, bottomInset],
  );

  const resetView = useCallback(() => {
    if (!geometry) return;
    setAnimated(true);
    setTransform(centerTransform(geometry));
    changeMode("body");
  }, [geometry, centerTransform, changeMode]);

  /* Prefetch the opposite orientation after the first image is ready. */
  useEffect(() => {
    if (status[orientation] === "ready" && !prefetchedRef.current) {
      prefetchedRef.current = true;
      const other = bodyAssetFor(orientation === "front" ? "back" : "front");
      const timer = window.setTimeout(() => {
        const image = new Image();
        image.src = other.src;
      }, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [status, orientation]);

  const announceScale = (scale: number) => {
    setAnnouncement(copy.anatomy.zoomLevel(Math.round(scale * 100)));
  };

  const handleZoomStep = (direction: 1 | -1) => {
    if (!geometry) return;
    setAnimated(true);
    const next = zoomAroundPoint(
      transform,
      clampScale(transform.scale * (direction === 1 ? 1.4 : 1 / 1.4)),
      { x: geometry.viewport.width / 2, y: geometry.viewport.height / 2 },
      geometry.viewport,
      geometry.content,
    );
    setTransform(next);
    announceScale(next.scale);
  };

  const handleDoubleTap = (point: { x: number; y: number }) => {
    if (!geometry) return;
    setAnimated(true);
    if (transform.scale > 1.3) {
      resetView();
      announceScale(1);
      return;
    }
    const imagePoint: [number, number] = [
      (point.x - transform.tx) / transform.scale / geometry.displayScale,
      (point.y - transform.ty) / transform.scale / geometry.displayScale,
    ];
    const region = findRegionAt(orientation, imagePoint);
    if (region) {
      focusRegion(region);
      announceScale(region.targetScale);
    } else {
      const next = zoomAroundPoint(transform, 2.2, point, geometry.viewport, geometry.content);
      setTransform(next);
      announceScale(next.scale);
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    void direction; // both directions toggle between the two views
    changeMode("body");
    if (geometry) {
      setAnimated(true);
      setTransform(centerTransform(geometry));
    }
    onOrientationChange(orientation === "front" ? "back" : "front");
  };

  const handleRegionTap = (id: AnatomyRegionId) => {
    changeMode("body");
    const selecting = id !== selectedRegionId;
    onToggleRegion(id);
    // Selection itself stays at the current view; the sheet then offers
    // «Показать крупнее» (and double-tap) for the focus zoom.
    if (!selecting) resetView();
  };

  const openDetail = () => {
    if (!selectedRegion) return;
    if (selectedRegion.detailAsset) {
      // Zoom the body toward the region while the detail layer crossfades
      // in on top — the move reads as one continuous spatial transition.
      focusRegion(selectedRegion);
      changeMode("detail");
    } else {
      // No dedicated detail asset (e.g. lower back): use a deeper focused
      // crop of the full-body image instead.
      if (!geometry) return;
      setAnimated(true);
      setTransform(
        calculateFocusTransform({
          viewport: geometry.viewport,
          content: geometry.content,
          regionBounds: displayedBounds(selectedRegion),
          bottomInset,
          targetScale: Math.min(3.2, selectedRegion.targetScale + 0.7),
        }),
      );
    }
  };

  const currentStatus = status[orientation];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <AnatomyViewport
        key={retryToken}
        imageSrc={asset.src}
        imageAlt={asset.altRu}
        regions={regions}
        selectedRegion={selectedRegion}
        transform={transform}
        animated={animated}
        debug={debug}
        imageStatus={currentStatus}
        onImageLoad={() =>
          setStatus((previous) => ({ ...previous, [orientation]: "ready" }))
        }
        onImageError={() =>
          setStatus((previous) => ({ ...previous, [orientation]: "error" }))
        }
        onGeometry={handleGeometry}
        onTransformChange={(next) => {
          setAnimated(false);
          setTransform(next);
        }}
        onRegionTap={handleRegionTap}
        onSwipe={handleSwipe}
        onDoubleTap={handleDoubleTap}
      >
        {currentStatus !== "ready" ? (
          <div className={styles.loadingLayer}>
            <svg
              className={`${styles.silhouette} ${currentStatus === "loading" ? styles.silhouetteLoading : ""}`}
              viewBox="0 0 100 220"
              aria-hidden="true"
            >
              <ellipse cx="50" cy="20" rx="12" ry="15" fill="#fff" />
              <rect x="36" y="38" width="28" height="70" rx="13" fill="#fff" />
              <rect x="38" y="110" width="10" height="90" rx="5" fill="#fff" />
              <rect x="52" y="110" width="10" height="90" rx="5" fill="#fff" />
            </svg>
            {currentStatus === "loading" ? (
              <p>{copy.anatomy.loading}</p>
            ) : (
              <>
                <p>{copy.anatomy.loadFailed}</p>
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={() => {
                    setStatus((previous) => ({ ...previous, [orientation]: "loading" }));
                    setRetryToken((token) => token + 1);
                  }}
                >
                  {copy.anatomy.retry}
                </button>
              </>
            )}
          </div>
        ) : null}
      </AnatomyViewport>

      <AnatomyDetailLayer
        assetId={mode === "detail" ? (selectedRegion?.detailAsset ?? null) : null}
        visible={mode === "detail"}
        label={selectedRegion ? regionLabel(selectedRegion.id) : ""}
        anchor={selectedRegion?.detailAnchor ?? null}
      />

      <AnatomyOrientationControl
        orientation={orientation}
        onChange={(side) => {
          changeMode("body");
          if (geometry) {
            setAnimated(true);
            setTransform(centerTransform(geometry));
          }
          onOrientationChange(side);
        }}
      />
      <AnatomyZoomControls
        scale={transform.scale}
        onZoomIn={() => handleZoomStep(1)}
        onZoomOut={() => handleZoomStep(-1)}
        onReset={() => {
          resetView();
          announceScale(1);
        }}
      />
      {mode !== "detail" ? (
        <button
          type="button"
          className={styles.listButton}
          style={{ bottom: bottomInset + 8 }}
          onClick={() => setDrawerOpen(true)}
        >
          {copy.anatomy.regionListOpen}
        </button>
      ) : null}
      {mode === "detail" || transform.scale > 1.3 ? (
        <button
          type="button"
          className={styles.backToBody}
          style={{ bottom: bottomInset + 8 }}
          onClick={resetView}
        >
          {mode === "detail" ? copy.anatomy.backToOverview : copy.anatomy.backToBody}
        </button>
      ) : null}

      <AnatomyRegionListDrawer
        open={drawerOpen}
        orientation={orientation}
        selectedRegionId={selectedRegionId}
        onSelect={handleRegionTap}
        onClose={() => setDrawerOpen(false)}
      />

      <AnatomyRegionSheet
        ref={sheetRef}
        selectedRegion={selectedRegion}
        mode={mode}
        zoomed={transform.scale > 1.3}
        onShowCloser={openDetail}
        onChangeRegion={() => {
          if (selectedRegionId) onToggleRegion(selectedRegionId);
        }}
        onDescribe={onDescribe}
        onContinue={onContinue}
      />

      <p aria-live="polite" className="visually-hidden">
        {announcement}
      </p>
    </div>
  );
}
