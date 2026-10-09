import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "qa");
await mkdir(out, { recursive: true });
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    process.argv.includes("--production") ? "start" : "dev",
    "-p",
    "3100",
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
try {
  let ready = false;
  for (let count = 0; count < 100; count++) {
    try {
      const response = await fetch("http://localhost:3100");
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  if (!ready) throw new Error(`Server did not become ready:\n${serverLog}`);
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
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await desktopContext.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("http://localhost:3100", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(out, "desktop-hero.png") });
  await expect(page.locator("html")).toHaveClass(/(?:^|\s)lenis(?:\s|$)/);
  const wheelSamples = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const start = performance.now();
        const samples = [];
        document.documentElement.dispatchEvent(
          new WheelEvent("wheel", {
            deltaY: 600,
            bubbles: true,
            cancelable: true,
          }),
        );
        const sample = () => {
          samples.push(window.scrollY);
          if (performance.now() - start < 2400) requestAnimationFrame(sample);
          else resolve(samples);
        };
        requestAnimationFrame(sample);
      }),
  );
  if (!wheelSamples.some((position) => position > 0 && position < 590))
    failures.push("Wheel scrolling did not interpolate through Lenis");
  if (Math.abs(wheelSamples.at(-1) - 600) > 2)
    failures.push("Smooth wheel scrolling did not settle at its destination");
  await page.evaluate(() =>
    document.dispatchEvent(new CustomEvent("portfolio:scroll", { detail: 0 })),
  );
  await page.waitForTimeout(900);
  await page.evaluate(() =>
    document.dispatchEvent(
      new CustomEvent("portfolio:scroll", { detail: 440 }),
    ),
  );
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(out, "desktop-first-scroll.png") });
  await page.evaluate(() =>
    document.dispatchEvent(
      new CustomEvent("portfolio:scroll", { detail: 680 }),
    ),
  );
  await page.waitForTimeout(1400);
  await page.screenshot({
    path: path.join(out, "desktop-hero-transformed.png"),
  });
  for (const variant of ["signal", "structure"]) {
    const bridge = page.locator(`.scene-bridge--${variant}`);
    await bridge.evaluate((element) =>
      document.dispatchEvent(
        new CustomEvent("portfolio:scroll", {
          detail: element.getBoundingClientRect().top + window.scrollY + 100,
        }),
      ),
    );
    await page.waitForTimeout(1300);
    await page.screenshot({
      path: path.join(out, `desktop-bridge-${variant}.png`),
    });
  }
  for (const [name, selector] of [
    ["intro", ".intro"],
    ["optics", "#work"],
    ["signal", "#signal"],
    ["structure", "#structure"],
    ["korridor", "#korridor"],
    ["profile", "#profile"],
    ["experience", ".profile-trajectory"],
    ["education", ".profile-foundations"],
    ["achievements", ".profile-recognition"],
    ["inside", "#inside"],
    ["contact", "#contact"],
  ]) {
    if (await page.locator(selector).count()) {
      await page.locator(selector).evaluate((element) =>
        document.dispatchEvent(
          new CustomEvent("portfolio:scroll", {
            detail: element.getBoundingClientRect().top + window.scrollY,
          }),
        ),
      );
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(out, `desktop-${name}.png`) });
      const field = page.locator(`${selector} .study-visual`);
      if (await field.count()) {
        await field.evaluate((element) =>
          document.dispatchEvent(
            new CustomEvent("portfolio:scroll", {
              detail:
                element.getBoundingClientRect().top + window.scrollY - 110,
            }),
          ),
        );
        await page.waitForTimeout(1200);
        await page.screenshot({
          path: path.join(out, `desktop-${name}-field.png`),
        });
      }
    }
  }
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(out, "desktop-menu.png") });
  const menuAxe = await new AxeBuilder({ page })
    .exclude(".cursor")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  menuAxe.violations.forEach((violation) =>
    failures.push(`Menu accessibility ${violation.id}`),
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("#portfolio-menu")).not.toBeVisible({
    timeout: 10000,
  });
  await page.locator("#work").evaluate((element) =>
    document.dispatchEvent(
      new CustomEvent("portfolio:scroll", {
        detail: element.getBoundingClientRect().top + window.scrollY,
      }),
    ),
  );
  await page.waitForTimeout(1400);
  await page
    .getByRole("button", { name: "Read about Campus Gatepass System" })
    .click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, "desktop-detail.png") });
  const detailAxe = await new AxeBuilder({ page })
    .exclude(".cursor")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  detailAxe.violations.forEach((violation) =>
    failures.push(`Project accessibility ${violation.id}`),
  );
  await page.getByRole("button", { name: "Next project" }).click();
  await expect(page.locator("#detail-title")).toHaveText(
    "Automated AI YouTube Pipeline",
  );
  await page.waitForTimeout(800);
  await page.keyboard.press("Escape");
  await expect(page.locator(".detail-dialog")).not.toBeVisible({
    timeout: 10000,
  });
  const axe = await new AxeBuilder({ page })
    .exclude(".cursor")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  for (const violation of axe.violations)
    failures.push(
      `Accessibility ${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
    );
  await page
    .locator(".gatepass-targets")
    .getByRole("button", { name: "Library", exact: true })
    .click();
  await expect(
    page.locator(".gatepass-direction .project-field-kicker").first(),
  ).toContainText("Library");
  await page
    .getByRole("button", {
      name: "Inspect stage 2: Script generation",
      exact: true,
    })
    .click();
  await expect(page.locator(".pipeline-verb")).toHaveText("Script");
  await page.locator(".pipeline-next").click();
  await expect(page.locator(".pipeline-verb")).toHaveText("Source");
  await page
    .locator(".ordering-selectors")
    .getByRole("button", { name: /Kitchen/ })
    .click();
  await expect(
    page.locator(".ordering-inspection .project-field-context"),
  ).toContainText("fulfillment");
  await page.locator("#order-separation").focus();
  await page.locator("#order-separation").press("End");
  await expect(page.locator("#order-separation")).toHaveValue("100");
  await page
    .locator(".hostel-processes")
    .getByRole("button", { name: /Resolve/ })
    .click();
  await expect(
    page.locator(".hostel-reading .project-field-context"),
  ).toContainText("Grievance");
  await expect(page.locator(".hero-caption")).toContainText("CGPA 9.95");
  await expect(
    page.getByRole("link", { name: "View my experience", exact: false }),
  ).toHaveAttribute("href", "#profile");
  await expect(page.locator(".profile-university")).toContainText(
    "Bhubaneswar, Odisha",
  );
  await expect(page.locator(".profile-leadership")).toContainText(
    "Ranked top of the batch in Class X (92.8%) and Class XII (90.2%).",
  );
  await page
    .locator(".profile-skill-group summary")
    .filter({ hasText: "AI & data" })
    .click();
  await expect(page.locator(".profile-skill-group[open]")).toContainText(
    "Gemini API",
  );
  await expect(
    page.getByRole("heading", {
      name: "Department of IT, Government of Sikkim",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Choreography/ }).click();
  if ((await page.locator("#build-panel-1").getAttribute("hidden")) !== null)
    failures.push("Build index did not expand");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.waitForTimeout(800);
  await page
    .locator("#portfolio-menu")
    .getByRole("link", { name: /Contact/ })
    .click();
  await expect(page.locator("#portfolio-menu")).not.toBeVisible({
    timeout: 10000,
  });
  if (
    await page
      .locator("#contact")
      .evaluate((element) => element !== document.activeElement)
  )
    failures.push("Menu destination did not receive keyboard focus");
  await expect(page.locator(".contact-primary")).toHaveAttribute(
    "href",
    "mailto:sujalagarwaljrt@gmail.com",
  );
  await expect(
    page.locator(".footer").getByRole("link", { name: /GitHub/ }),
  ).toHaveAttribute("href", "https://github.com/filedotclose");
  await expect(
    page.locator(".footer").getByRole("link", { name: /LinkedIn/ }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/filedotclose/");
  const webgl = await page.evaluate(
    () => document.documentElement.dataset.webgl || "fallback",
  );
  const desktopOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  if (desktopOverflow) failures.push("Desktop horizontal overflow");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto("http://localhost:3100", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(2200);
  await expect(mobile.locator("html")).toHaveClass(/(?:^|\s)lenis(?:\s|$)/);
  await mobile.screenshot({ path: path.join(out, "mobile-hero.png") });
  for (const [name, selector] of [
    ["optics", "#work"],
    ["signal", "#signal"],
    ["structure", "#structure"],
    ["korridor", "#korridor"],
    ["profile", "#profile"],
    ["experience", ".profile-trajectory"],
    ["education", ".profile-foundations"],
    ["achievements", ".profile-recognition"],
    ["contact", "#contact"],
  ]) {
    if (await mobile.locator(selector).count()) {
      await mobile
        .locator(selector)
        .evaluate((element) =>
          window.scrollTo(
            0,
            element.getBoundingClientRect().top + window.scrollY,
          ),
        );
      await mobile.waitForTimeout(1200);
      await mobile.screenshot({ path: path.join(out, `mobile-${name}.png`) });
      const field = mobile.locator(`${selector} .study-visual`);
      if (await field.count()) {
        await field.evaluate((element) =>
          window.scrollTo(
            0,
            element.getBoundingClientRect().top + window.scrollY - 80,
          ),
        );
        await mobile.waitForTimeout(900);
        await mobile.screenshot({
          path: path.join(out, `mobile-${name}-field.png`),
        });
      }
    }
  }
  if (
    await mobile.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
  )
    failures.push("Mobile horizontal overflow");
  const mobileAxe = await new AxeBuilder({ page: mobile })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  for (const violation of mobileAxe.violations)
    failures.push(
      `Mobile accessibility ${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
    );
  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const reduced = await reducedContext.newPage();
  await reduced.goto("http://localhost:3100", { waitUntil: "networkidle" });
  await reduced.waitForTimeout(500);
  await expect(reduced.locator("html")).not.toHaveClass(
    /(?:^|\s)lenis(?:\s|$)/,
  );
  await reduced.screenshot({ path: path.join(out, "reduced-motion.png") });
  const initialFocus = await reduced.evaluate(() => {
    document.body.focus();
    return document.activeElement?.tagName;
  });
  await reduced.keyboard.press("Tab");
  if (
    !(await reduced
      .getByText("Skip to the work", { exact: true })
      .evaluate((element) => element === document.activeElement))
  )
    failures.push(
      `Skip link is not first keyboard target (was ${initialFocus})`,
    );
  for (const [width, height] of [
    [320, 740],
    [768, 1024],
    [1920, 1080],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const responsive = await context.newPage();
    await responsive.goto("http://localhost:3100", {
      waitUntil: "networkidle",
    });
    if (
      await responsive.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    )
      failures.push(`Horizontal overflow at ${width}px`);
    await responsive.screenshot({
      path: path.join(out, `responsive-${width}.png`),
    });
    await context.close();
  }
  const staticContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const staticPage = await staticContext.newPage();
  await staticPage.goto("http://localhost:3100", { waitUntil: "networkidle" });
  await expect(staticPage.locator("#hero-title")).toBeVisible();
  await expect(staticPage.locator(".optical-fallback")).toBeVisible();
  await staticPage.screenshot({ path: path.join(out, "no-javascript.png") });
  await staticContext.close();
  const fallbackContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await fallbackContext.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (
        kind === "webgl" ||
        kind === "webgl2" ||
        kind === "experimental-webgl"
      )
        return null;
      return original.call(this, kind, ...args);
    };
  });
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.goto("http://localhost:3100", {
    waitUntil: "networkidle",
  });
  await expect(fallbackPage.locator(".optical-fallback")).toBeVisible();
  await fallbackPage.screenshot({ path: path.join(out, "no-webgl.png") });
  await fallbackContext.close();
  const missingResponse = await reduced.goto(
    "http://localhost:3100/does-not-exist",
    { waitUntil: "networkidle" },
  );
  if (missingResponse?.status() !== 404)
    failures.push("Missing route did not return 404");
  await expect(
    reduced.getByRole("heading", { name: "Out of view." }),
  ).toBeVisible();
  const image = await fetch("http://localhost:3100/opengraph-image");
  if (!image.ok || !image.headers.get("content-type")?.includes("image/png"))
    failures.push("Open Graph image failed");
  const robots = await fetch("http://localhost:3100/robots.txt");
  if (!robots.ok) failures.push("robots.txt failed");
  if (process.argv.includes("--references")) {
    const referencePage = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    for (const [name, url] of [
      ["not-found", "https://www.not-found.tv/"],
      ["leoparpeix", "https://www.leoparpeix.com/"],
      ["awwwards", "https://www.awwwards.com/websites/portfolio/"],
    ]) {
      try {
        await referencePage.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await referencePage.waitForTimeout(5000);
        await referencePage.screenshot({
          path: path.join(out, `reference-${name}.png`),
        });
      } catch (error) {
        console.log(`Reference ${name}: ${error.message}`);
      }
    }
  }
  await writeFile(
    path.join(out, "report.json"),
    JSON.stringify(
      {
        webgl,
        errors,
        failures,
        desktopAccessibility: axe.violations,
        mobileAccessibility: mobileAxe.violations,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({ webgl, errors, failures, screenshots: out }, null, 2),
  );
  if (failures.length || errors.length) process.exitCode = 1;
} finally {
  await browser?.close();
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const kill = spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
        stdio: "ignore",
      });
      kill.on("exit", resolve);
    });
  } else server.kill("SIGTERM");
  await writeFile(path.join(out, "server.log"), serverLog);
}
