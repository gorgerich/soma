/**
 * Browser-level verification of the primary flow against a running build
 * (default http://localhost:3000), plus screenshot capture into
 * docs/screenshots/web-app/. Uses the locally installed Chrome via
 * Playwright's channel option — no browser download.
 *
 * Run: node scripts/verify-flow.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = resolve(process.cwd(), "../docs/screenshots/web-app");
mkdirSync(OUT, { recursive: true });

const shot = (page, name) =>
  page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });

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
});
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
const failedRequests = [];
page.on("requestfailed", (request) => failedRequests.push(request.url()));

// 1. Open — first visit lands on step 1.
await page.goto(BASE, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Где болит?" }).waitFor();
check("открывается шаг «Где болит?»", true);
check("«Сзади» выбрано изначально", await page.getByRole("radio", { name: "Сзади" }).isChecked());
check("«Продолжить» недоступна без выбора", await page.getByRole("button", { name: "Продолжить" }).isDisabled());
await shot(page, "01-body-idle");

// Front/back switching (inputs are visually hidden; click the labels).
await page.getByText("Спереди", { exact: true }).click();
check("переключение на «Спереди»", await page.getByRole("radio", { name: "Спереди" }).isChecked());
await page.getByText("Сзади", { exact: true }).click();
check("возврат на «Сзади»", await page.getByRole("radio", { name: "Сзади" }).isChecked());

// 2. Select lower back.
await page.getByRole("button", { name: "Выбрать поясницу" }).first().click();
check("область выбрана", await page.getByText("Выбранная область").isVisible());
check("«Продолжить» активна", await page.getByRole("button", { name: "Продолжить" }).isEnabled());
await shot(page, "02-body-selected");

// 3. Continue → severity.
await page.getByRole("button", { name: "Продолжить" }).click();
check("шаг интенсивности", await page.getByRole("heading", { name: "Насколько сильно болит сейчас?" }).isVisible());

// 4. Set severity to 6.
await page.getByLabel("Интенсивность боли от 0 до 10").fill("6");
check("интенсивность 6", await page.getByText("6", { exact: true }).first().isVisible());

// 5. Sensations.
await page.locator("label", { hasText: "Острая" }).first().click();
await page.locator("label", { hasText: "Покалывание" }).first().click();
await shot(page, "03-severity");

// 6. Continue → timing.
await page.getByRole("button", { name: "Продолжить" }).click();
check("шаг времени", await page.getByRole("heading", { name: "Когда это началось?" }).isVisible());

// 7–10. Timing answers.
await page.locator("label", { hasText: "Вчера" }).first().click();
await page.locator("label", { hasText: "Постепенно" }).first().click();
await page.locator("label", { hasText: "Постоянная" }).first().click();
await page.locator("label", { hasText: "Становится сильнее" }).first().click();
await shot(page, "04-time-and-pattern");
await page.getByRole("button", { name: "Продолжить" }).click();

// 11. Review.
check("экран проверки", await page.getByRole("heading", { name: "Вот что вы описали" }).isVisible());
check("не диагноз — дисклеймер", await page.getByText("Это описание ваших ощущений, а не диагноз.").isVisible());
check("итог: 6 из 10", await page.getByText("6 из 10 — умеренно").isVisible());
await shot(page, "05-review");

// 12. Save.
await page.getByRole("button", { name: "Сохранить запись" }).click();
await page.getByRole("heading", { name: "Запись сохранена" }).waitFor();
check("запись сохранена", true);
await shot(page, "06-saved");

// 13–14. History contains the episode.
await page.goto(`${BASE}/history`, { waitUntil: "networkidle" });
check("история открыта", await page.getByRole("heading", { name: "История" }).isVisible());
check("запись в истории", await page.getByText("Поясница").first().isVisible());
await shot(page, "07-history");

// Refresh persistence.
await page.reload({ waitUntil: "networkidle" });
check("запись сохраняется после перезагрузки", await page.getByText("Поясница").first().isVisible());

// Settings.
await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
check("настройки открыты", await page.getByRole("heading", { name: "Настройки" }).isVisible());
check("телефон 112", (await page.locator('a[href="tel:112"]').count()) > 0);
await page.locator("label", { hasText: "Москва" }).first().click();
await shot(page, "08-settings");

// 15. Delete the episode (auto-accept the confirm dialog).
await page.goto(`${BASE}/history`, { waitUntil: "networkidle" });
page.once("dialog", (dialog) => dialog.accept());
await page.getByRole("button", { name: "Удалить" }).first().click();
await page.waitForTimeout(300);
check("запись удалена", await page.getByText("Здесь появятся сохранённые записи").isVisible());

// Desktop + small mobile screenshots of step 1.
await context.clearCookies();
await page.evaluate(() => window.localStorage.clear());
const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const desktopPage = await desktop.newPage();
await desktopPage.goto(BASE, { waitUntil: "networkidle" });
await shot(desktopPage, "10-desktop");
await desktop.close();

const small = await browser.newContext({ viewport: { width: 360, height: 700 } });
const smallPage = await small.newPage();
await smallPage.goto(BASE, { waitUntil: "networkidle" });
await shot(smallPage, "09-mobile-small");
await small.close();

check("нет ошибок в консоли", consoleErrors.length === 0);
check("нет неудачных запросов", failedRequests.length === 0);
if (consoleErrors.length) console.log("console errors:", consoleErrors);
if (failedRequests.length) console.log("failed requests:", failedRequests);

await browser.close();
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
