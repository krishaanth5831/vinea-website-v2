/**
 * Screenshot each hero concept (A–D) at desktop and mobile widths.
 *
 *   node tools/hero-shots.mjs [url] [outdir]
 *
 * The hero switchboard in src/components/sections/Hero.tsx accepts a `?hero=`
 * query parameter, so all four concepts are photographed from a single build —
 * no rebuild per variant. Each shot waits a couple of seconds so the
 * useSyncExternalStore query read (and Hero B's parallax) have settled.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import puppeteer from "puppeteer-core";

const URL = process.argv[2] ?? "http://localhost:3000/";
const OUT = process.argv[3] ?? "/tmp/vinea-hero-shots";
const CHROME = "/opt/google/chrome/chrome";

const VARIANTS = ["A", "B", "C", "D"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, dsf: 1 },
  { name: "mobile", width: 390, height: 844, dsf: 2, mobile: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const vp of VIEWPORTS) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
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
  for (const variant of VARIANTS) {
    const dir = path.join(OUT, variant);
    await fs.mkdir(dir, { recursive: true });
    await page.goto(`${URL}?hero=${variant}`, {
      waitUntil: "networkidle2",
      timeout: 120000,
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(dir, `${vp.name}.jpg`), quality: 82 });
    console.log(`wrote ${variant}/${vp.name}.jpg`);
  }
  await browser.close();
}
console.log("done");
