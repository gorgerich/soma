# Soma web showcase

Static, dependency-free showcase of the native iOS Body Check-In prototype.
It displays real iPhone-simulator screenshots of the SwiftUI app — it is
**not** a web version of the app and contains no symptom logic.

## Contents

- `index.html` — single-page showcase (semantic HTML, keyboard-accessible
  state switcher with radio-group semantics)
- `styles.css` — Soma art direction (pearl/rose/coral/lavender/plum), fully
  responsive, `prefers-reduced-motion` support
- `script.js` — screenshot switcher; no trackers, analytics, or external
  scripts
- `assets/` — optimized copies of the five verification screenshots (originals
  live in `docs/screenshots/visual-redesign/`) plus a local favicon

## Run locally

```sh
python3 -m http.server 4173 --directory web-preview
# open http://localhost:4173
```

## Deploy

Deployed to Vercel as a static site with root directory `web-preview`
(framework preset: Other). No build step, no environment variables.
