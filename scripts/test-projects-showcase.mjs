import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const PORT = 3105;

const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    process.argv.includes("--production") ? "start" : "dev",
    "-p",
    String(PORT),
  ],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
);

let serverLog = "";
server.stdout.on("data", (chunk) => {
  serverLog += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverLog += chunk.toString();
});

const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : undefined);

let browser;
const failures = [];
const errors = [];

try {
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/projects`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!ready) {
    throw new Error(`Server failed to start on port ${PORT}:\n${serverLog}`);
  }

  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(`http://localhost:${PORT}/projects`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1000);

  // 1. Check all 9 projects are rendered in horizontal track
  const panels = page.locator(".project-study-panel");
  const count = await panels.count();
  if (count !== 9) {
    failures.push(`Expected 9 project study panels, found ${count}`);
  }

  // 2. Check first project is KIIT KSAC GatePass Pro
  const firstTitle = await panels.first().locator(".panel-title").innerText();
  if (!firstTitle.includes("KSAC") || !firstTitle.includes("GatePass")) {
    failures.push(`Expected first project to be KSAC GatePass, got: "${firstTitle}"`);
  }

  // 3. Test filter chips
  const fullstackChip = page.locator(".filter-chip", { hasText: "Full-Stack" });
  await fullstackChip.click();
  await page.waitForTimeout(500);
  const fullstackCount = await page.locator(".project-study-panel").count();
  if (fullstackCount !== 5) {
    failures.push(`Expected 5 Full-Stack projects, got ${fullstackCount}`);
  }

  const allChip = page.locator(".filter-chip", { hasText: "All Projects" });
  await allChip.click();
  await page.waitForTimeout(500);

  // 4. Test View Mode Toggle (Grid View)
  const toggleBtn = page.locator(".view-toggle-btn");
  await toggleBtn.click();
  await page.waitForTimeout(500);
  const gridContainer = page.locator(".projects-grid-container");
  if ((await gridContainer.count()) === 0) {
    failures.push("Grid view container not found after clicking toggle");
  }

  // Toggle back to Horizontal GSAP Scroll
  await toggleBtn.click();
  await page.waitForTimeout(500);

  // 5. Test Detail Modal inspection
  const openBtn = panels.first().locator(".panel-open-btn");
  await openBtn.click();
  await page.waitForTimeout(600);

  const dialog = page.locator(".projects-detail-dialog");
  const isOpen = await dialog.evaluate((el) => el.hasAttribute("open"));
  if (!isOpen) {
    failures.push("Detail dialog did not open when clicking inspect button");
  }

  const modalTitle = await page.locator("#modal-project-title").innerText();
  if (!modalTitle.includes("KIIT KSAC GatePass Pro")) {
    failures.push(`Unexpected modal title: ${modalTitle}`);
  }

  // Close modal via Close button
  const closeBtn = page.locator(".modal-header button");
  await closeBtn.click();
  await page.waitForTimeout(500);
  const isClosed = await dialog.evaluate((el) => !el.hasAttribute("open"));
  if (!isClosed) {
    failures.push("Detail dialog did not close after clicking Close");
  }

  // 6. Test Interactive Schematic in KLICK Switch Simulator
  const klickPanel = page.locator("#project-klick");
  if ((await klickPanel.count()) > 0) {
    const simulateBtn = klickPanel.locator(".klick-tap-btn");
    await simulateBtn.click();
    await page.waitForTimeout(200);
    const countText = await simulateBtn.innerText();
    if (!countText.includes("Count: 2")) {
      failures.push(`Expected key strike count 2, got: ${countText}`);
    }
  }

  // 7. Test Gesture-MIDI virtual piano key click
  const gesturePanel = page.locator("#project-gesture-midi");
  if ((await gesturePanel.count()) > 0) {
    const keyC = gesturePanel.locator(".virtual-key", { hasText: "C" });
    await keyC.click();
    await page.waitForTimeout(200);
  }

  // 8. Run Axe-core accessibility audit
  const axe = await new AxeBuilder({ page })
    .disableRules(["color-contrast"]) // contrast tested separately across custom themes
    .analyze();
  if (axe.violations.length > 0) {
    for (const v of axe.violations) {
      failures.push(`Axe violation: ${v.id} - ${v.description}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        success: failures.length === 0 && errors.length === 0,
        errors,
        failures,
      },
      null,
      2,
    ),
  );

  if (failures.length > 0 || errors.length > 0) {
    process.exitCode = 1;
  }
} finally {
  await browser?.close();
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const kill = spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
        stdio: "ignore",
      });
      kill.on("exit", resolve);
    });
  } else {
    server.kill("SIGTERM");
  }
}
