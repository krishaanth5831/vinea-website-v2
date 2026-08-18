"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Shared motion primitives for the hero concepts.
 *
 * One easing for every entrance — the site's `--ease-out`
 * (cubic-bezier(0.23, 1, 0.32, 1)) as a motion curve — so the JS-driven motion
 * lands as hard as the CSS-driven reveals and the two never read as separate
 * animation systems. Everything here is transform + opacity only, and each
 * primitive resolves to its end state under prefers-reduced-motion by
 * rendering the plain, un-animated element.
 */

export const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

/** A block that rises into place. Used for lead, honesty line, CTA, meta rows. */
export function FadeUp({
  children,
  className = "",
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** A headline revealed word by word, each word rising out of its own mask. */
export function Words({
  text,
  className = "",
  delay = 0.05,
  stagger = 0.07,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <h1 className={className}>{text}</h1>;

  const words = text.split(" ");

  return (
    <motion.h1
      className={className}
      initial="hidden"
      animate="shown"
      variants={{
        shown: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em]"
        >
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: "115%" },
              shown: { y: "0%", transition: { duration: 0.85, ease: EASE } },
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}
