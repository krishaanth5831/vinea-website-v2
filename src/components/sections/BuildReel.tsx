"use client";

import { useEffect, useRef, useState } from "react";

import Clip from "@/components/Clip";
import { REEL } from "@/lib/data";
import { useScrub } from "@/lib/scrub";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Section 5 — the build reel. Dark, pinned, scrubbed horizontally.
 *
 * How the pin works
 * -----------------
 * The section is given a height of `(stages + 1) x 100vh` and its only child is
 * a `position: sticky` viewport-height frame. Scrolling that tall section moves
 * the track inside the frame instead of moving the frame, which is the whole
 * illusion. Doing it with `sticky` rather than by measuring and toggling
 * `position: fixed` matters: the browser owns the pin, so it cannot desync from
 * Lenis, and there is no scroll handler that can drop a frame and let the
 * section visibly jump.
 *
 * The scrub is scroll-linked, which is what makes it interruptible in the sense
 * Apple means: the transform is a pure function of scroll offset, so flicking
 * back up runs it backwards from exactly where it is. Nothing is "playing", so
 * there is nothing to cancel. It shares one animation-frame loop with the hero
 * — see `lib/scrub.ts` for why that is one loop and not two.
 *
 * Below the `lg` breakpoint the whole mechanism is switched off and the stages
 * stack vertically. A pinned horizontal scroll on a phone fights the browser's
 * own address-bar collapse and its overscroll, and the result is a section that
 * feels broken on exactly the device a grower will open the link on.
 */
export default function BuildReel() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const sync = () => setPinned(wide.matches && !reduced);
    sync();
    wide.addEventListener("change", sync);
    return () => wide.removeEventListener("change", sync);
  }, [reduced]);

  useScrub(
    section,
    (t) => {
      const rail = track.current;
      if (!rail) return;
      const distance = rail.scrollWidth - window.innerWidth;
      rail.style.transform = `translate3d(${-t * distance}px, 0, 0)`;
      setActive(Math.min(REEL.length - 1, Math.floor(t * REEL.length + 0.15)));
    },
    pinned,
  );

  return (
    <section
      ref={section}
      id="reel"
      className="on-dark relative bg-forest"
      style={pinned ? { height: `${(REEL.length + 1) * 100}vh` } : undefined}
      aria-label="The build reel: five stages of the simulation"
    >
      <div
        className={
          pinned
            ? "sticky top-0 flex h-svh flex-col overflow-hidden"
            : "flex flex-col py-(--spacing-section)"
        }
      >
        {/* --- heading, held above the track while it scrubs ------------ */}
        <div className="shell shrink-0 pt-20 sm:pt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-6 border-b border-forest-edge pb-8">
            <div>
              <p className="t-mono text-chalk-mute">What is actually built</p>
              <h2 className="t-h2 mt-4 max-w-[20ch] text-chalk">
                Five things it does, in simulation, today.
              </h2>
            </div>

            {pinned && (
              <ol className="flex items-center gap-2" aria-hidden>
                {REEL.map((stage, i) => (
                  <li
                    key={stage.id}
                    className={`h-px w-10 transition-colors duration-500 ${
                      i <= active ? "bg-signal-dark" : "bg-forest-edge"
                    }`}
                  />
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* --- the track ------------------------------------------------ */}
        <div className="flex min-h-0 flex-1 items-center">
          <div
            ref={track}
            className={
              pinned
                ? "flex h-full items-center gap-8 pl-(--spacing-gutter) pr-[12vw] will-change-transform"
                : "flex flex-col gap-20 px-(--spacing-gutter) pt-16"
            }
          >
            {REEL.map((stage, i) => (
              <article
                key={stage.id}
                className={
                  pinned
                    ? "flex h-[74%] w-[62vw] shrink-0 flex-col"
                    : "flex w-full flex-col"
                }
              >
                {/* ⚠️ The dim is on the media only, never on the caption.
                    Dimming the whole card was the obvious way to pull focus to
                    the one at centre, and it dragged the caption's effective
                    contrast down with it — 2.1:1 on the stage number, 2.6:1 on
                    the line, because compositing an opacity is compositing the
                    text too. The picture carries the focus; the words stay
                    readable the whole way across. */}
                <div
                  className={`relative min-h-0 flex-1 overflow-hidden bg-forest-lift ${
                    pinned
                      ? `transition-opacity duration-500 ${
                          i === active ? "opacity-100" : "opacity-40"
                        }`
                      : ""
                  }`}
                >
                  <div className={pinned ? "h-full" : "aspect-16/9"}>
                    <Clip
                      name={stage.clip}
                      label={stage.alt}
                      sizes="(max-width: 1024px) 92vw, 62vw"
                    />
                  </div>
                </div>

                <div className="mt-6 flex shrink-0 items-baseline gap-6">
                  <span className="t-mono shrink-0 text-signal-dark">
                    {stage.index}
                  </span>
                  <div className="min-w-0">
                    <h3 className="t-h3 text-chalk">{stage.heading}</h3>
                    <p className="t-small mt-2 max-w-[62ch] text-chalk-soft">
                      {stage.line}
                    </p>
                  </div>
                </div>
                <span className="sr-only">
                  Stage {i + 1} of {REEL.length}.
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="shell shrink-0 pb-8 pt-6">
          <p className="t-mono-sm text-chalk-mute">
            All five recorded in MuJoCo, August 2026 · no hardware exists
          </p>
        </div>
      </div>
    </section>
  );
}
