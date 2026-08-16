"use client";

import { useEffect } from "react";

import { onTick } from "@/lib/scrub";

/**
 * Drives every scroll reveal on the page.
 *
 * Elements opt in with `data-reveal`, `data-reveal-mask` or `data-rule`; this
 * only ever writes the attribute's value, and CSS owns the animation. That
 * keeps the whole effect to opacity, transform and clip-path — no layout, and
 * nothing to recalculate when Lenis moves the page.
 *
 * ⚠️ This used to be an IntersectionObserver and is now a per-frame check
 * against the same ticker the hero and the reel already run on. The observer
 * was losing elements: on a fast scroll it could sample a frame where a section
 * was still below the fold and the next where it was already above, and the
 * five reveals in the section straight after the hero would stay at opacity 0
 * for the rest of the session. Threshold 0 made it rarer, not impossible. A
 * position check cannot miss, because it asks the question every frame instead
 * of waiting to be told.
 *
 * The cost is bounded and shrinking: at most `PER_FRAME` rect reads per frame,
 * only while something is still unresolved, and the ticker is dropped entirely
 * once the list empties. Elements land in document order, which is the order
 * they are scrolled past.
 */

/** Rect reads per frame. Enough to clear a screenful of a fast flick. */
const PER_FRAME = 10;

/** Fires a little before the element is fully on screen, so the motion is
 *  finishing as the reader arrives rather than starting then. */
const MARGIN = 0.12;

export default function Reveal() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-reveal], [data-reveal-mask], [data-rule]",
      ),
    );
    if (!nodes.length) return;

    const land = (node: HTMLElement) => {
      if (node.hasAttribute("data-reveal")) node.dataset.reveal = "in";
      if (node.hasAttribute("data-reveal-mask")) node.dataset.revealMask = "in";
      if (node.hasAttribute("data-rule")) node.dataset.rule = "in";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(land);
      return;
    }

    let pending = nodes;
    let done = false;

    const sweep = () => {
      const fold = window.innerHeight * (1 - MARGIN);
      let checked = 0;
      const next: HTMLElement[] = [];
      for (const node of pending) {
        // Everything past the budget is carried to the next frame untouched —
        // it is below the fold anyway, because the list is in document order.
        if (checked >= PER_FRAME) {
          next.push(node);
          continue;
        }
        checked += 1;
        if (node.getBoundingClientRect().top < fold) land(node);
        else next.push(node);
      }
      pending = next;
      if (!pending.length) done = true;
    };

    // Anything already on screen at load lands on the first sweep, which still
    // runs the CSS transition — so the page keeps its staggered entrance and
    // nothing can be stranded invisible.
    const stop = onTick(() => {
      if (done) {
        stop();
        return;
      }
      sweep();
    });
    return stop;
  }, []);

  return null;
}
