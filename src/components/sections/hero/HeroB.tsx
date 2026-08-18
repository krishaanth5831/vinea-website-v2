"use client";

import { useEffect, useRef } from "react";

import Arrow from "@/components/Arrow";
import Photo from "@/components/Photo";
import { onTick } from "@/lib/scrub";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CTA, CTA_HREF, EYEBROW, HEADLINE, HONESTY, LEAD } from "./copy";

/**
 * Hero B — image-led. A full-bleed photograph of the glasshouse with the
 * argument overlaid on a dark veil, and the stage stated in a badge up top so
 * the picture cannot be mistaken for footage of a fielded machine. The
 * photograph counter-drifts a little as the reader scrolls away, so the hero
 * hands off to the ribbon rather than scrolling flat.
 */
export default function HeroB() {
  const reduced = useReducedMotion();
  const plate = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    return onTick(() => {
      const y = window.scrollY;
      if (plate.current) {
        plate.current.style.transform = `translate3d(0, ${(y * 0.08).toFixed(2)}px, 0)`;
      }
      if (content.current) {
        content.current.style.opacity = String(Math.max(0, 1 - y / 520));
      }
    });
  }, [reduced]);

  return (
    <section id="top" className="on-dark relative bg-forest">
      <div className="relative flex min-h-svh flex-col overflow-hidden">
        <div className="absolute inset-0">
          <div
            ref={plate}
            className="absolute inset-y-0 will-change-transform"
            style={{ left: "-4%", width: "108%" }}
          >
            <Photo
              name="hero"
              priority
              sizes="108vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-forest/55" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgb(15 21 18 / 0.95) 0%, rgb(15 21 18 / 0.5) 45%, rgb(15 21 18 / 0.25) 100%)",
            }}
          />
        </div>

        <div
          ref={content}
          className="shell relative flex flex-1 flex-col justify-end pt-28 pb-12 sm:pb-14"
        >
          <div className="mb-8">
            <p className="t-mono text-chalk-soft">{EYEBROW}</p>
            <p className="t-mono-sm mt-3 inline-flex items-center gap-2 rounded-full border border-forest-edge bg-forest/60 px-3.5 py-1.5 text-chalk-mute">
              <span className="h-1.5 w-1.5 rotate-45 bg-chalk-soft" aria-hidden />
              Pre-prototype · no hardware · simulation only
            </p>
          </div>

          <h1 className="t-display max-w-[16ch] text-chalk">{HEADLINE}</h1>

          <div className="mt-8 max-w-[54ch]">
            <p className="t-lead text-chalk">{LEAD}</p>
            <p className="t-small mt-4 text-chalk-mute">{HONESTY}</p>
          </div>

          <a
            href={CTA_HREF}
            className="press group mt-10 inline-flex w-fit items-center gap-4 border border-chalk-mute px-7 py-5 text-chalk hover:border-chalk hover:bg-chalk hover:text-forest"
          >
            <span className="t-mono">{CTA}</span>
            <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
