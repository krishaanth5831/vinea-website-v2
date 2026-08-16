"use client";

import { useEffect } from "react";

/**
 * Lenis, loaded after the page has painted, with the reduced-motion contract
 * respected.
 *
 * Two decisions here, both about not making a nicety expensive:
 *
 * Smooth scroll is itself motion, so a visitor who has asked for less does not
 * get it — Lenis is never even fetched and the browser's own scrolling stands.
 * That also keeps the pinned reel honest: its scrub reads `window.scrollY`,
 * which is real either way.
 *
 * ⚠️ And it is imported dynamically rather than at the top of the file. Lenis
 * is progressive enhancement — the page scrolls perfectly without it — but
 * bundled statically it lands in the first chunk and is parsed before the first
 * paint, where Lighthouse's 4x-CPU mobile profile charges several hundred
 * milliseconds of render delay for it. Fetched on idle it costs nothing anyone
 * measures and nothing anyone notices.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: import("lenis").default | undefined;
    let frame = 0;
    let cancelled = false;
    let onClick: ((event: MouseEvent) => void) | undefined;

    const boot = async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.6,
        // Touch devices already have momentum scrolling that feels native.
        // Adding ours on top fights the platform and makes the pinned section
        // drift under a collapsing address bar.
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);

      // In-page anchors have to go through Lenis or they jump while it eases.
      onClick = (event: MouseEvent) => {
        const anchor = (event.target as HTMLElement | null)?.closest?.(
          'a[href^="#"]',
        ) as HTMLAnchorElement | null;
        if (!anchor) return;
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        lenis?.scrollTo(target as HTMLElement, { offset: 0 });
      };
      document.addEventListener("click", onClick);
    };

    const idle =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) => window.setTimeout(() => cb({} as never), 200));
    const handle = idle(() => void boot(), { timeout: 2000 }) as number;

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
      if (onClick) document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return null;
}
