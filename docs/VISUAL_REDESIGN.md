# Visual Redesign — Body Check-In

_2026-07-17. Redesign gate for the "Where does it hurt?" screen._

## Audit of the old screen

The first implementation was functionally correct but visually weak:

- The body silhouette was assembled from overlapping capsules and read as a
  restroom pictogram, not a person.
- The flat warm-grey canvas had no depth; the figure floated in dead space.
- The composition was a fragmented vertical stack (title → small body →
  segmented control → helper text → wave → summary row → button) with large
  unused gaps.
- The full-width segmented control and grey rounded-rectangle Continue button
  looked like a default SwiftUI form.
- A visible centred "Select lower back" label read as a developer shortcut.
- The selection state (flat lavender rounded rectangle) was legible but not
  meaningful or premium.

## Principles extracted from the references

From `docs/design-references/` (health-tech concept shots):

1. **Body as hero** — the figure fills most of the screen; UI floats around it.
2. **Atmospheric light** — warm rose/coral fields radiating from the body,
   not a flat background.
3. **Organic surfaces** — the lower sheet sweeps in a deep asymmetric curve
   that embraces floating circular/capsule controls half-sunk into its crest.
4. **Editorial typography** — large, confident headline; small precise labels.
5. **Integrated actions** — a capsule Continue with a circular arrow
   affordance; secondary actions stay quiet.
6. **Localised luminous selection** — the chosen spot glows softly with an
   explicit text label elsewhere on screen.

Deliberately **not** adopted: the references' X-ray/skeleton anatomy (Soma
must not resemble a scan or diagnostic imagery), their saturated pink
full-screen washes, and any literal layout, branding, or asset.

## What changed

- **Palette** — the sage/ivory scheme was replaced with semantic tokens in
  `SomaColors`: pearl canvas, rose/coral/lavender atmosphere fields, plum ink,
  deep-plum action, coral→lavender selection accents. Dark mode keeps a
  coherent fallback.
- **Typography** — `SomaTypography` mixes native serif (New York) display and
  panel titles with SF Pro labels; all styles map to Dynamic Type.
- **Body** — `RefinedBodyRender` draws one smooth closed Bézier outline
  (`BodyOutline`, authored as a mirrored right half in a shared 100 × 220
  canvas space) with layered material: vertical ivory→rose gradient, radial
  inner luminosity, a blurred shaded rim for volume, a crisp hairline edge,
  and quiet per-side contour lines (spine + shoulder blades on the back,
  collarbones on the front). Elongated editorial proportions (~8.5 heads).
- **Atmosphere** — `BodyAmbientBackground` layers three static radial light
  fields over the pearl base; the coral field intensifies slightly when a
  region is selected (single animated value, no perpetual animation).
- **Selection** — `LowerBackSelectionGlow`: idle shows a quiet lavender ring
  and luminous dot marking the tappable spot; selected shows a diffuse
  coral→lavender field, a refined gradient contour ring, a soft core, and one
  restrained pulse. The panel simultaneously shows "SELECTED AREA / Lower
  back", so state is never colour-only.
- **Composition** — one continuous scene: compact chrome (serif wordmark +
  privacy control), editorial headline, full-width body scene, and the panel
  crest (`PanelCrestShape`) rising asymmetrically toward the selection point.
  The figure's legs continue behind the panel.
- **Orientation control** — `BodyOrientationControl`: a compact floating
  capsule (ultra-thin material, plum selected pill) half-sunk into the panel
  crest instead of a full-width segmented control.
- **Primary action** — `SomaPrimaryAction`: plum capsule with an integrated
  circular arrow affordance; the whole capsule is the button. Disabled state
  is dormant (outlined, quiet) rather than system grey.
- **Removed developer UI** — the visible "Select lower back" text control is
  gone; see accessibility below.

## Components replaced

| Removed | Replaced by |
| --- | --- |
| `ColorTokens` | `SomaColors` |
| `TypographyTokens` | `SomaTypography` (+ `SomaMotion`) |
| `BodySilhouette` (capsule union) | `BodyOutline` + `RefinedBodyRender` |
| `BodyIllustration` | `BodyHeroScene` |
| `BodyRegionOverlay` | `LowerBackSelectionGlow` |
| `BodySidePicker` | `BodyOrientationControl` |
| `OrganicSheet` + `RegionSelectionSummary` | `SymptomSelectionPanel` (+ `PanelCrestShape`) |
| `PrimaryButtonStyle` | `SomaPrimaryAction` |
| — | `BodyAmbientBackground` (new) |

`BodyCheckInViewModel`, models, navigation, and all state tests are unchanged.

## Accessibility decisions

- The on-body region remains a real `Button` with label, value, selected
  trait, and hints.
- The removed visible helper is replaced by a named accessibility action on
  the body scene ("Select lower back" / "Deselect lower back"), so VoiceOver
  users can toggle the region without hunting for the small target.
- Selection is announced through the panel's explicit "Selected area — Lower
  back" text, not colour alone.
- Orientation capsule keeps per-segment labels ("Front view"/"Back view") and
  selected traits; all targets are ≥ 44 pt.
- Reduce Motion: opacity-only transitions, no pulse, no spatial squeeze, no
  entrance offsets.
- Large Dynamic Type verified by screenshot (accessibility M).

## Performance considerations

- The body render is a single `Canvas` that redraws only on side/size change;
  blur filters are applied at draw time, not animated.
- Ambient light fields are static gradients; only one opacity value animates
  on selection.
- No perpetual animations anywhere; the pulse runs once per selection.
- One `GeometryReader` (inside the hero scene) supplies the shared coordinate
  space; layout otherwise uses stacks and safe-area insets.

## Remaining visual limitations

- The figure is still a stylised vector construction — good enough for this
  gate, but a commissioned illustration or refined path set could add more
  anatomical grace (glutes/knee shaping, hand detail).
- Dark mode is a coherent fallback, not an art-directed dark theme.
- The app icon is still an empty placeholder.
- Grain/texture was skipped intentionally (cost/benefit on older devices).
