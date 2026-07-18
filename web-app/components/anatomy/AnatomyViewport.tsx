"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { pointInPolygon, polygonToSvgPoints } from "@/features/anatomy/anatomy-geometry";
import type {
  AnatomyRegion,
  AnatomyRegionId,
  AnatomyTransform,
  Point,
} from "@/features/anatomy/anatomy-types";
import {
  BODY_IMAGE_HEIGHT,
  BODY_IMAGE_WIDTH,
} from "@/features/anatomy/anatomy-types";
import {
  clampTransform,
  containSize,
  zoomAroundPoint,
  type Size,
} from "@/features/anatomy/anatomy-transform";
import { copy, regionLabel } from "@/features/symptom-check-in/copy.ru";
import { AnatomySelectionMarker, MarkerDefs } from "./AnatomySelectionMarker";
import styles from "./anatomy.module.css";

const SWIPE_THRESHOLD = 64;
const TAP_MOVE_TOLERANCE = 12;
const DOUBLE_TAP_MS = 300;

export type ViewportGeometry = {
  viewport: Size;
  content: Size;
  /** image px → displayed px factor at scale 1 */
  displayScale: number;
};

type Props = {
  imageSrc: string;
  imageAlt: string;
  regions: readonly AnatomyRegion[];
  selectedRegion: AnatomyRegion | null;
  transform: AnatomyTransform;
  animated: boolean;
  debug?: boolean;
  imageStatus: "loading" | "ready" | "error";
  onImageLoad: () => void;
  onImageError: () => void;
  onGeometry: (geometry: ViewportGeometry) => void;
  onTransformChange: (transform: AnatomyTransform) => void;
  onRegionTap: (id: AnatomyRegionId) => void;
  onSwipe: (direction: "left" | "right") => void;
  onDoubleTap: (viewportPoint: { x: number; y: number }) => void;
  children?: ReactNode;
};

/**
 * Gesture surface + transformed stage. The image and SVG hotspot layer share
 * one stage element and one transform, so hit areas stay aligned at every
 * size and zoom level. Handles pinch, pan, swipe, tap and double-tap.
 */
