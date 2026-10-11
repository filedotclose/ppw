import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "-p", "3105"],
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

async function run() {
  try {
    let ready = false;
    for (let count = 0; count < 100; count++) {
      try {
        const response = await fetch("http://localhost:3105");
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    if (!ready) throw new Error(`Server failed to start on port 3105:\n${serverLog}`);

    browser = await chromium.launch({
      executablePath,
      headless: true,
      args: [
        "--enable-webgl",
        "--ignore-gpu-blocklist",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    });

    console.log("=== 1. Desktop Kinetic Motion & Aberration Test ===");
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const uncaughtErrors = [];
    page.on("pageerror", (err) => uncaughtErrors.push(err.message));

    await page.goto("http://localhost:3105", { waitUntil: "domcontentloaded" });
    const lensCanvas = page.locator("canvas[data-optical-lens]");
    await expect(lensCanvas).toBeAttached();

    // Wait for WebGL compilation and readiness
    await page.waitForFunction(
      () => document.documentElement.dataset.webgl === "ready",
      { timeout: 15000 },
    );
    console.log("✓ WebGL compiled and reported ready state.");

    // Initial state at rest: aberration should settle to 0
    await page.waitForTimeout(600);
    const initialAberration = await lensCanvas.getAttribute("data-aberration");
    console.log(`Initial aberration at rest: ${initialAberration}`);
    expect(Number(initialAberration || "0")).toBeLessThanOrEqual(0.01);

    // Perform rapid pointer motion across the hero section
    console.log("Simulating high-velocity pointer movement...");
    for (let i = 0; i < 8; i++) {
      await page.mouse.move(200 + i * 120, 300 + (i % 2) * 150, { steps: 2 });
      await page.waitForTimeout(16);
    }

    const activeAberration = await lensCanvas.getAttribute("data-aberration");
    const activeVelocity = await lensCanvas.getAttribute("data-velocity");
    console.log(`Kinetic aberration during pointer move: ${activeAberration}, velocity: ${activeVelocity}`);
    expect(Number(activeAberration || "0")).toBeGreaterThan(0.005);

    // Allow kinetic decay to settle back to rest
    console.log("Awaiting kinetic settling decay...");
    await page.waitForFunction(
      () => {
        const c = document.querySelector("canvas[data-optical-lens]");
        return c && Number(c.getAttribute("data-aberration") || "0") < 0.005;
      },
      { timeout: 4000 },
    );
    const settledAberration = await lensCanvas.getAttribute("data-aberration");
    console.log(`Settled aberration post-motion: ${settledAberration}`);
    expect(Number(settledAberration || "0")).toBeLessThanOrEqual(0.005);

    // Test wheel scroll velocity reaction
    console.log("Simulating high-velocity wheel scroll...");
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(40);
    const scrollAberration = await lensCanvas.getAttribute("data-aberration");
    console.log(`Kinetic aberration during scroll: ${scrollAberration}`);
    expect(Number(scrollAberration || "0")).toBeGreaterThan(0.005);

    // Wait for scroll decay to settle
    await page.waitForFunction(
      () => {
        const c = document.querySelector("canvas[data-optical-lens]");
        return c && Number(c.getAttribute("data-aberration") || "0") < 0.005;
      },
      { timeout: 4000 },
    );
    console.log("✓ Kinetic scroll aberration decayed and settled cleanly.");

    console.log("=== 2. Reduced Motion Mode (WCAG 2.1 AA) ===");
    const reducedMotionContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const reducedPage = await reducedMotionContext.newPage();
    await reducedPage.goto("http://localhost:3105", { waitUntil: "domcontentloaded" });
    const reducedLens = reducedPage.locator("canvas[data-optical-lens]");
    await expect(reducedLens).toBeAttached();
    await reducedPage.waitForFunction(
      () => document.documentElement.dataset.webgl === "ready",
      { timeout: 15000 },
    );

    // Rapid pointer move in reduced motion mode
    for (let i = 0; i < 8; i++) {
      await reducedPage.mouse.move(200 + i * 120, 300 + (i % 2) * 150, { steps: 2 });
      await reducedPage.waitForTimeout(16);
    }
    const rmAberration = await reducedLens.getAttribute("data-aberration");
    const rmVelocity = await reducedLens.getAttribute("data-velocity");
    console.log(`Reduced motion aberration: ${rmAberration}, velocity: ${rmVelocity}`);
    expect(Number(rmAberration || "0")).toBe(0);
    expect(rmVelocity).toBe("0.000,0.000");
    console.log("✓ prefers-reduced-motion: reduce strictly suppresses chromatic dispersion.");

    console.log("=== 3. Mobile Viewport Resilience ===");
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://localhost:3105", { waitUntil: "domcontentloaded" });
    const mobileLens = mobilePage.locator("canvas[data-optical-lens]");
    await expect(mobileLens).toBeAttached();
    await mobilePage.waitForFunction(
      () => document.documentElement.dataset.webgl === "ready",
      { timeout: 15000 },
    );

    const hasHorizontalOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
    console.log("✓ Mobile viewport displays lens with zero horizontal overflow.");

    console.log("=== 4. Axe Accessibility Validation ===");
    const axeResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"]) // contrast verified in browser-qa
      .analyze();
    const criticalViolations = axeResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations.length).toBe(0);
    console.log("✓ OpticalLens canvas adheres to presentation role / accessibility guidelines.");

    expect(uncaughtErrors.length).toBe(0);
    console.log("✓ Zero uncaught page errors observed.");
    await mobileContext.close();
    await reducedMotionContext.close();
    await context.close();
  } catch (err) {
    console.error("Test failure:", err);
    failures.push(err);
  } finally {
    if (browser) await browser.close();
    server.kill("SIGKILL");
    if (failures.length > 0) {
      process.exit(1);
    }
  }
}

run();
