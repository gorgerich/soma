import type { Bounds, Point } from "./anatomy-types";

/** Area-weighted polygon centroid (shoelace); falls back to vertex average
 *  for degenerate polygons. */
export function polygonCentroid(polygon: readonly Point[]): Point {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % polygon.length];
    const cross = x1 * y2 - x2 * y1;
    area += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(area) < 1e-6) {
    const sx = polygon.reduce((sum, [x]) => sum + x, 0);
    const sy = polygon.reduce((sum, [, y]) => sum + y, 0);
    return [sx / polygon.length, sy / polygon.length];
  }
  area *= 0.5;
  return [cx / (6 * area), cy / (6 * area)];
}

export function polygonBounds(polygon: readonly Point[]): Bounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of polygon) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Ray-casting point-in-polygon test. */
export function pointInPolygon(point: Point, polygon: readonly Point[]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** SVG points attribute string. */
export function polygonToSvgPoints(polygon: readonly Point[]): string {
  return polygon.map(([x, y]) => `${x},${y}`).join(" ");
}
