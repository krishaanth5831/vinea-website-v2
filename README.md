# Vinea — marketing site v2

The marketing site for [Vinea](https://www.getvinea.nl): a modular robot that
harvests truss tomatoes in **existing** Dutch high-wire glasshouses, running on
the pipe rail already in every aisle.

One page, seven sections, built to be honest about a machine that does not exist
yet. Pre-prototype, simulation only, looking for 2027 pilot partners in Westland.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
```

Node 20+. Nothing else is needed to run it — the fonts, images and video are all
in the repo and nothing is fetched from a CDN at runtime.

---

## The one rule the site is built on

**Every number on the page is labelled either measured or target, and the two
never look alike.**

This is not a copy decision that components are trusted to remember. It is a
field on the data:

```ts
// src/lib/data.ts
type Provenance = "measured" | "target" | "grower";
```

`src/components/Figure.tsx` reads it and there is **no prop to override it**:

| | colour | motion | mono tag |
|---|---|---|---|
| `measured` | the signal terracotta, used for nothing else on the site | counts up on enter | "Measured in simulation" |
| `target` | plain ink | never animates | "Target — not achieved" |
| `grower` | plain ink | never animates | "From grower interviews" |

Motion is spent the same way the signal colour is. If a number on this page is
still, it is because it has not been earned. That rule is why
`prefers-reduced-motion` resolves every reveal to its end state rather than
disabling the content: switching motion off must not change what is claimed.

---

## Decisions, one line each

**Type — General Sans, with IBM Plex Mono for data only.** General Sans has
enough warmth in its lowercase to hold together at 144px without reading as a
system font, and it is one variable file — 23 KB subset to Latin-1 plus the
punctuation the site sets, with the full 200–700 weight axis intact. Mono is the
truth signal, so
it appears on measurement tags, units and labels and nowhere else — spending it
on a heading would spend the signal. Both self-hosted; Geist and Inter are
deliberately absent.

**Palette — bone ground, two full-bleed dark passages.** `#F7F4EF` base,
`#0F1512` for the hero and the build reel, warm near-black ink. One reserved
terracotta (`#A83A20`, `#E2724F` on dark) that only ever marks a measured
number.

**Motion — Lenis plus one IntersectionObserver.** Reveals are a `data-reveal`
attribute and a CSS transition, so the only properties that ever animate are
opacity, transform and clip-path. The pinned reel is a tall section with a
`position: sticky` child, so the browser owns the pin and it cannot desync from
Lenis; the scrub reads one rect per frame and writes one transform. Lenis itself
is imported on idle — the page scrolls fine without it, so it has no business in
the first chunk.

**Video — recorded, not stock.** See below.

**Images — graded, not just downloaded.** Seven Pexels photographs, each pulled
toward the palette by `tools/images.mjs` so the page reads as one system rather
than a mood board. Credits in [CREDITS.md](CREDITS.md).

---

## The video

All seven clips were rendered from Vinea's own simulation repo,
[krishaanth5831/vinea](https://github.com/krishaanth5831/vinea) (`dev`). The
recorder and the publisher live in that repo under `tools/`:

```bash
# in the simulation repo, with its venv active
./.venv/bin/python tools/record.py --list          # what each clip is
./.venv/bin/python tools/record.py --probe         # opening frame of each, to check framing
./.venv/bin/python tools/record.py --no-encode     # record the masters (~25 min)
./.venv/bin/python tools/publish.py --dest /path/to/this/repo/public/video
```

`record.py` drives the same public entry points the simulation's own viewers use
(`farm.run`, `farm.trussrun`, `farm.duo`, `week4_place.harvest_placed`) and
renders **one** clean 1920×1080 camera instead of the four-to-six instrument
panels those viewers composite. No captions, no HSV boxes, no debug overlays.

Three things about it are worth knowing:

- **Frames are emitted once per control cycle.** `reach.CTRL_DT` is 10 ms, so a
  recorded second is exactly 100 frames. Encoded at 60 fps every frame survives,
  evenly spaced — the only ratio available that drops nothing and duplicates
  nothing, since 60 frames cannot be taken evenly from a 100 Hz signal. Playback
  is therefore 0.6×, and each clip's `speed` sets the pace instead.
- **A take with no picks in it fails the build.** `record.py` refuses to ship a
  clip that recorded fewer picks than it wanted — the first `wrist-eye` take was
  3.5 seconds of an empty aisle because every ripe fruit in that random house
  landed on the row the aisle does not serve.
- **mp4 is listed before webm**, which is backwards on purpose. On this footage
  — a four-row house at true plant density — VP9 came out *larger* than x264 at
  matching quality on four of seven clips. The webm ships as a fallback rather
  than as the preferred source, and both are in the repo.

The masters are not committed; `public/video/` holds the ~74 MB of web-weight
deliverables, each with an mp4, a webm and a poster frame.

---

## Layout

```
src/
  app/
    layout.tsx            fonts, metadata, Lenis + Reveal mounts
    page.tsx              the seven sections, in order, plus JSON-LD
    globals.css           tokens, type scale, reveal primitives
    opengraph-image.tsx   the share card, drawn — it carries the caveats too
    icon.svg  robots.ts  sitemap.ts
    credits/page.tsx      photography credits, noindex
  components/
    Figure.tsx            the measured/target rule, enforced
    Clip.tsx              lazy, poster-first, play-on-enter video
    Photo.tsx  Reveal.tsx  SmoothScroll.tsx  Arrow.tsx  Nav.tsx  Footer.tsx
    sections/             Hero, Problem, WhoItsFor, Robot, BuildReel, Numbers, Pilot
  lib/
    data.ts               every number, with its provenance
    images.ts             generated by tools/images.mjs
    useReducedMotion.ts   the preference as a value, not an effect
  fonts/                  General Sans + IBM Plex Mono, self-hosted
tools/
  images.mjs              grade, optimise, emit the manifest
  shots.mjs               drive the built site in real headless Chrome and photograph it
  verify.mjs              assert the measured/target rule actually holds in a browser
```

`shots.mjs` and `verify.mjs` both exist because the reel, the reveals and the
count-up are driven by `requestAnimationFrame` and `IntersectionObserver`, and
neither runs in a backgrounded browser tab — so the only way to see whether the
centrepiece works is to open a window that is genuinely rendering and scroll it.

```bash
npm run build && npm run start &
node tools/verify.mjs           # the rule, checked with and without reduced motion
node tools/shots.mjs            # desktop + mobile walkthrough into /tmp/vinea-shots
```

`verify.mjs` checks the three things a reader is invited to trust and that no
static render can show: that every measured figure counts up and lands on
exactly the stated value (a count-up that stops at `1.098` instead of `1.100`
quietly publishes a wrong number), that no target is ever painted in the signal
colour or animated, and that under `prefers-reduced-motion` every figure still
shows its full value with every reveal resolved.

## Measured

Built and audited August 2026. Lighthouse, production build, `next start`:

| | performance | accessibility | best practices | SEO |
|---|---|---|---|---|
| mobile | 95–98 | 100 | 100 | 100 |
| desktop | 100 | 100 | 100 | 100 |

LCP 2.3–3.0 s mobile / 0.6 s desktop, CLS 0, TBT 20–30 ms. Four things got it
there, in the order they mattered:

- **Posters are `next/image`, not the `poster` attribute.** A `poster` is
  fetched the moment the element exists, wherever it is on the page — seven of
  them cost 1.4 MB of full-size JPEG before a visitor had scrolled past the
  hero.
- **Nothing above the fold reveals on scroll.** An entrance that starts at
  opacity 0 defers largest-contentful-paint by its own duration, and the hero
  headline was waiting for hydration to fade itself in.
- **Lenis is imported dynamically, on idle.** Bundled statically it is parsed
  before the first paint, and Lighthouse's 4x-CPU mobile profile charges
  several hundred milliseconds of render delay for a nicety the page works
  perfectly without.
- **The display face is subset**, 37 KB to 23 KB, keeping the full 200–700
  weight axis. Latin-1 plus the punctuation the site actually sets.

The hero clip is 1.3 MB and is not requested until 1.5 s after `load` — it is
mood behind a headline, the poster carries the meaning, and it is skipped
entirely under Save-Data or on a 3G-or-worse connection. Every other clip waits
until it is a viewport away.

---

## Deployment

Deployed-ready for Vercel, App Router, fully static. Nothing here deploys
itself.

- `metadataBase` and the sitemap point at `https://www.getvinea.nl` — change
  both in `src/app/layout.tsx` and `src/app/sitemap.ts` if that moves.
- No environment variables, no server routes, no database.

## Contact

Krishaanth Ramaraj · Westland, Netherlands · krishaanth@getvinea.nl
