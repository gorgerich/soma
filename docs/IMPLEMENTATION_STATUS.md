# Implementation Status

_Last updated: 2026-07-17 (release gate v0.1.0)_

## Release

- Visual gate: **PASS** (see `docs/VISUAL_REDESIGN.md`)
- Release date: 2026-07-17, tag `v0.1.0-body-check-in`, branch `main`
- Remote: https://github.com/gorgerich/soma
- Commit SHA: _recorded in the deployment-evidence commit after release_
- Web showcase (static, not the native app):
  https://soma-showcase.vercel.app
- CI: `.github/workflows/ios-ci.yml` — status recorded post-push

## Completed work

### Iteration 1 — foundation
- Scaffolded a native SwiftUI iOS project (`Soma.xcodeproj`, Xcode 16
  synchronized-folder format) with a feature-oriented structure and no external
  dependencies.
- Body Check-In screen with full state behaviour: Back initially selected,
  Front/Back switching, lower-back select/deselect with haptics, selection
  preserved (hidden) on Front and restored on Back, Continue gating,
  "Describe it instead" placeholder alert, navigation to the "Region details"
  placeholder.
- Unit tests for all selection/side state logic (Swift Testing).

### Iteration 2 — visual redesign (this gate)
- New art direction: pearl/rose/lavender atmosphere, plum ink and actions,
  editorial serif typography. Semantic tokens in `SomaColors`,
  `SomaTypography`, `SomaMotion`.
- Replaced the primitive capsule silhouette with `RefinedBodyRender`: one
  smooth mirrored Bézier outline (`BodyOutline`, shared 100 × 220 canvas
  space) with layered material, inner luminosity, shaded rim, and per-side
  contour hints (spine/shoulder blades vs collarbones).
- Full-bleed `BodyAmbientBackground` light fields; body occupies most of the
  vertical field and continues behind the panel.
- `LowerBackSelectionGlow`: quiet luminous marker when idle; coral→lavender
  glow, refined contour ring, and single pulse when selected — explicitly
  labelled "Selected area / Lower back" in the panel so state is never
  colour-only.
- `SymptomSelectionPanel` with asymmetric `PanelCrestShape` crest that lifts
  on selection; floating `BodyOrientationControl` capsule half-sunk into the
  crest; `SomaPrimaryAction` plum capsule with circular arrow affordance and
  a dormant (non-grey) disabled state.
- Removed the visible "Select lower back" developer-style helper; replaced by
  a named VoiceOver accessibility action on the body scene.
- One-shot appearance motion (body fades, panel settles); Reduce Motion uses
  opacity-only variants everywhere.
- See `docs/VISUAL_REDESIGN.md` for the audit, principles, and decisions.

## Build status

- `xcodebuild -project Soma.xcodeproj -scheme Soma -destination
  'platform=iOS Simulator,name=iPhone 16 Pro' build` →
  **BUILD SUCCEEDED** (Xcode 16.2, iOS 18.2 SDK, zero warnings).

## Tests run

- `xcodebuild -project Soma.xcodeproj -scheme Soma -destination
  'platform=iOS Simulator,name=iPhone 16 Pro' test` →
  **TEST SUCCEEDED**, 7 of 7 unit tests passed (Swift Testing), rerun after
  the redesign; view-model behaviour intentionally unchanged.
- Visual verification screenshots in `docs/screenshots/visual-redesign/`:
  back idle, back selected, front, selected with accessibility-M Dynamic
  Type (iPhone 16 Pro), and iPhone SE (3rd gen) idle.

## Known issues

- App icon is an empty placeholder (no artwork yet).
- Dark mode is a coherent fallback, not an art-directed dark theme.
- DEBUG-only launch hooks (`SOMA_DEBUG_PRESELECT=lowerBack`,
  `SOMA_DEBUG_SIDE=front`) exist for QA/tooling; compiled out of release.
- The figure is a stylised vector construction; a commissioned illustration
  could further refine anatomy (hands, glutes, knees).

## Deliberate scope exclusions

- No authentication, backend, analytics, networking, databases, HealthKit,
  medical AI, or diagnosis of any kind.
- Only the lower-back region is implemented; the region model is ready for
  more cases.
- No full text-entry flow ("Describe it instead" is a placeholder alert).
- No UI tests (state logic is unit-tested; UI automation deferred until the
  flow has more than one real screen).
- Region Detail is **not** implemented — still the next task.

## Recommended next task

**Region Detail** — refine the selected area and capture whether the feeling
spreads.
