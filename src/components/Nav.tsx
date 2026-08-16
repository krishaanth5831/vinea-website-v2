import { CONTACT } from "@/lib/data";

/**
 * The whole navigation. Four words and a mark.
 *
 * A one-page site does not need a menu; it needs a way back to the top and a
 * way to the thing the page is asking for. Anything else is furniture.
 */
export default function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="shell flex items-baseline justify-between py-7 sm:py-9">
        <a
          href="#top"
          className="t-h3 text-chalk"
          style={{ letterSpacing: "-0.02em" }}
        >
          Vinea
          <span className="sr-only"> — home</span>
        </a>

        <nav aria-label="Primary" className="flex items-baseline gap-6 sm:gap-10">
          <a href="#robot" className="t-mono link hidden text-chalk-soft sm:inline">
            The robot
          </a>
          <a href="#numbers" className="t-mono link hidden text-chalk-soft sm:inline">
            Measured
          </a>
          <a href="#pilot" className="t-mono link text-chalk">
            Pilot 2027
          </a>
          <span className="sr-only">Contact {CONTACT.email}</span>
        </nav>
      </div>
    </header>
  );
}