export function AnatomyViewport({
  imageSrc,
  imageAlt,
  regions,
  selectedRegion,
  transform,
  animated,
  debug = false,
  imageStatus,
  onImageLoad,
  onImageError,
  onGeometry,
  onTransformChange,
  onRegionTap,
  onSwipe,
  onDoubleTap,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 });
  const [debugPointer, setDebugPointer] = useState<Point | null>(null);

  const content = useMemo(
    () =>
      containSize(
        { width: BODY_IMAGE_WIDTH, height: BODY_IMAGE_HEIGHT },
        viewport.width > 0 ? viewport : { width: 1, height: 1 },
      ),
    [viewport],
  );
  const displayScale = content.width / BODY_IMAGE_WIDTH;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setViewport({ width: rect.width, height: rect.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (viewport.width > 0) {
      onGeometry({ viewport, content, displayScale });
    }
  }, [viewport, content, displayScale, onGeometry]);

  /* --- Gesture state (refs: no re-render per move) --- */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    moved: false,
    pinchStartDist: 0,
    pinchStartScale: 1,
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
  });
  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const localPoint = useCallback((event: { clientX: number; clientY: number }) => {
    const rect = containerRef.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent) => {
    const point = localPoint(event);
    pointers.current.set(event.pointerId, point);
    containerRef.current?.setPointerCapture(event.pointerId);
    const g = gesture.current;
    if (pointers.current.size === 1) {
      g.startX = point.x;
      g.startY = point.y;
      g.startTx = transformRef.current.tx;
      g.startTy = transformRef.current.ty;
      g.moved = false;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
      g.pinchStartScale = transformRef.current.scale;
    }
  };

  const handlePointerMove = (event: ReactPointerEvent) => {
    if (!pointers.current.has(event.pointerId)) {
      if (debug) setDebugPointer(toImagePoint(localPoint(event)));
      return;
    }
    const point = localPoint(event);
    pointers.current.set(event.pointerId, point);
    const g = gesture.current;

    if (debug) setDebugPointer(toImagePoint(point));

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.pinchStartDist > 0) {
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const next = zoomAroundPoint(
          transformRef.current,
          (g.pinchStartScale * dist) / g.pinchStartDist,
          mid,
          viewport,
          content,
        );
        g.moved = true;
        onTransformChange(next);
      }
      return;
    }

    const dx = point.x - g.startX;
    const dy = point.y - g.startY;
    if (Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE) g.moved = true;

    if (transformRef.current.scale > 1.05 && g.moved) {
      onTransformChange(
        clampTransform(
          {
            scale: transformRef.current.scale,
            tx: g.startTx + dx,
            ty: g.startTy + dy,
          },
          viewport,
          content,
        ),
      );
    }
  };

  const handlePointerUp = (event: ReactPointerEvent) => {
    const point = localPoint(event);
    const g = gesture.current;
    const wasPinch = pointers.current.size >= 2;
    pointers.current.delete(event.pointerId);
    if (wasPinch) return;

    const dx = point.x - g.startX;
    const dy = point.y - g.startY;

    // Swipe: horizontal, at rest scale.
    if (
      transformRef.current.scale <= 1.05 &&
      Math.abs(dx) > SWIPE_THRESHOLD &&
      Math.abs(dx) > Math.abs(dy) * 1.5
    ) {
      onSwipe(dx < 0 ? "left" : "right");
      return;
    }

    // Manual double-tap detection (touch does not always emit dblclick),
    // then region hit-testing for plain taps. Pointer capture retargets
    // events to the container, so taps are resolved here, not on polygons.
    if (!g.moved) {
      const now = event.timeStamp;
      if (
        now - g.lastTapTime < DOUBLE_TAP_MS &&
        Math.hypot(point.x - g.lastTapX, point.y - g.lastTapY) < 32
      ) {
        g.lastTapTime = 0;
        onDoubleTap(point);
        return;
      }
      g.lastTapTime = now;
      g.lastTapX = point.x;
      g.lastTapY = point.y;

      const region = regions.find((candidate) =>
        pointInPolygon(toImagePoint(point), candidate.polygon),
      );
      if (region) onRegionTap(region.id);
    }
  };

  const handleWheel = (event: ReactWheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return; // keep page scroll usable
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.0022);
    onTransformChange(
      zoomAroundPoint(
        transformRef.current,
        transformRef.current.scale * factor,
        localPoint(event),
        viewport,
        content,
      ),
    );
  };

  /** viewport point → image coordinate space (1024 × 1280). */
  function toImagePoint(point: { x: number; y: number }): Point {
    const t = transformRef.current;
    return [
      (point.x - t.tx) / t.scale / displayScale,
      (point.y - t.ty) / t.scale / displayScale,
    ];
  }

  const stageStyle = {
    width: content.width,
    height: content.height,
    transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
  };

  return (
    <div
      ref={containerRef}
      className={styles.viewport}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      role="img"
      aria-label={imageAlt}
    >
      <div
        className={`${styles.stage} ${animated ? styles.stageAnimated : ""}`}
        style={stageStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- shared
            transform stage needs a plain element sized to the stage */}
        <img
          src={imageSrc}
          alt=""
          className={`${styles.bodyImage} ${styles.imageFade} ${imageStatus === "ready" ? styles.imageReady : ""}`}
          draggable={false}
          onLoad={onImageLoad}
          onError={onImageError}
        />
        <svg
          className={styles.overlay}
          viewBox={`0 0 ${BODY_IMAGE_WIDTH} ${BODY_IMAGE_HEIGHT}`}
          aria-hidden="true"
        >
          <MarkerDefs />
          {regions.map((region) => (
            <polygon
              key={region.id}
              data-region={region.id}
              className={`${styles.hotspot} ${debug ? styles.hotspotDebug : ""}`}
              points={polygonToSvgPoints(region.polygon)}
            />
          ))}
          {debug ? <DebugGeometry regions={regions} pointer={debugPointer} /> : null}
          {selectedRegion ? (
            <AnatomySelectionMarker
              position={selectedRegion.centroid}
              inverseScale={1 / transform.scale}
              pulseKey={`${selectedRegion.orientation}-${selectedRegion.id}`}
            />
          ) : null}
        </svg>
      </div>
      {children}
      {debug ? (
        <div className={styles.debugPanel}>
          {`scale ${transform.scale.toFixed(2)}  tx ${transform.tx.toFixed(0)}  ty ${transform.ty.toFixed(0)}\n` +
            (debugPointer
              ? `img ${debugPointer[0].toFixed(0)}, ${debugPointer[1].toFixed(0)}`
              : "img —")}
        </div>
      ) : null}
    </div>
  );
}

function DebugGeometry({
  regions,
  pointer,
}: {
  regions: readonly AnatomyRegion[];
  pointer: Point | null;
}) {
  const gridLines = [];
  for (let x = 0; x <= BODY_IMAGE_WIDTH; x += 128) {
    gridLines.push(
      <line key={`v${x}`} x1={x} y1={0} x2={x} y2={BODY_IMAGE_HEIGHT} stroke="rgba(74,46,77,0.2)" />,
    );
  }
  for (let y = 0; y <= BODY_IMAGE_HEIGHT; y += 128) {
    gridLines.push(
      <line key={`h${y}`} x1={0} y1={y} x2={BODY_IMAGE_WIDTH} y2={y} stroke="rgba(74,46,77,0.2)" />,
    );
  }
  return (
    <g pointerEvents="none">
      {gridLines}
      {regions.map((region) => (
        <g key={region.id}>
          <circle cx={region.centroid[0]} cy={region.centroid[1]} r={5} fill="#4a2e4d" />
          <text x={region.centroid[0] + 8} y={region.centroid[1] - 8} className={styles.debugText}>
            {region.id} · {regionLabel(region.id)}
          </text>
        </g>
      ))}
      {pointer ? (
        <circle cx={pointer[0]} cy={pointer[1]} r={7} fill="none" stroke="#DFFF45" strokeWidth={3} />
      ) : null}
      <text x={12} y={30} className={styles.debugText}>
        {copy.region.title}
      </text>
    </g>
  );
}
