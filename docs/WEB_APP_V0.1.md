# Soma Web Application v0.1 (Russian)

Release date: 2026-07-18
Production: https://soma-showcase.vercel.app

The production Vercel domain now serves the **interactive Soma web
application** in Russian. The previous static screenshot showcase
(`web-preview/`) has been removed from the repository and from production.

## Implemented user flow

1. **Где болит?** — interactive SVG body (shared 100 × 220 viewBox for the
   figure, contour details, selection glow and hit target), «Спереди/Сзади»
   switching (back first), tappable/deselectable lower back, explicit
   «Выбранная область — Поясница» state, semantic «Выбрать поясницу»
   control, state-dependent «Продолжить».
2. **Насколько сильно болит сейчас?** — 0–10 slider with −/+ steppers,
   number + plain-language label (Не болит / Слабо / Умеренно / Сильно /
   Очень сильно), multi-select sensation chips, optional free text
   (500 chars, live counter).
3. **Когда это началось?** — onset presets incl. real date input capped at
   today, onset character, frequency, dynamics.
4. **Вот что вы описали** — structured summary generated from state, per-row
   «Изменить» returning to review, compact body visual, disclaimer «Это
   описание ваших ощущений, а не диагноз», save / start over.
5. **Запись сохранена** — local-only storage note, open / history / new.

Home (`/`) after ≥1 saved episode: «Как вы себя чувствуете?» with the latest
episode card, «Обновить состояние» (edits the record), «Начать новую запись»,
«История». First visit opens straight into step 1.

`/history`: list with date/time (ru-RU), intensity, sensations, dynamics;
open, edit, duplicate-as-new, delete with confirmation; empty state with CTA.

`/settings`: optional city (Москва / Санкт-Петербург / Другой город, stored
locally, no geolocation), data section (JSON export, delete-all with
confirmation), emergency block with `tel:112`, about text.

## Localisation

- `<html lang="ru">`, all product copy in natural Russian, centralised in
  `web-app/features/symptom-check-in/copy.ru.ts`
- Dates/times via `Intl.DateTimeFormat("ru-RU")`, 24-hour, day-month order
- Internal identifiers remain stable English enums

## State model & persistence

- Typed `SymptomEpisode` (schemaVersion 1) + `Settings`
- Feature reducer (`reducer.ts`) with explicit actions; step gating via
  `canGoNext`; review-edit round-trips
- `localStorage` keys `soma.episodes.v1`, `soma.settings.v1`; every loaded
  entry validated, malformed data dropped silently; storage read only after
  hydration via a `useSyncExternalStore` hook (no hydration errors)

## Accessibility

- Full keyboard completion (native radios/checkboxes/range/date under styled
  labels), visible focus states, semantic headings/fieldsets/legends
- Selection state expressed in text + check marks, never colour alone
- ≥44 px touch targets, `prefers-reduced-motion` kills all motion
- Body region selectable without precise pointer via «Выбрать поясницу»

## Safety limitations

No diagnosis, no probabilities, no treatment or medication advice, no triage.
Emergency guidance limited to the 112 information block in settings.
Not clinically validated.

## Build & verification evidence

- `npm run lint` — clean (no disabled rules)
- `npm run typecheck` — clean (strict TS)
- `npm run test` — 18/18 vitest tests (reducer + storage validation)
- `npm run build` — success (Next.js 16.2.10, React 19.2.4)
- Browser-level flow (`web-app/scripts/verify-flow.mjs`, Playwright driving
  installed Chrome): **22/22 checks** against the local production build and
  again against https://soma-showcase.vercel.app — includes the full
  select→severity→timing→review→save→history→delete script, refresh
  persistence, console/network cleanliness
- Screenshots of the live web UI: `docs/screenshots/web-app/01…10`

## Vercel configuration

- Project: `soma-showcase` (scope `rics-projects-9baa2793`)
- Deployed from `web-app/` (`vercel --cwd web-app`), framework pinned to
  Next.js via `web-app/vercel.json`
- Production alias: https://soma-showcase.vercel.app

## Known limitations

- Body map supports only the lower back; other regions later
- Data lives only in the current browser (no backend, no sync, no encryption
  claims)
- No clinic integration or regional care navigation yet (city is stored for
  the future)
- PWA: manifest + icons + standalone display; no offline service worker yet
