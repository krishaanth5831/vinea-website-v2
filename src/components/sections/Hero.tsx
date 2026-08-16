"use client";

import { useRef } from "react";

import Arrow from "@/components/Arrow";
import Nav from "@/components/Nav";
import Photo from "@/components/Photo";
import { useScrub } from "@/lib/scrub";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Section 1 — a pinned, scroll-scrubbed hero.
 *
 * The mechanic is Farmless's, measured off their page rather than eyeballed:
 * the display line translates horizontally at roughly **1.2 px per px** of
 * scroll while the photograph behind it counter-drifts the other way at about
 * **0.088 px per px** — a ratio near 14:1. That gap is the whole effect. The
 * type reads as flying past a world that is almost, but not quite, still.
 *
 * Two things are added to it. The photograph also scales gently (1 → 1.12),
 * which is the other thing Farmless does with scroll — their globe section
 * scales a 125vw element up through a sticky viewport — and the image is
 * overscanned to 112% so both the drift and the scale have somewhere to go
 * without ever exposing an edge.
 *
 * Why this is a scrub and not an animation, in Apple's terms: the transform is
 * a pure function of scroll position, so it is interruptible and reversible by
 * construction. Drag the scrollbar backwards and it runs backwards exactly,
 * from wherever it is. There is no playing animation to cancel, no target to
 * re-aim, and no state that can desync from the page.
 *
 * Nothing here fades in. Content the reader has already arrived at has nothing
 * to announce, and an entrance that starts at opacity 0 defers
 * largest-contentful-paint by its own duration.
 */

/** The line that flies past. One sentence, one line, no wrapping. */
const LINE = "It picks the truss, in the glasshouse you already have.";

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLHeadingElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useScrub(
    section,
    (t) => {
      const el = line.current;
      const bg = plate.current;
      if (!el || !bg) return;

      // How far the line has to travel for its tail to reach the left gutter.
      // Measured off the element, so it is right at every viewport and every
      // font size without a breakpoint table.
      const overhang = Math.max(0, el.scrollWidth - window.innerWidth);
      const travel = overhang + window.innerWidth * 0.3;

      el.style.transform = `translate3d(${-t * travel}px,0,0)`;
      // The counter-drift, at Farmless's ratio: the photograph moves the other
      // way, about a fourteenth as far.
      bg.style.transform =
        `translate3d(${t * travel * 0.072}px,0,0) scale(${1 + t * 0.12})`;
      if (veil.current) {
        // The ground darkens as the line clears, so the copy underneath holds
        // its contrast the whole way through rather than only at the start.
        veil.current.style.opacity = String(0.32 + t * 0.28);
      }
      if (cue.current) {
        // The cue has done its job the moment the reader scrolls at all.
        cue.current.style.opacity = String(Math.max(0, 1 - t * 8));
      }
    },
    !reduced,
  );

  return (
    <section
      ref={section}
      id="top"
      className="on-dark relative bg-forest"
      // The pin: a tall section whose only child is sticky. Two and a bit
      // viewports is enough for the line to clear without the hero outstaying
      // its welcome — the reader is never more than a flick from section two.
      style={reduced ? undefined : { height: "260vh" }}
    >
      <div
        className={
          reduced
            ? "relative flex min-h-svh flex-col justify-end overflow-hidden"
            : "sticky top-0 flex h-svh flex-col justify-end overflow-hidden"
        }
      >
        <div className="absolute inset-0 -z-10">
          <div
            ref={plate}
            className="absolute inset-y-0 will-change-transform"
            // Overscan. The drift and the scale both need somewhere to go, and
            // an edge appearing at the end of the scrub is the one thing that
            // would give the trick away.
            style={{ left: "-6%", width: "112%" }}
          >
            <Photo
              name="hero"
              priority
              sizes="112vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div
            ref={veil}
            aria-hidden
            className="absolute inset-0 bg-forest"
            style={{ opacity: 0.32 }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgb(15 21 18 / 0.94) 0%, rgb(15 21 18 / 0.55) 40%, rgb(15 21 18 / 0) 74%)",
            }}
          />
        </div>

        <Nav />

        {/* --- the line that scrubs --------------------------------------- */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[26%] overflow-hidden sm:top-[23%]"
          aria-hidden
        >
          <h1 className="sr-only">{LINE}</h1>
          <div
            ref={line}
            className="t-display whitespace-nowrap pl-(--spacing-gutter) text-chalk will-change-transform"
          >
            {LINE}
          </div>
        </div>

        {/* --- the block that stays put ----------------------------------- */}
        <div className="shell relative pb-10 sm:pb-14">
          <div className="flex flex-col gap-8 border-t border-forest-edge pt-7 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="max-w-[54ch]">
              <p className="t-mono mb-5 text-chalk-soft">
                Vinea · Westland, Netherlands
              </p>
              <p className="t-lead text-chalk">
                A modular robot that harvests truss tomatoes from the pipe rail
                already running down every aisle of every Dutch high-wire house.
                No rebuild, no new track, no mapping guesswork.
              </p>
              {/* Said once, here, and then not again. The old site hedged about
                  a dozen times and the cumulative effect was an apology. */}
              <p className="t-small mt-4 text-chalk-mute">
                Vinea is pre-prototype. There is no hardware — everything on
                this page runs in a MuJoCo simulation and no robot has run in a
                greenhouse. We want two or three growers to change that in 2027.
              </p>
            </div>

            <div className="shrink-0">
              <a
                href="#pilot"
                className="press group inline-flex items-center gap-4 border border-chalk-mute px-7 py-5 text-chalk hover:border-chalk hover:bg-chalk hover:text-forest"
              >
                <span className="t-mono">Take a free 2027 pilot</span>
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
              </a>
              <div className="mt-4 flex items-center gap-3 lg:justify-end">
                {/* A pinned hero can read as a stuck page. One hairline with a
                    highlight travelling down it says the section responds to
                    scrolling, and it fades out as soon as it has been obeyed. */}
                <span
                  ref={cue}
                  aria-hidden
                  className="cue relative h-8 w-px shrink-0 overflow-hidden bg-forest-edge transition-opacity duration-500"
                />
                <p className="t-mono-sm text-chalk-mute">
                  Recorded in simulation · Aug 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
