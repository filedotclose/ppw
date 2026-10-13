import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const PORT = 3110;
const root = process.cwd();

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] }
);

let serverLog = "";
server.stdout.on("data", (chunk) => { serverLog += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverLog += chunk.toString(); });

const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : undefined);

const viewports = [
  { name: "Ultra-compact (iPhone SE 1st / Fold cover)", width: 320, height: 568 },
  { name: "Compact Android (Galaxy A series)", width: 360, height: 740 },
  { name: "iPhone 8 / SE 2nd gen", width: 375, height: 667 },
  { name: "iPhone 12/13/14/15/16", width: 390, height: 844 },
  { name: "Pixel 7 / 8", width: 412, height: 915 },
  { name: "iPhone 14/15/16 Pro Max", width: 430, height: 932 },
  { name: "Landscape Compact Phone", width: 667, height: 375 },
  { name: "Landscape Standard Phone", width: 844, height: 390 },
];

const results = [];

try {
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 600));
  }

  if (!ready) {
    throw new Error(`Dev server failed to start:\n${serverLog}`);
  }

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    // Check Home Page
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const homeOverflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const overflowingElements = [];
      document.querySelectorAll("*").forEach((el) => {
        if (el.closest(".optical-fallback")) return;
        if (el.closest('[aria-hidden="true"]')) return;
        const r = el.getBoundingClientRect();
        if (r.right > winW + 1 && r.width > 0 && r.height > 0) {
          overflowingElements.push({
            tag: el.tagName,
            cls: el.className,
            id: el.id,
            text: el.innerText ? el.innerText.trim().slice(0, 30) : "",
            right: Math.round(r.right),
            width: Math.round(r.width),
          });
        }
      });
      const bodyText = document.body.textContent || "";
      const hasEmojiArrows = /[\u2190-\u21FF]/u.test(bodyText);
      const vectorArrows = document.querySelectorAll("[data-vector-arrow] svg path");
      const bridgeVectors = Array.from(
        document.querySelectorAll(".bridge-direction svg"),
      ).map((svg) => {
        const rect = svg.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      });
      return {
        hasOverflow: docW > winW,
        docW,
        winW,
        hasEmojiArrows,
        vectorArrowCount: vectorArrows.length,
        bridgeVectors,
        topOverflowing: overflowingElements.slice(0, 5),
      };
    });

    // Check Projects Page
    await page.goto(`http://localhost:${PORT}/projects`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const projectsOverflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const overflowingElements = [];
      document.querySelectorAll("*").forEach((el) => {
        if (el.closest(".projects-horizontal-track")) return;
        if (el.closest(".projects-filter-chips")) return;
        if (el.closest('[aria-hidden="true"]')) return;
        const r = el.getBoundingClientRect();
        if (r.right > winW + 1 && r.width > 0 && r.height > 0) {
          overflowingElements.push({
            tag: el.tagName,
            cls: el.className,
            id: el.id,
            text: el.innerText ? el.innerText.trim().slice(0, 30) : "",
            right: Math.round(r.right),
            width: Math.round(r.width),
          });
        }
      });
      const bodyText = document.body.textContent || "";
      const hasEmojiArrows = /[\u2190-\u21FF]/u.test(bodyText);
      const vectorArrows = document.querySelectorAll("[data-vector-arrow] svg path");
      return {
        hasOverflow: docW > winW,
        docW,
        winW,
        hasEmojiArrows,
        vectorArrowCount: vectorArrows.length,
        topOverflowing: overflowingElements.slice(0, 5),
      };
    });

    results.push({
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      home: homeOverflow,
      projects: projectsOverflow,
    });

    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));

  const failed = results.some(
    (r) =>
      r.home.hasOverflow ||
      r.projects.hasOverflow ||
      r.home.hasEmojiArrows ||
      r.projects.hasEmojiArrows ||
      r.home.vectorArrowCount === 0 ||
      r.projects.vectorArrowCount === 0 ||
      r.home.bridgeVectors.length < 2 ||
      r.home.bridgeVectors.some((b) => b.width <= 0 || b.height <= 0),
  );
  if (failed) {
    process.exitCode = 1;
  }
} finally {
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"]);
  } else {
    server.kill("SIGTERM");
  }
}
