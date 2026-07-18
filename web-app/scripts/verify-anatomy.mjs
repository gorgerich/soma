/**
 * Browser-level verification of the interactive anatomy experience plus
 * screenshot capture into docs/screenshots/anatomy-v1/. Drives the locally
 * installed Chrome via Playwright (channel option, no browser download).
 *
 * Run with the app served on localhost:3000 (or BASE_URL):
 *   node scripts/verify-anatomy.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = resolve(process.cwd(), "../docs/screenshots/anatomy-v1");
mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok) {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) process.exitCode = 1;
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: "ru-RU",
  hasTouch: true,
});
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
const failedRequests = [];
page.on("requestfailed", (r) => {
  // Navigation cancels in-flight prefetches; aborts are not real failures.
  if (r.failure()?.errorText === "net::ERR_ABORTED") return;
  failedRequests.push(r.url());
});

const shot = (name, target = page) =>
  target.screenshot({ path: `${OUT}/${name}.png` });

async function waitImageReady() {
  await page.waitForFunction(() => {
    const img = document.querySelector("img[src*='anatomy']");
    return img && img.complete && img.naturalWidth > 0;
  });
  await page.waitForTimeout(600);
}

/* ---------- Mobile body flow ---------- */

// 1–2. Open root, Russian UI, back view initial.
await page.goto(`${BASE}/?new=1`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Где болит?" }).waitFor();
check("русский интерфейс, шаг «Где болит?»", true);
check("«Сзади» выбрано изначально", await page.getByRole("radio", { name: "Сзади" }).isChecked());
await waitImageReady();
await shot("02-back-full");

// 3. Swipe to front (horizontal drag on the viewport).
const viewport = page.locator("div[role='img']").first();
const box = await viewport.boundingBox();
await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(700);
check("свайп переключает на «Спереди»", await page.getByRole("radio", { name: "Спереди" }).isChecked());
await waitImageReady();
await shot("01-front-full");

// 4–5. Tap abdomen hotspot; marker + label appear.
await page.locator("polygon[data-region='lowerAbdomen']").click({ force: true });
await page.waitForTimeout(500);
check("область выбрана: Низ живота", await page.getByText("Низ живота").first().isVisible());
check("«Продолжить» активна", await page.getByRole("button", { name: "Продолжить" }).isEnabled());
await shot("03-front-abdomen-selected");

// 6. Focus zoom via the visible zoom control.
await page.getByRole("button", { name: "Приблизить" }).click();
await page.getByRole("button", { name: "Приблизить" }).click();
await page.waitForTimeout(700);
check("зум работает (появилась кнопка возврата)", await page.getByRole("button", { name: "Вернуться к телу" }).isVisible());
await shot("04-abdomen-focused");

// 7. Detail abdomen image.
await page.getByRole("button", { name: "Вернуться к телу" }).click();
await page.waitForTimeout(600);
await page.getByRole("button", { name: "Показать крупнее" }).click();
await page.waitForTimeout(900);
check("детальный вид живота", await page.locator("img[src*='detail-abdomen']").isVisible());
await shot("07-legs-detail-placeholder-abdomen"); // temp name, real capture below

// 8. Return to full body.
await page.getByRole("button", { name: "К общему виду" }).click();
await page.waitForTimeout(600);
check("возврат к общему виду", !(await page.locator("img[src*='detail-abdomen']").isVisible()));

// Deselect abdomen to keep state clean, then capture head/chest/legs details.
await page.locator("polygon[data-region='lowerAbdomen']").click({ force: true });
await page.waitForTimeout(400);

async function captureDetail(regionSelector, expectedSrc, file) {
  await page.locator(regionSelector).click({ force: true });
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Показать крупнее" }).click();
  await page.waitForTimeout(900);
  const ok = await page.locator(`img[src*='${expectedSrc}']`).isVisible();
  check(`детальный вид: ${expectedSrc}`, ok);
  await shot(file);
  await page.getByRole("button", { name: "К общему виду" }).click();
  await page.waitForTimeout(500);
  // deselect
  await page.locator(regionSelector).click({ force: true });
  await page.waitForTimeout(300);
}

await captureDetail("polygon[data-region='head']", "detail-head-neck", "05-head-detail");
await captureDetail("polygon[data-region='chest']", "detail-chest-ribs", "06-chest-detail");
await captureDetail("polygon[data-region='leftKnee']", "detail-legs", "07-legs-detail");

// 9–10. Switch to back via button; select lower back.
await page.getByText("Сзади", { exact: true }).click();
await page.waitForTimeout(700);
await waitImageReady();
await page.locator("polygon[data-region='lowerBack']").click({ force: true });
await page.waitForTimeout(500);
check("поясница выбрана", await page.getByText("Поясница").first().isVisible());
await shot("08-lower-back-selected");

// Lower back focused crop (no dedicated asset → deeper zoom of body-back).
await page.getByRole("button", { name: "Показать крупнее" }).click();
await page.waitForTimeout(800);
check(
  "фокус на пояснице без детального изображения",
  !(await page.locator("img[src*='detail-']").first().isVisible().catch(() => false)),
);
await shot("09-lower-back-focused");
await page.getByRole("button", { name: "Вернуться к телу" }).click();
await page.waitForTimeout(500);

// 11. Continue → severity (transition).
await page.getByRole("button", { name: "Продолжить" }).click();
await page.getByRole("heading", { name: "Насколько сильно болит сейчас?" }).waitFor();
check("переход к шагу интенсивности", true);
check("чип с областью на шаге 2", await page.getByText("Поясница").first().isVisible());
await shot("11-severity-transition");

// 12. Complete the existing flow.
await page.getByLabel("Интенсивность боли от 0 до 10").fill("6");
await page.locator("label", { hasText: "Острая" }).first().click();
await page.getByRole("button", { name: "Продолжить" }).click();
await page.locator("label", { hasText: "Вчера" }).first().click();
await page.locator("label", { hasText: "Постепенно" }).first().click();
await page.locator("label", { hasText: "Постоянная" }).first().click();
await page.locator("label", { hasText: "Становится сильнее" }).first().click();
await page.getByRole("button", { name: "Продолжить" }).click();
await page.getByRole("heading", { name: "Вот что вы описали" }).waitFor();
check("обзор с областью «Поясница»", await page.getByText("Поясница").first().isVisible());
check("превью тела на обзоре", await page.locator("img[src*='body-back']").first().isVisible());
await shot("12-review-with-body");

// 13. Save; 14. History shows the region.
await page.getByRole("button", { name: "Сохранить запись" }).click();
await page.getByRole("heading", { name: "Запись сохранена" }).waitFor();
await page.goto(`${BASE}/history`, { waitUntil: "networkidle" });
check("область в истории", await page.getByText("Поясница").first().isVisible());

/* ---------- Gesture fallback flow ---------- */

await page.goto(`${BASE}/?new=1`, { waitUntil: "networkidle" });
await waitImageReady();
// front side for throat
await page.getByText("Спереди", { exact: true }).click();
await page.waitForTimeout(600);
await page.getByRole("button", { name: "Выбрать область из списка" }).click();
await page.getByRole("dialog").waitFor();
await shot("10-region-list");
await page.getByRole("button", { name: "Горло" }).click();
await page.waitForTimeout(400);
check("выбор из списка: Горло", await page.getByText("Горло").first().isVisible());
// visible zoom controls
await page.getByRole("button", { name: "Приблизить" }).click();
await page.getByRole("button", { name: "Вернуть исходный масштаб" }).click();
check("контролы масштаба работают", true);
// keyboard continue: focus the primary button and press Enter
await page.getByRole("button", { name: "Продолжить" }).focus();
await page.keyboard.press("Enter");
await page.getByRole("heading", { name: "Насколько сильно болит сейчас?" }).waitFor();
check("продолжение с клавиатуры", true);
// back preserves state
await page.getByRole("button", { name: "Назад" }).click();
await page.waitForTimeout(600);
check("назад сохраняет выбор", await page.getByText("Горло").first().isVisible());

/* ---------- Persistence migration ---------- */

const legacy = [{
  id: "legacy-1",
  schemaVersion: 1,
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-01T10:00:00.000Z",
  region: "lowerBack",
  bodySide: "back",
  severity: 4,
  sensations: ["dull"],
  onsetPreset: "today",
  onsetPattern: "gradual",
  frequencyPattern: "constant",
  progression: "unchanged",
  status: "active",
}];
await page.evaluate((data) => {
  window.localStorage.setItem("soma.episodes.v1", JSON.stringify(data));
}, legacy);
await page.goto(`${BASE}/history`, { waitUntil: "networkidle" });
check("старая запись читается после миграции", await page.getByText("Поясница").first().isVisible());

/* ---------- Size screenshots ---------- */

const small = await browser.newContext({ viewport: { width: 360, height: 800 }, hasTouch: true });
const smallPage = await small.newPage();
await smallPage.goto(`${BASE}/?new=1`, { waitUntil: "networkidle" });
await smallPage.waitForTimeout(2500);
await shot("13-small-mobile", smallPage);
await small.close();

const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const desktopPage = await desktop.newPage();
await desktopPage.goto(`${BASE}/?new=1`, { waitUntil: "networkidle" });
await desktopPage.waitForTimeout(2500);
await shot("14-desktop", desktopPage);
await desktop.close();

check("нет ошибок в консоли", consoleErrors.length === 0);
check("нет неудачных запросов", failedRequests.length === 0);
if (consoleErrors.length) console.log("console errors:", consoleErrors.slice(0, 5));
if (failedRequests.length) console.log("failed requests:", failedRequests.slice(0, 5));

await browser.close();
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
