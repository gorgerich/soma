# Soma — веб-приложение

Функциональная веб-версия Soma: дневник самочувствия на русском языке.
Пользователь показывает, где болит, описывает ощущение и сохраняет
структурированную запись. Приложение не ставит диагнозы и не заменяет врача.

## Стек

- Next.js (App Router), React, строгий TypeScript
- CSS Modules + дизайн-токены (перламутр / роза / коралл / лаванда / слива)
- Состояние потока — feature-редьюсер (`features/symptom-check-in/reducer.ts`)
- Данные — только в браузере: `localStorage`, версионированные ключи
  `soma.episodes.v1` и `soma.settings.v1`, с валидацией при чтении
- Без бэкенда, аналитики, внешних шрифтов и сторонних скриптов
- PWA: манифест, иконки, standalone-режим

## Команды

```sh
npm install
npm run dev        # разработка
npm run build      # продакшен-сборка
npm run start      # запуск собранного приложения
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # vitest (редьюсер + валидация хранилища)
```

Браузерная проверка основного сценария (нужен установленный Chrome,
приложение должно быть запущено на localhost:3000):

```sh
node scripts/verify-flow.mjs
```

Скрипт проходит весь поток (выбор поясницы → интенсивность → время →
проверка → сохранение → история → удаление) и сохраняет скриншоты в
`../docs/screenshots/web-app/`.

## Структура

```
app/                  # маршруты: /, /history, /settings, manifest
components/
  body/               # SVG-тело и общий viewBox координат
  check-in/           # пятишаговый поток
  navigation/         # шапка приложения
  ui/                 # кнопки, группы выбора
features/symptom-check-in/
  model.ts            # типы эпизода и настроек
  copy.ru.ts          # все русские строки
  reducer.ts          # состояние потока
  storage.ts          # localStorage + валидация
  format.ts           # форматирование ru-RU
lib/                  # useClientValue (гидратация без setState-in-effect)
tests/                # vitest
```

## Деплой

Vercel, проект `soma-showcase`, деплой из каталога `web-app`
(фреймворк Next.js). Продакшен: https://soma-showcase.vercel.app
