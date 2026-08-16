"use client";

import { useEffect, useRef } from "react";

/**
 * One animation-frame loop for the whole page.
 *
 * The hero and the build reel are both scroll-scrubbed, and the naive shape —
 * a `requestAnimationFrame` loop per component — means two loops racing to read
 * layout and write transforms in the same frame, with no ordering guarantee
 * between them. One ticker, many subscribers, reads batched before writes.
 *
 * Scroll-linked motion is interruptible by construction, which is what makes it
 * the right tool here: the transform is a pure function of scroll position, so
 * grabbing the scrollbar and dragging back reverses it exactly, with no
 * animation to cancel and no target to re-aim. Nothing has to be "stopped".
 */

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();
let frame = 0;

function tick() {
  for (const fn of subscribers) fn();
  frame = requestAnimationFrame(tick);
}

function subscribe(fn: Subscriber) {
  subscribers.add(fn);
  if (subscribers.size === 1) frame = requestAnimationFrame(tick);
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0) cancelAnimationFrame(frame);
  };
}

/** Subscribe to the page's single animation-frame loop. Returns an unsubscribe. */
export function onTick(fn: Subscriber) {
  return subscribe(fn);
}

export function clamp(v: number, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Progress through a tall section, 0 when its top reaches the top of the
 * viewport and 1 when its bottom does.
 *
 * `onProgress` is called every frame with that number and is expected to write
 * transforms and nothing else — it must not read layout, because the read
 * already happened here, once, for every subscriber.
 */
export function useScrub(
  ref: React.RefObject<HTMLElement | null>,
  onProgress: (t: number) => void,
  enabled = true,
) {
  const cb = useRef(onProgress);
  // Kept current in an effect, not during render: the ticker reads this from
  // outside React's render cycle, and writing a ref while rendering is exactly
  // the tearing hazard concurrent rendering warns about.
  useEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let last = -1;
    return subscribe(() => {
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const t = travel > 0 ? clamp(-rect.top / travel) : 0;
      // Writing an identical transform every frame is free in the compositor
      // but not free in style recalculation, and this runs on every scroll
      // frame of a long page.
      if (Math.abs(t - last) < 0.0002) return;
      last = t;
      cb.current(t);
    });
  }, [ref, enabled]);
}
