"use client";

import { motion, useScroll, useTransform } from "motion/react";

import Arrow from "@/components/Arrow";
import Photo from "@/components/Photo";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CTA, CTA_HREF, EYEBROW, HEADLINE, HONESTY, LEAD } from "./copy";
import { EASE, FadeUp, Words } from "./primitives";

/**
 * Hero D — centred manifesto, animated as one rising statement. The display
 * line reveals word by word from the middle outward (in reading order), the
 * argument and honesty line follow, and the photograph band slides up into the
 * foot with a gentle scroll parallax. The stage stays centred and still, not
 * over a picture, so nothing reads as footage of a product.
 */
export default function HeroD() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const bandY = useTransform(scrollY, [0, 800], [0, 30]);

  return (
    <section id="top" className="on-dark bg-forest">
      <div className="flex min-h-svh flex-col">
        <div className="shell flex flex-1 flex-col items-center justify-center pt-28 pb-12 text-center sm:pt-32">
          <FadeUp>
            <p className="t-mono text-chalk-soft">{EYEBROW}</p>
          </FadeUp>

          <Words
            text={HEADLINE}
            className="t-display mt-8 max-w-[18ch] text-chalk"
            delay={0.1}
            stagger={0.09}
          />

          <FadeUp delay={0.55} className="mt-8 max-w-[46ch]">
            <p className="t-lead text-chalk-soft">{LEAD}</p>
          </FadeUp>
          <FadeUp delay={0.65} className="mt-4 max-w-[46ch]">
            <p className="t-small text-chalk-mute">{HONESTY}</p>
          </FadeUp>
          <FadeUp delay={0.75} className="mt-10">
            <a
              href={CTA_HREF}
              className="press group inline-flex items-center gap-4 border border-chalk-mute px-7 py-5 text-chalk hover:border-chalk hover:bg-chalk hover:text-forest"
            >
              <span className="t-mono">{CTA}</span>
              <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
            </a>
          </FadeUp>
        </div>

        <motion.figure
          initial={reduced ? false : { y: 40, opacity: 0 }}
          animate={reduced ? undefined : { y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
          className="relative h-[26vh] min-h-40 w-full overflow-hidden"
        >
          <motion.div
            style={reduced ? { top: "-15%", height: "130%" } : { y: bandY, top: "-15%", height: "130%" }}
            className="absolute left-0 right-0 will-change-transform"
          >
            <Photo
              name="hero"
              sizes="100vw"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-forest/20" />
          <figcaption className="t-mono-sm absolute bottom-4 left-1/2 -translate-x-1/2 text-chalk-soft">
            A real glasshouse — not a render.
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
