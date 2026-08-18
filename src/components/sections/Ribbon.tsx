"use client";

import { useEffect, useRef } from "react";

import { onTick } from "@/lib/scrub";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Ribbon — a full-bleed infinite marquee of capability keywords, sitting
 * between sections as a rhythmic monochrome break. Reacts to scroll velocity:
 * fast scrolling skews and drags the strip slightly (springs back at rest) —
 * the strip feels physically attached to the page.
 *
 * v1 drove the skew with framer-motion (useVelocity + useSpring). v2 does it
 * with no new dependency: velocity is read off window.scrollY on the page's
 * single animation-frame ticker, and the exponential smoothing a spring
 * approximates is done by hand. Only a transform is ever written.
 *
 * ⚠️ "First pilots 2027" replaces v1's "First pilots 2026" — 2027 is this
 * site's own figure (see Pilot and the page metadata); v1's year was stale.
 */

const ITEMS = [
  "Truss tomatoes",
  "High-wire glasshouse",
  "Pipe-rail native",
  "In development",
  "First pilots 2027",
  "Measured with growers",
];

const DURATION = 45; // seconds for one full loop

/** One copy of the scrolling keyword list. Rendered twice for the seamless loop. */
function Track({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className="marquee-track flex shrink-0 items-center gap-12 pr-12"
      style={{ "--marquee-duration": `${DURATION}s` } as React.CSSProperties}
    >
      {ITEMS.map((item) => (
        <li key={item} className="flex shrink-0 items-center gap-12">
          <span className="t-mono text-ink-mute">{item}</span>
          <span className="h-1.5 w-1.5 rotate-45 bg-ink-mute/40" aria-hidden />
        </li>
      ))}
    </ul>
  );
}

export default function Ribbon() {
  const reduced = useReducedMotion();
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = strip.current;
    if (!el) return;

    let lastY = window.scrollY;
    let skew = 0;
    let x = 0;

    return onTick(() => {
      const y = window.scrollY;
      const velocity = y - lastY;
      lastY = y;

      // The same ranges as v1's useTransform: velocity ±1500 maps to ±5° of
      // skew and ±26px of drag. Flicking down tilts the strip one way and
      // drags it; scrolling up does the opposite.
      const clamped = Math.max(-1500, Math.min(1500, velocity));
      const targetSkew = (clamped / 1500) * -5;
      const targetX = (clamped / 1500) * -26;

      skew += (targetSkew - skew) * 0.1;
      x += (targetX - x) * 0.1;

      if (Math.abs(skew) < 0.01 && Math.abs(x) < 0.05) {
        el.style.transform = "none";
      } else {
        el.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(3)}deg)`;
      }
    });
  }, [reduced]);

  return (
    <div className="marquee overflow-hidden border-y border-bone-edge bg-bone py-5">
      <div ref={strip} className="will-change-transform">
        <div className="flex w-full">
          <Track />
          {!reduced && <Track ariaHidden />}
        </div>
      </div>
    </div>
  );
}
