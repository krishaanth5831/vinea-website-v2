"use client";

import Arrow from "@/components/Arrow";
import { CTA, CTA_HREF, EYEBROW, HEADLINE, HONESTY, LEAD } from "./copy";
import { FadeUp, Words } from "./primitives";

/**
 * Hero A — split editorial, animated as a choreographed entrance. The headline
 * is revealed word by word from a mask; the argument, honesty line and ask
 * rise in behind it; the mono meta row lands last. Type stays the hero — the
 * motion only sequences what is already there, in reading order.
 */
export default function HeroA() {
  return (
    <section id="top" className="on-dark bg-forest">
      <div className="shell flex min-h-svh flex-col justify-center pt-28 pb-12 sm:pt-32">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <Words
            text={HEADLINE}
            className="t-h1 text-chalk lg:col-span-7"
            delay={0.05}
            stagger={0.08}
          />

          <div className="flex flex-col justify-end gap-8 lg:col-span-5 lg:pb-2">
            <FadeUp delay={0.5}>
              <p className="t-lead text-chalk-soft">{LEAD}</p>
            </FadeUp>
            <FadeUp delay={0.62}>
              <p className="t-small text-chalk-mute">{HONESTY}</p>
            </FadeUp>
            <FadeUp delay={0.74}>
              <a
                href={CTA_HREF}
                className="press group inline-flex w-fit items-center gap-4 border border-chalk-mute px-7 py-5 text-chalk hover:border-chalk hover:bg-chalk hover:text-forest"
              >
                <span className="t-mono">{CTA}</span>
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
              </a>
            </FadeUp>
          </div>
        </div>

        <FadeUp delay={0.9} className="mt-16 sm:mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-forest-edge pt-6">
            <p className="t-mono text-chalk-soft">{EYEBROW}</p>
            <p className="t-mono-sm text-chalk-mute">
              Pre-prototype · Simulation only · Seeking 2027 pilots
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
