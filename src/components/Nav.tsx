"use client";

import { useEffect, useRef, useState } from "react";

import { CONTACT } from "@/lib/data";

/**
 * The whole navigation. Four words and a mark, on a translucent layer.
 *
 * A one-page site does not need a menu; it needs a way back to the top and a
 * way to the thing the page is asking for. Anything else is furniture.
 *
 * Two Apple ideas are doing the work here. **Wayfinding** — every screen should
 * answer where you are and how you get out, so the bar detaches from the hero
 * and follows you down rather than scrolling away with the first section.
 * **Materials** — it is a translucent layer with the page running underneath
 * (`backdrop-filter`), not an opaque strip that eats a band of the viewport,
 * and it thickens as content arrives beneath it rather than sitting on a hard
 * 1px divider from the start.
 *
 * Labels are specific rather than safe: "The robot", "Measured", "Pilot 2027"
 * name their contents. A nav item called "Home" or "More" would tell a grower
 * nothing about whether it is worth a tap.
 */
export default function Nav() {
  const [landed, setLanded] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    // Flips once the reader is past the first screen. An observer rather than a
    // scroll handler, so nothing runs per frame for a boolean that changes
    // twice in a session.
    const observer = new IntersectionObserver(
      ([entry]) => setLanded(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} className="absolute top-0 h-px w-px" aria-hidden />
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          landed ? "chrome" : "border-b border-transparent"
        }`}
      >
        <div className="shell flex items-baseline justify-between py-5 sm:py-6">
          <a
            href="#top"
            className="t-h3 press text-chalk"
            style={{ letterSpacing: "-0.02em" }}
          >
            Vinea
            <span className="sr-only"> — back to top</span>
          </a>

          <nav
            aria-label="Primary"
            className={`flex items-baseline gap-6 sm:gap-10 ${landed ? "on-chrome" : ""}`}
          >
            <a
              href="#robot"
              className="t-mono link press-text hidden text-chalk sm:inline"
            >
              The robot
            </a>
            <a
              href="#numbers"
              className="t-mono link press-text hidden text-chalk sm:inline"
            >
              Measured
            </a>
            <a href="#pilot" className="t-mono link press-text text-chalk">
              Pilot 2027
            </a>
            <span className="sr-only">Contact {CONTACT.email}</span>
          </nav>
        </div>
      </header>
    </>
  );
}
