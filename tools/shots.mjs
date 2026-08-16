/**
 * Drive the built site in a real headless Chrome and photograph it.
 *
 *   node tools/shots.mjs [url] [outdir]
 *
 * This exists because the pinned reel, the scroll reveals and the count-up are
 * all driven by `requestAnimationFrame` and `IntersectionObserver`, and neither
 * runs in a backgrounded browser tab — so the only way to see whether the
 * centrepiece of the page actually works is to open a window that is genuinely
 * rendering and scroll it.
 *
 * It scrolls in real steps with a settle between each, so what it captures is
 * what a visitor sees rather than a jumped-to scroll offset with every
 * animation still at its start value.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import puppeteer from "puppeteer-core";

const URL = process.argv[2] ?? "http://localhost:4311/";
const OUT = process.argv[3] ?? "/tmp/vinea-shots";
const CHROME = "/opt/google/chrome/chrome";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, dsf: 1 },
  { name: "mobile", width: 390, height: 844, dsf: 2, mobile: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(page, dir, label) {
  await page.screenshot({ path: path.join(dir, `${label}.jpg`), quality: 80 });
}

async function run(vp) {
  const dir = path.join(OUT, vp.name);
  await fs.mkdir(dir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "shell" === "never" ? false : true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      // Headless Chrome idles its rendering loop unless told otherwise, which
      // would put us back where we started.
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--autoplay-policy=no-user-gesture-required",
      `--window-size=${vp.width},${vp.height}`,
    ],
    defaultViewport: {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dsf,
      isMobile: !!vp.mobile,
      hasTouch: !!vp.mobile,
    },
  });

  const page = await browser.newPage();
  const problems = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) =>
    problems.push(`failed: ${r.url().slice(-60)} ${r.failure()?.errorText}`),
  );

  await page.goto(URL, { waitUntil: "networkidle2", timeout: 120000 });
  await sleep(2000);
  await shoot(page, dir, "00-hero");

  const height = await page.evaluate(() => document.body.scrollHeight);
  const step = Math.round(vp.height * 0.85);
  let i = 1;
  for (let y = step; y < height; y += step) {
    await page.evaluate((to) => window.scrollTo({ top: to, behavior: "auto" }), y);
    // Long enough for a reveal (0.9-1.1s) and for the reel's rAF to settle.
    await sleep(950);
    await shoot(page, dir, String(i).padStart(2, "0") + "-scroll");
    i += 1;
    if (i > 40) break;
  }

  // What the reel actually did, read back rather than assumed.
  const reel = await page.evaluate(() => {
    const sec = document.querySelector("#reel");
    if (!sec) return null;
    const track = sec.querySelector('[class*="will-change-transform"]');
    return {
      sectionHeight: Math.round(sec.getBoundingClientRect().height),
      trackTransform: track ? getComputedStyle(track).transform : "no track",
      pinnedChild: !!sec.querySelector(".sticky"),
    };
  });

  await browser.close();
  return { viewport: vp.name, dir, problems: [...new Set(problems)], reel };
}

const results = [];
for (const vp of VIEWPORTS) results.push(await run(vp));
console.log(JSON.stringify(results, null, 1));
