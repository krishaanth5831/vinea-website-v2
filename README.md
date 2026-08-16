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
system font, and it is one variable file at 38 KB. Mono is the truth signal, so
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
Lenis; the scrub reads one rect per frame and writes one transform.

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

The masters are not committed; `public/video/` holds the ~80 MB of web-weight
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
    Photo.tsx  Reveal.tsx  SmoothScroll.tsx  Nav.tsx  Footer.tsx
    sections/             Hero, Problem, WhoItsFor, Robot, BuildReel, Numbers, Pilot
  lib/
    data.ts               every number, with its provenance
    images.ts             generated by tools/images.mjs
  fonts/                  General Sans + IBM Plex Mono, self-hosted
tools/
  images.mjs              grade, optimise, emit the manifest
  shots.mjs               drive the built site in real headless Chrome and photograph it
```

`tools/shots.mjs` exists because the reel, the reveals and the count-up are all
driven by `requestAnimationFrame` and `IntersectionObserver`, and neither runs in
a backgrounded browser tab — so the only way to see whether the centrepiece
works is to open a window that is genuinely rendering and scroll it.

---

## Deployment

Deployed-ready for Vercel, App Router, fully static. Nothing here deploys
itself.

- `metadataBase` and the sitemap point at `https://www.getvinea.nl` — change
  both in `src/app/layout.tsx` and `src/app/sitemap.ts` if that moves.
- No environment variables, no server routes, no database.

## Contact

Krishaanth Ramaraj · Westland, Netherlands · krishaanth@getvinea.nl
