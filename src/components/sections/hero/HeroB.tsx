"use client";

import { motion, useScroll, useTransform } from "motion/react";

import Arrow from "@/components/Arrow";
import Photo from "@/components/Photo";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CTA, CTA_HREF, EYEBROW, HEADLINE, HONESTY, LEAD } from "./copy";
import { EASE, FadeUp, Words } from "./primitives";

/**
 * Hero B — image-led, and the one that keeps moving. The photograph settles
 * from a slight overscan while a slow Ken Burns drift keeps the frame alive,
 * and it parallaxes against the scroll as the reader leaves. The badge up top
 * states the stage so the moving picture cannot read as footage of a fielded
 * machine.
 */
export default function HeroB() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 800], [0, 64]);
  const contentOpacity = useTransform(scrollY, [0, 520], [1, 0]);

  return (
    <section id="top" className="on-dark relative bg-forest">
      <div className="relative flex min-h-svh flex-col overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            style={reduced ? undefined : { y: photoY }}
            className="absolute inset-0 will-change-transform"
          >
            <motion.div
              initial={reduced ? false : { scale: 1.12 }}
              animate={reduced ? undefined : { scale: 1 }}
              transition={{ duration: 1.7, ease: EASE }}
              className="absolute"
              style={{ top: "-10%", height: "120%", left: "-4%", width: "108%" }}
            >
              <motion.div
                animate={reduced ? undefined : { scale: [1, 1.06, 1] }}
                transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-full"
              >
                <Photo
                  name="hero"
                  priority
                  sizes="116vw"
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="absolute inset-0 bg-forest/55" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgb(15 21 18 / 0.95) 0%, rgb(15 21 18 / 0.5) 45%, rgb(15 21 18 / 0.25) 100%)",
            }}
          />
        </div>

        <motion.div
          style={reduced ? undefined : { opacity: contentOpacity }}
          className="shell relative flex flex-1 flex-col justify-end pt-28 pb-12 sm:pb-14"
        >
          <FadeUp className="mb-8" delay={0.15}>
            <p className="t-mono text-chalk-soft">{EYEBROW}</p>
            <p className="t-mono-sm mt-3 inline-flex items-center gap-2 rounded-full border border-forest-edge bg-forest/60 px-3.5 py-1.5 text-chalk-mute">
              <span className="h-1.5 w-1.5 rotate-45 bg-chalk-soft" aria-hidden />
              Pre-prototype · no hardware · simulation only
            </p>
          </FadeUp>

          <Words
            text={HEADLINE}
            className="t-display max-w-[16ch] text-chalk"
            delay={0.25}
            stagger={0.09}
          />

          <FadeUp className="mt-8 max-w-[54ch]" delay={0.6}>
            <p className="t-lead text-chalk">{LEAD}</p>
            <p className="t-small mt-4 text-chalk-mute">{HONESTY}</p>
          </FadeUp>

          <FadeUp className="mt-10" delay={0.75}>
            <a
              href={CTA_HREF}
              className="press group inline-flex w-fit items-center gap-4 border border-chalk-mute px-7 py-5 text-chalk hover:border-chalk hover:bg-chalk hover:text-forest"
            >
              <span className="t-mono">{CTA}</span>
              <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
            </a>
          </FadeUp>
        </motion.div>
      </div>
    </section>
  );
}
