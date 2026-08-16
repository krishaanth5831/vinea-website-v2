"use client";

import { useEffect, useRef, useState } from "react";

import type { Figure as FigureData } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * A number, rendered according to where it came from.
 *
 * Motion is a truth signal on this page, so it is spent the same way the signal
 * colour is: a measured figure counts up when it enters the viewport, and a
 * target sits still. That is not decoration and it is not a per-component
 * choice — it reads `provenance` off the figure and there is no prop to
 * override it. The mono tag above each figure says the same thing in words, so
 * the claim survives a printout, a screen reader and reduced motion.
 */

const TAG: Record<FigureData["provenance"], string> = {
  measured: "Measured in simulation",
  target: "Target — not achieved",
  grower: "From grower interviews",
};

/** Ease out quint: fast off the mark, a long settle. A linear count reads like
 *  a loading spinner; this reads like a value arriving. */
const ease = (t: number) => 1 - Math.pow(1 - t, 5);
const DURATION = 1300;

function useCountUp(to: number, decimals: number, animates: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  const [counted, setCounted] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || !animates) return;

    let frame = 0;
    let start = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        const step = (now: number) => {
          if (!start) start = now;
          const t = Math.min(1, (now - start) / DURATION);
          setCounted(to * ease(t));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, animates]);

  // ⚠️ The displayed value is derived, not stored. A figure that does not
  // animate — a target, or anything at all under reduced motion — renders its
  // full value on the very first paint, rather than rendering zero and being
  // corrected by an effect a frame later.
  return { ref, text: (animates ? counted : to).toFixed(decimals) };
}

export default function Figure({
  figure,
  onDark = false,
  size = "figure",
}: {
  figure: FigureData;
  onDark?: boolean;
  size?: "figure" | "h2";
}) {
  const reduced = useReducedMotion();
  const animates =
    figure.provenance === "measured" && figure.value !== undefined && !reduced;

  const { ref, text } = useCountUp(
    figure.value ?? 0,
    figure.decimals ?? 0,
    animates,
  );

  const signal =
    figure.provenance === "measured"
      ? onDark
        ? "text-signal-dark"
        : "text-signal"
      : onDark
        ? "text-chalk"
        : "text-ink";

  const tagColour = onDark ? "text-chalk-mute" : "text-ink-mute";
  const bodyColour = onDark ? "text-chalk-soft" : "text-ink-soft";

  return (
    <div className="flex flex-col gap-3">
      <p className={`t-mono ${tagColour}`}>{TAG[figure.provenance]}</p>

      <p className={`${size === "h2" ? "t-h2" : "t-figure"} ${signal}`}>
        {figure.literal !== undefined ? (
          figure.literal
        ) : (
          <>
            {/* The counting value is aria-hidden and a static one sits beside
                it, so a screen reader is read the final number once instead of
                a thousand intermediate ones.
                ⚠️ Prefix and suffix are inside *both* spans rather than shared
                between them. Sharing them interleaves the two values in the
                element's text — "~12 kg/hr" came out as "~1212 kg/hr" — which
                is invisible on screen and wrong to anything reading the DOM,
                including the check in tools/verify.mjs. */}
            <span ref={ref} aria-hidden="true">
              {figure.prefix}
              {text}
              {figure.suffix}
            </span>
            <span className="sr-only">
              {figure.prefix}
              {(figure.value ?? 0).toFixed(figure.decimals ?? 0)}
              {figure.suffix}
            </span>
          </>
        )}
      </p>

      <p className={`t-h3 ${onDark ? "text-chalk" : "text-ink"}`}>
        {figure.label}
      </p>
      <p className={`t-small ${bodyColour}`}>{figure.method}</p>
    </div>
  );
}
