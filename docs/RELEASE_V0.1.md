# Soma v0.1.0 — Body Check-In visual prototype

Release date: 2026-07-17
Tag: `v0.1.0-body-check-in`
Branch: `main`
Release commit (tag target): `00330fe`.
Follow-up commits after the tag: `47765be` (CI simulator-runtime fix) and the
deployment-evidence docs commit. The annotated tag deliberately remains on
the original release commit.
CI: https://github.com/gorgerich/soma/actions/runs/29595264795 — success.

## What this release contains

- **Native iOS application (SwiftUI, Xcode 16.2, iOS 17+, no dependencies)**
  - Body Check-In screen: atmospheric scene, refined Bézier body render,
    front/back orientation, selectable lower-back region with glow, haptics,
    organic selection panel, plum Continue action, navigation to the Region
    Details placeholder.
  - Full accessibility support (VoiceOver, Dynamic Type, Reduce Motion,
    44 pt targets, non-colour state).
  - Swift Testing unit tests for all selection/side state logic.
  - Shared Xcode scheme and GitHub Actions CI workflow
    (`.github/workflows/ios-ci.yml`).
- **Documentation** — README, `docs/IMPLEMENTATION_STATUS.md`,
  `docs/VISUAL_REDESIGN.md`, five verification screenshots in
  `docs/screenshots/visual-redesign/`.
- **Web showcase** (`web-preview/`) — static, dependency-free page presenting
  the real simulator screenshots. Deployed to Vercel at
  https://soma-showcase.vercel.app. **This is a showcase of the native app,
  not a web version of it.**

## Acceptance criteria (all verified locally)

- Project builds with zero warnings on iPhone 16 Pro simulator.
- 7/7 unit tests pass.
- Visual gate passed (see `docs/VISUAL_REDESIGN.md`), evidenced by the five
  screenshots.
- No secrets, DerivedData, or user-specific Xcode state committed.
- Region Detail intentionally not implemented.

## Verification evidence

- Build/test: `xcodebuild -project Soma.xcodeproj -scheme Soma -destination
  'platform=iOS Simulator,name=iPhone 16 Pro' test` → **TEST SUCCEEDED**,
  7 passed / 0 failed, 0 warnings (Xcode 16.2, iOS 18.2 SDK).
- Screenshots: `docs/screenshots/visual-redesign/01…05` (back idle, back
  selected, front, large Dynamic Type, iPhone SE).
- Web showcase verified locally (no console errors, all images, keyboard
  switcher) and on the production URL.

## Known limitations

- Only the lower-back region is selectable.
- "Describe it instead" and "Region details" are placeholders.
- Dark mode is a coherent fallback, not a finished theme.
- App icon is a placeholder.
- This is an early interface prototype: **not clinically validated, not a
  medical device, provides no diagnosis or treatment.**

## Rollback

- Native app: check out tag `v0.1.0-body-check-in` (first release — rolling
  back means removing the tag/branch content; no earlier release exists).
- Web showcase: Vercel keeps previous deployments; promote an earlier
  deployment from the Vercel dashboard, or redeploy `web-preview/` from the
  tagged commit.

## Native source vs web showcase

The SwiftUI application in this repository runs only on iOS/iPhone simulator.
The Vercel deployment hosts only the static `web-preview/` directory — real
screenshots and product copy, no symptom logic, no data collection.
