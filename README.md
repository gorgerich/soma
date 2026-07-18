# Soma

Soma is a calm personal health companion that helps you visually describe where
you feel pain or discomfort, so you can build a clear picture of what you feel
before speaking to a healthcare professional.

**Tap where it hurts. Build a clear picture of what you feel.**

Soma is *not* a diagnostic application. It does not scan the body, identify
diseases, determine a diagnosis, or provide medical treatment.

This repository contains two implementations:

1. **Native SwiftUI iOS app** (`Soma/`, `Soma.xcodeproj`) — the Body Check-In
   visual prototype.
2. **Functional Next.js web application** (`web-app/`) — the Russian-language
   Soma symptom journal, deployed to Vercel at
   https://soma-showcase.vercel.app. This is the real interactive app (five-step
   flow, history, settings, local-only storage), not a showcase page.

## This iteration

The first step of the flow — the **Body Check-In** screen ("Where does it
hurt?") — with two polished states:

- **No region selected** — back of the body shown, compact bottom sheet,
  disabled Continue button.
- **Lower back selected** — muted-lavender highlight with a soft halo and a
  single pulse, light haptic, sheet rises slightly, Continue enabled.

Also included: Front/Back switching, a text-entry placeholder ("Describe it
instead"), navigation to a "Region details" placeholder, unit tests for the
selection state, and previews for the meaningful view states.

## Screenshots

Real iPhone-simulator captures live in `docs/screenshots/visual-redesign/`:

| State | File |
| --- | --- |
| Back, no selection | `01-back-idle.png` |
| Back, lower back selected | `02-back-selected.png` |
| Front view | `03-front.png` |
| Selected + large Dynamic Type | `04-selected-large-type.png` |
| iPhone SE small screen | `05-iphone-se-idle.png` |

## Web showcase

A static showcase of the prototype is deployed at
**https://soma-showcase.vercel.app**. It presents the real simulator
screenshots with product context. **It is not the app** — Soma is a native
iOS application and does not run in the browser. The showcase source lives in
[`web-preview/`](web-preview/) and contains no analytics, trackers, or
third-party scripts.

## Requirements & running

- Xcode 16.x (built and tested with Xcode 16.2, iOS 18.2 SDK)
- iOS 17.0+ deployment target, iPhone

Open `Soma.xcodeproj`, select the **Soma** scheme and an iPhone simulator, and
run. From the command line:

```sh
xcodebuild -project Soma.xcodeproj -scheme Soma \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' build

xcodebuild -project Soma.xcodeproj -scheme Soma \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' test
```

## Project structure

```
Soma/
├── App/                      # App entry point and root navigation
├── DesignSystem/             # SomaColors, SomaTypography, SomaMotion,
│   └── Components/           #   spacing tokens, haptics
├── Features/
│   └── BodyCheckIn/
│       ├── Models/           # BodyRegion, BodySide
│       ├── Views/            # BodyCheckInView, RegionDetailPlaceholderView
│       ├── Components/       # BodyHeroScene, RefinedBodyRender, BodyOutline,
│       │                     # BodyAmbientBackground, LowerBackSelectionGlow,
│       │                     # BodyOrientationControl, SymptomSelectionPanel,
│       │                     # SomaPrimaryAction, BodyCanvas
│       └── BodyCheckInViewModel.swift
├── Resources/                # Asset catalog (app icon, accent color)
└── PreviewContent/
SomaTests/                    # Swift Testing unit tests for state logic
```

## Design principles

- Calm, private, precise, tactile; premium but restrained; native to iOS.
- Warm pearl canvas with rose/coral/lavender atmospheric light fields, plum
  ink and actions, coral→lavender selection accents (semantic tokens in
  `SomaColors`); the body is the hero of one continuous scene.
- Native serif (New York) for editorial display moments, SF Pro for interface
  labels — all mapped to Dynamic Type text styles.
- Restrained motion (200–400 ms), one-shot pulse, Reduce Motion respected.
- Accessibility built in: VoiceOver labels/values/traits, 44 pt tap targets,
  state never communicated by color alone, and an alternative "Select lower
  back" control for users who find precise tapping difficult.

## Known limitations

- Only the lower-back region is selectable; other regions come later.
- "Describe it instead" shows a placeholder alert, not a text flow.
- "Region details" is a placeholder screen.
- Dark mode is a coherent fallback, not a finished dark theme.
- The body silhouette is an abstract shape composition, not final artwork.
- No persistence — state is in-memory only.

## Web application

`web-app/` — Russian-language Soma symptom journal (Next.js App Router,
strict TypeScript, CSS Modules, no backend, data stays in the browser).
See [web-app/README.md](web-app/README.md) and
[docs/WEB_APP_V0.1.md](docs/WEB_APP_V0.1.md). Production:
https://soma-showcase.vercel.app

## Release & CI

- Release notes: `docs/RELEASE_V0.1.md` (tag `v0.1.0-body-check-in`),
  `docs/WEB_APP_V0.1.md` (web application v0.1).
- CI: `.github/workflows/ios-ci.yml` builds and tests on an iPhone 16 Pro
  simulator (macOS 15 runner, no code signing).

## Next recommended step

**Region Detail** — refining the selected area and showing whether the feeling
spreads.
