# Anatomy Asset Audit

_2026-07-18 — INTERACTIVE_ANATOMY_EXPERIENCE_V1_

Six user-supplied assets in `web-app/public/anatomy/source/`. Style: luminous
translucent anatomy (white skeletal/organ structure) on a warm pink field.
Sources are preserved untouched; runtime copies live in
`web-app/public/anatomy/optimized/` (sources are already efficiently
compressed — re-encoding at q82 *increased* size, so runtime files are exact
copies; total ≈ 444 KB for all six, 56–100 KB each).

**Important deviation from the brief:** the brief stated 1086 × 1448 for all
assets. Actual intrinsic sizes are:

- full-body assets: **1024 × 1280**
- detail assets: **960 × 1280**

All coordinate systems in code use the *actual* sizes
(`viewBox="0 0 1024 1280"` for full-body, 960 × 1280 for details).

## body-front.jpg — 1024 × 1280, full body, front

Landmarks: skull x≈455–567 y≈28–170; cervical spine to ≈240; clavicles
y≈250–275 x≈375–650; rib cage x≈395–630 y≈250–470; lumbar/upper-abdomen
y≈470–570; pelvis bone x≈420–600 y≈530–700; arms hang free of torso
(clear background gap), hands y≈620–790 at x≈250–340 (viewer left =
person's **right**) and x≈685–775; thighs y≈660–870; knees y≈850–935;
shins y≈935–1140; feet y≈1140–1255.

Use: initial front body map. Hosts front hotspots: head, throat, shoulders,
chest, upper/lower abdomen, pelvis, arms, hands, thighs, knees, shins, feet.
Viewer-left limbs are labelled as the person's right side.

Crop limits: generous pink margins on all sides — safe to zoom to ~3.5×.

## body-back.jpg — 1024 × 1280, full body, back

Landmarks: occiput y≈28–170; neck ≈170–250; shoulder blades x≈415–610
y≈250–350; thoracic spine center x≈505–520; lumbar spine y≈470–590;
sacrum/pelvis y≈560–700; glutes y≈640–780; thighs/knees/calves/feet match
front geometry closely (same figure pose). Viewer-left = person's **left**
on the back view.

Use: back body map. Hosts: back of head, neck, shoulders, upper/middle/lower
back, arms, hands, glutes, thighs, knees, calves, feet. Also the source for
the lower-back focused "detail" crop (no dedicated lower-back asset exists).

## detail-head-neck.jpg — 960 × 1280, detail

Skull, cervical spine, shoulder girdle top. Use for head / throat / neck /
back-of-head focus view. Anchor for marker ≈ (480, 620) at the throat line.

## detail-chest-ribs.jpg — 960 × 1280, detail

Rib cage, sternum, upper spine. Use for chest / ribs / upper-back focus.
Anchor ≈ (480, 640).

## detail-abdomen.jpg — 960 × 1280, detail

Stomach, intestines, pelvis rim visible at bottom. Use for upper/lower
abdomen and pelvis focus. Anchor ≈ (480, 560) (stomach) / (480, 820)
(lower abdomen).

## detail-legs.jpg — 960 × 1280, detail

Pelvis rim to feet, both legs, knees prominent mid-frame. Use for
thigh / knee / shin / calf / ankle / foot focus. Anchor ≈ knees (400, 560) /
(560, 560), feet ≈ (400, 1100) / (565, 1100).

## Loading strategy

- Active full-body view: eager `<img>` with decode tracking + silhouette
  placeholder.
- Opposite orientation: prefetched via `new Image()` ~1.5 s after first load.
- Detail assets: lazy-loaded only when a mapped region enters detail mode.
- No asset is decoded on first paint except the active full-body image.
