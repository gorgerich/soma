/**
 * The figure's outline as one smooth closed Bézier path in a 100 × 220
 * viewBox — a direct port of the native app's BodyOutline so the web body
 * matches the accepted art direction. The right half is authored as curve
 * segments and mirrored for the left.
 */

type Point = readonly [number, number];

type Segment = {
  to: Point;
  c1: Point;
  c2: Point;
};

const CROWN: Point = [50, 8];

const RIGHT_SIDE: Segment[] = [
  { to: [60.5, 20], c1: [56, 8], c2: [60, 13] },
  { to: [57.5, 30], c1: [61, 25], c2: [59.5, 28] },
  { to: [54.5, 36], c1: [56, 32.5], c2: [55, 34] },
  { to: [76, 46], c1: [56.5, 41.5], c2: [67, 42] },
  { to: [81, 54], c1: [80, 47], c2: [81, 50] },
  { to: [84, 80], c1: [82.5, 62], c2: [84, 71] },
  { to: [83, 102], c1: [84, 88], c2: [83.8, 95] },
  { to: [80, 114], c1: [83, 107], c2: [82, 112] },
  { to: [77.5, 103], c1: [78, 112], c2: [77.6, 107] },
  { to: [78.5, 82], c1: [77.4, 96], c2: [78, 88] },
  { to: [69, 58], c1: [79, 72], c2: [73.5, 62] },
  { to: [63.5, 92], c1: [67, 70], c2: [64, 82] },
  { to: [69.5, 116], c1: [63.5, 100], c2: [67.5, 107] },
  { to: [63, 152], c1: [70.5, 128], c2: [66, 141] },
  { to: [58.5, 188], c1: [61.5, 163], c2: [60, 177] },
  { to: [55, 200], c1: [58, 193], c2: [56.8, 197.5] },
  { to: [51.5, 190], c1: [53, 199.5], c2: [52, 194.5] },
  { to: [52.5, 154], c1: [51.3, 178], c2: [52, 164] },
  { to: [50, 128], c1: [52.6, 143], c2: [51, 133] },
];

const mirror = ([x, y]: Point): Point => [100 - x, y];
const fmt = ([x, y]: Point): string => `${x} ${y}`;

function buildOutlinePath(): string {
  const parts: string[] = [`M ${fmt(CROWN)}`];
  for (const s of RIGHT_SIDE) {
    parts.push(`C ${fmt(s.c1)}, ${fmt(s.c2)}, ${fmt(s.to)}`);
  }
  for (let i = RIGHT_SIDE.length - 1; i >= 0; i -= 1) {
    const from = i === 0 ? CROWN : RIGHT_SIDE[i - 1].to;
    const s = RIGHT_SIDE[i];
    parts.push(
      `C ${fmt(mirror(s.c2))}, ${fmt(mirror(s.c1))}, ${fmt(mirror(from))}`,
    );
  }
  parts.push("Z");
  return parts.join(" ");
}

export const BODY_VIEWBOX = "0 0 100 220";

export const BODY_OUTLINE_PATH = buildOutlinePath();

/** Quiet structural contour lines: spine + shoulder blades on the back,
 *  collarbones on the front. */
export const BACK_CONTOUR_PATH =
  "M 50 47 C 50.6 62, 49.4 80, 50 94 " +
  "M 41.5 56 C 39.5 62, 42 69, 45.5 72 " +
  "M 58.5 56 C 60.5 62, 58 69, 54.5 72";

export const FRONT_CONTOUR_PATH =
  "M 41.5 45.5 C 44 47.5, 46.5 48, 49 48 " +
  "M 58.5 45.5 C 56 47.5, 53.5 48, 51 48";

/** Lower-back region footprint in the shared viewBox (lumbar, above hips). */
export const LOWER_BACK_REGION = {
  cx: 50,
  cy: 105,
  rx: 12,
  ry: 9,
} as const;
