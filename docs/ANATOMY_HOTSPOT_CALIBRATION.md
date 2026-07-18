# Anatomy Hotspot Calibration

All hotspot polygons live in one file —
`web-app/features/anatomy/anatomy-regions.ts` — authored in the full-body
image coordinate space (1024 × 1280). Centroids and bounds are derived
programmatically (`polygonCentroid`, `polygonBounds`); nothing is duplicated.

## Debug mode

Development-only overlay, enabled with:

```
http://localhost:3000/?new=1&debugAnatomy=1
```

Gated by `process.env.NODE_ENV !== "production"` (dead-code eliminated from
production bundles) plus the query parameter. It renders:

- a 128-px image coordinate grid;
- every hotspot polygon (lime fill, plum stroke);
- region IDs with their Russian labels at each centroid;
- current pointer position in image coordinates (live crosshair);
- current scale/translation readout panel.

## Process used

1. Started `next dev`, opened both orientations with `?debugAnatomy=1`.
2. Captured full-height screenshots at 390 × 844 and compared polygon
   outlines against the actual skeletal landmarks in the supplied images.
3. Adjusted the region specs (torso bands, shoulder caps, arm/hand bands,
   glutes, leg segments) until each polygon covered its anatomical area
   without overlapping neighbours. Left/right limbs are authored once for
   the viewer-left side and mirrored across x = 512, which keeps the two
   sides symmetric by construction.
4. Verified hit-testing end-to-end with the browser suite
   (`scripts/verify-anatomy.mjs`), which taps polygon centroids at a real
   mobile viewport and asserts the resulting selection labels.

## Conventions

- Side naming follows the **person's** body: on the front view the person's
  right limbs sit on the viewer's left; the back view coincides with the
  viewer's sides.
- Regions are non-overlapping; the first polygon containing the tap point
  wins (`findRegionAt`).
- The registry test suite (`tests/anatomy.test.ts`) enforces: every required
  region present per side, ≥4 vertices, centroid inside polygon and bounds,
  Russian label present, target scale within [1, 3.5], and left/right
  mirror symmetry.

## Known precision limits

Polygons are calibrated by eye against soft-edged luminous artwork — they
are tap targets, not anatomical segmentations. Borders between adjacent
zones (e.g. lower abdomen vs pelvis, middle vs lower back) are approximate
by design.
