"use client";

import { motion } from "motion/react";

import Arrow from "@/components/Arrow";
import Photo from "@/components/Photo";
import { CTA, CTA_HREF, EYEBROW, HEADLINE, HONESTY, LEAD } from "./copy";
import { EASE, FadeUp, Words } from "./primitives";

/**
 * Hero C — instrument-led, animated like a readout coming up. The headline is
 * revealed word by word, then the three status lines (Built / In simulation /
 * Deployed) rise in one at a time, then the honesty line and the pipe-rail
 * photograph land. The motion suggests a panel booting, not a live feed —
 * nothing here is telemetry, so nothing blinks or counts.
 */

const ROWS = [
  { label: "Built", value: "Nothing yet. There is no hardware." },
  {
    label: "In simulation",
    value: "Survey, plan, pick, carry, crate — recorded in MuJoCo.",
  },
  { label: "Deployed", value: "None. No robot has run in a greenhouse." },
];

export default function HeroC() {
  return (
    <section id="top" className="on-dark bg-forest">
      <div className="shell flex min-h-svh flex-col justify-center pt-28 pb-10 sm:pt-32">
        <FadeUp>
          <p className="t-mono text-chalk-soft">{EYEBROW}</p>
        </FadeUp>

        <div className="mt-8 grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Words
              text={HEADLINE}
              className="t-h1 text-chalk"
              delay={0.08}
              stagger={0.08}
            />
            <FadeUp delay={0.5} className="mt-6 max-w-[46ch]">
              <p className="t-lead text-chalk-soft">{LEAD}</p>
            </FadeUp>
            <FadeUp delay={0.62} className="mt-10">
              <a
                href={CTA_HREF}
                className="press group inline-flex w-fit items-center gap-4 border border-chalk-mute px-7 py-5 text-chalk hover:border-chalk hover:bg-chalk hover:text-forest"
              >
                <span className="t-mono">{CTA}</span>
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
              </a>
            </FadeUp>
          </div>

          <div className="lg:col-span-5">
            <motion.dl
              initial="hidden"
              animate="shown"
              variants={{
                shown: {
                  transition: { staggerChildren: 0.12, delayChildren: 0.4 },
                },
              }}
              className="border-t border-forest-edge"
            >
              {ROWS.map((row) => (
                <motion.div
                  key={row.label}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    shown: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: EASE },
                    },
                  }}
                  className="border-b border-forest-edge py-6"
                >
                  <dt className="t-mono flex items-center gap-2 text-chalk-mute">
                    <span
                      className="h-1.5 w-1.5 rotate-45 bg-chalk-soft"
                      aria-hidden
                    />
                    {row.label}
                  </dt>
                  <dd className="t-h3 mt-3 text-chalk">{row.value}</dd>
                </motion.div>
              ))}
            </motion.dl>
            <FadeUp delay={0.8} className="mt-6">
              <p className="t-small text-chalk-mute">{HONESTY}</p>
            </FadeUp>
          </div>
        </div>

        <motion.figure
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.85, ease: EASE }}
          className="relative mt-14 hidden h-28 w-full overflow-hidden lg:block"
        >
          <Photo
            name="pipeRail"
            sizes="94vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-forest/30" />
        </motion.figure>
      </div>
    </section>
  );
}
