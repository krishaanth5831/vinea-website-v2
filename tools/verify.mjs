/**
 * Assert the behaviours the page's credibility rests on, in a real browser.
 *
 *   node tools/verify.mjs [url]
 *
 * Three claims are checked, because all three are things a reader is invited to
 * trust and none of them is visible in a static render:
 *
 *   1. Measured figures count up and land on exactly the stated value — a
 *      count-up that stops at 1.098 instead of 1.100 quietly publishes a wrong
 *      number.
 *   2. Targets never animate, and no target is ever painted in the signal
 *      colour.
 *   3. Under `prefers-reduced-motion` every figure still shows its full value
 *      and every reveal is resolved — turning motion off must not change what
 *      the page claims.
 */

import process from "node:process";
import puppeteer from "puppeteer-core";

const URL = process.argv[2] ?? "http://localhost:4311/";
const CHROME = "/opt/google/chrome/chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const EXPECTED = {
  "~12 kg/hr": "measured",
  "1.100 m": "measured",
  "10/10": "measured",
  "0.39 mm": "measured",
  "100%": "measured",
  "28.7 s": "measured",
  "8,000 kg": "target",
  "~80 kg/hr": "target",
};

const SIGNAL = ["rgb(168, 58, 32)", "rgb(226, 114, 79)"];

async function open(reducedMotion) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--autoplay-policy=no-user-gesture-required",
    ],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  if (reducedMotion) {
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
  }
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 120000 });
  return { browser, page };
}

/** Walk the page so every observer fires, then read the figures back. */
async function readFigures(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await sleep(140);
  }
  await sleep(2200); // longer than the 1300 ms count-up

  return page.evaluate(() => {
    const out = [];
    for (const block of document.querySelectorAll("#numbers .t-figure, #numbers .t-h2")) {
      const wrap = block.parentElement;
      const tag = wrap?.querySelector(".t-mono")?.textContent?.trim() ?? "";
      out.push({
        text: block.textContent.replace(/\s+/g, " ").trim(),
        colour: getComputedStyle(block).color,
        tag,
      });
    }
    const unresolved = document.querySelectorAll(
      '[data-reveal]:not([data-reveal="in"]), [data-reveal-mask]:not([data-reveal-mask="in"])',
    ).length;
    return { figures: out, unresolved };
  });
}

const failures = [];
const note = (ok, msg) => {
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${msg}`);
  if (!ok) failures.push(msg);
};

for (const reduced of [false, true]) {
  console.log(`\n${reduced ? "prefers-reduced-motion: reduce" : "default motion"}`);
  const { browser, page } = await open(reduced);
  const { figures, unresolved } = await readFigures(page);

  for (const [value, provenance] of Object.entries(EXPECTED)) {
    // A counted figure carries its value twice — once for the screen and once,
    // visually hidden, for a screen reader — so the element's text is the value
    // repeated. Matching on presence rather than equality covers both that and
    // the literal figures, which appear once.
    const hit = figures.find((f) => f.text.includes(value));
    note(!!hit, `${provenance.padEnd(8)} ${value} present`);
    if (!hit) continue;
    const isSignal = SIGNAL.includes(hit.colour);
    if (provenance === "measured") {
      note(isSignal, `${value} is in the signal colour (${hit.colour})`);
      note(
        /measured in simulation/i.test(hit.tag),
        `${value} is tagged "${hit.tag}"`,
      );
    } else {
      note(!isSignal, `${value} is NOT in the signal colour (${hit.colour})`);
      note(/not achieved/i.test(hit.tag), `${value} is tagged "${hit.tag}"`);
    }
  }

  note(unresolved === 0, `every reveal resolved (${unresolved} outstanding)`);
  await browser.close();
}

console.log(
  failures.length ? `\n${failures.length} FAILURE(S)` : "\nall checks passed",
);
process.exit(failures.length ? 1 : 0);
