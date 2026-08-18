import Arrow from "@/components/Arrow";
import { CTA, CTA_HREF, EYEBROW, HEADLINE, HONESTY, LEAD } from "./copy";

/**
 * Hero A — split editorial. Type does the work: the display headline owns the
 * left column, the argument and the ask sit in the right, and a mono meta row
 * closes the section. No photograph and no scroll motion — the plainest of the
 * four, so the honesty line reads as text rather than as a caption under a
 * picture.
 */
export default function HeroA() {
  return (
    <section id="top" className="on-dark bg-forest">
      <div className="shell flex min-h-svh flex-col justify-center pt-28 pb-12 sm:pt-32">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <h1 className="t-h1 text-chalk lg:col-span-7">{HEADLINE}</h1>

          <div className="flex flex-col justify-end gap-8 lg:col-span-5 lg:pb-2">
            <p className="t-lead text-chalk-soft">{LEAD}</p>
            <p className="t-small text-chalk-mute">{HONESTY}</p>
            <a
              href={CTA_HREF}
              className="press group inline-flex w-fit items-center gap-4 border border-chalk-mute px-7 py-5 text-chalk hover:border-chalk hover:bg-chalk hover:text-forest"
            >
              <span className="t-mono">{CTA}</span>
              <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-forest-edge pt-6 sm:mt-20">
          <p className="t-mono text-chalk-soft">{EYEBROW}</p>
          <p className="t-mono-sm text-chalk-mute">
            Pre-prototype · Simulation only · Seeking 2027 pilots
          </p>
        </div>
      </div>
    </section>
  );
}
