import Arrow from "@/components/Arrow";
import Photo from "@/components/Photo";
import { CTA, CTA_HREF, EYEBROW, HEADLINE, HONESTY, LEAD } from "./copy";

/**
 * Hero D — centred manifesto. One display line, centred, with the argument and
 * the honesty line set narrow beneath it, and the glasshouse photograph
 * confined to a band at the foot of the hero. The stage sits in the middle of
 * the page, not over a picture, so nothing can read as footage of a product.
 * Static — the line is a statement, not a scrub.
 */
export default function HeroD() {
  return (
    <section id="top" className="on-dark bg-forest">
      <div className="flex min-h-svh flex-col">
        <div className="shell flex flex-1 flex-col items-center justify-center pt-28 pb-12 text-center sm:pt-32">
          <p className="t-mono text-chalk-soft">{EYEBROW}</p>
          <h1 className="t-display mt-8 max-w-[18ch] text-chalk">{HEADLINE}</h1>
          <p className="t-lead mt-8 max-w-[46ch] text-chalk-soft">{LEAD}</p>
          <p className="t-small mt-4 max-w-[46ch] text-chalk-mute">{HONESTY}</p>
          <a
            href={CTA_HREF}
            className="press group mt-10 inline-flex items-center gap-4 border border-chalk-mute px-7 py-5 text-chalk hover:border-chalk hover:bg-chalk hover:text-forest"
          >
            <span className="t-mono">{CTA}</span>
            <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
          </a>
        </div>

        <figure className="relative h-[26vh] min-h-40 w-full overflow-hidden">
          <Photo name="hero" sizes="100vw" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-forest/20" />
          <figcaption className="t-mono-sm absolute bottom-4 left-1/2 -translate-x-1/2 text-chalk-soft">
            A real glasshouse — not a render.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
