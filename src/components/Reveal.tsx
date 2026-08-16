"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for every reveal on the page.
 *
 * Elements opt in with `data-reveal` or `data-reveal-mask`; the observer only
 * ever writes the attribute's value, and CSS owns the animation. That keeps the
 * whole effect to opacity, transform and clip-path — no measured reads, no
 * layout, and nothing to recalculate when Lenis moves the page.
 *
 * Each element is unobserved the moment it lands, so a long page costs one
 * callback per element for the whole session rather than one per scroll.
 */
export default function Reveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(
      "[data-reveal], [data-reveal-mask]",
    );
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => {
        if (node.hasAttribute("data-reveal")) node.dataset.reveal = "in";
        if (node.hasAttribute("data-reveal-mask"))
          node.dataset.revealMask = "in";
      });
      return;
    }

    const land = (node: HTMLElement) => {
      if (node.hasAttribute("data-reveal")) node.dataset.reveal = "in";
      if (node.hasAttribute("data-reveal-mask")) node.dataset.revealMask = "in";
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          land(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      // The negative bottom margin delays the trigger so the motion finishes as
      // the reader arrives rather than starting then.
      //
      // ⚠️ Threshold 0, not 0.12. A tall figure needs a lot of itself on screen
      // to clear 0.12, and a fast flick past it can carry the element from
      // fully-below to fully-above without the observer ever sampling a frame
      // where enough of it was visible — which leaves a photograph clipped to
      // nothing while its caption sits underneath, fully faded in. Any pixel is
      // enough to count as arrived.
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    // ⚠️ Everything already on screen at load is landed outright, before the
    // observer sees it. The -12% bottom margin that makes scrolling feel right
    // also shrinks the root at load, and anything sitting in that bottom slice
    // of the first viewport — which on the hero is the call to action — would
    // stay at opacity 0 until the visitor scrolled past it. An element the
    // reader can already see is not something to animate in.
    const fold = window.innerHeight;
    const pending: HTMLElement[] = [];
    nodes.forEach((node) => {
      if (node.getBoundingClientRect().top < fold) land(node);
      else pending.push(node);
    });

    // Landing them still runs the CSS transition, so the hero keeps its
    // staggered entrance — each element carries its own `--reveal-delay`. What
    // changes is only that none of them can be stranded at opacity 0.
    pending.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return null;
}
