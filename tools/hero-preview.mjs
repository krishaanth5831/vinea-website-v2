/**
 * Bundle the hero screenshots into one self-contained HTML page.
 *
 *   node tools/hero-preview.mjs [shotsDir] [outFile]
 *
 * Reads tools/hero-shots.mjs output ({A,B,C,D}/{desktop,mobile}.jpg), inlines
 * each as a data URI, and writes a single HTML file you can open directly —
 * no server, no Next build, no query parameters.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SHOTS = process.argv[2] ?? "/tmp/vinea-hero-shots";
const OUT = process.argv[3] ?? "hero-preview.html";

const CONCEPTS = {
  A: "Split editorial — type-led, no imagery, no scroll motion.",
  B: "Image-led overlay — full-bleed photo, stage badge, scroll parallax.",
  C: "Instrument-led — headline over a Built / In simulation / Deployed readout.",
  D: "Centred manifesto — display line centred, photograph band at the foot.",
};

const asDataUri = async (p) => {
  const buf = await fs.readFile(p);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
};

let cards = "";
for (const [key, description] of Object.entries(CONCEPTS)) {
  const desktop = await asDataUri(path.join(SHOTS, key, "desktop.jpg"));
  const mobile = await asDataUri(path.join(SHOTS, key, "mobile.jpg"));
  cards += `
  <section class="card">
    <header>
      <h2><span class="key">${key}</span> ${description}</h2>
      <p class="meta">desktop 1440×900 · mobile 390×844</p>
    </header>
    <div class="shots">
      <figure class="desktop">
        <img src="${desktop}" alt="Hero ${key} at desktop width" />
        <figcaption>Desktop</figcaption>
      </figure>
      <figure class="mobile">
        <img src="${mobile}" alt="Hero ${key} at mobile width" />
        <figcaption>Mobile</figcaption>
      </figure>
    </div>
  </section>`;
}

const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Vinea — hero options</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #0f1512;
    color: #ede8dd;
    font-family: "Helvetica Neue", Arial, sans-serif;
    padding: clamp(1.5rem, 4vw, 4rem);
  }
  h1 { font-weight: 300; letter-spacing: -0.02em; margin: 0 0 0.5rem; }
  .lead { color: #b3ada0; max-width: 60ch; margin: 0 0 2.5rem; line-height: 1.55; }
  code { font-family: ui-monospace, "SF Mono", monospace; background: #18211c; padding: 0.1em 0.4em; border-radius: 4px; }
  .card { border-top: 1px solid #26312a; padding: 2.5rem 0; }
  .card header h2 { font-weight: 400; font-size: 1.25rem; margin: 0; }
  .key {
    display: inline-block; font-family: ui-monospace, monospace;
    font-size: 0.8rem; background: #26312a; padding: 0.15em 0.55em;
    border-radius: 4px; margin-right: 0.5rem; vertical-align: 2px;
  }
  .meta { color: #8a8377; font-size: 0.8rem; margin: 0.4rem 0 1.25rem; }
  .shots { display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap; }
  figure { margin: 0; }
  figure.desktop { flex: 1 1 640px; min-width: 0; }
  figure.mobile { flex: 0 0 220px; }
  img { width: 100%; display: block; border: 1px solid #26312a; border-radius: 6px; }
  figcaption { color: #8a8377; font-size: 0.75rem; margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 0.08em; }
</style>
</head>
<body>
  <h1>Vinea — hero options</h1>
  <p class="lead">
    Four concepts, captured from a production build. The live site renders the
    <code>HERO_VARIANT</code> constant in <code>src/components/sections/Hero.tsx</code>
    (default <code>B</code>); a <code>?hero=A|B|C|D</code> query parameter previews the rest.
  </p>
  ${cards}
</body>
</html>`;

await fs.writeFile(OUT, html);
console.log(`wrote ${OUT} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
