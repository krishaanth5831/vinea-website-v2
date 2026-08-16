import Arrow from "@/components/Arrow";
import Clip from "@/components/Clip";
import Nav from "@/components/Nav";

/**
 * Section 1 — dark, full-bleed, one sentence, one CTA.
 *
 * The honest line sits directly under the headline rather than in a footnote,
 * and it is said once. The old site hedged about a dozen times and the effect
 * was an apology; stating it plainly in the first screen and then never again
 * is the same information delivered as confidence.
 *
 * ⚠️ Nothing in here reveals on scroll, and that is deliberate twice over. The
 * page's motion vocabulary is for content the reader travels to; the hero is
 * where they land, so there is nothing to announce. And an entrance that starts
 * at opacity 0 defers largest-contentful-paint by its own duration — the
 * headline was painting at 3.0 s on throttled mobile purely because it was
 * waiting for hydration to fade it in. Above the fold, the content is simply
 * there, JavaScript or no JavaScript.
 */
export default function Hero() {
  return (
    <section
      id="top"
      className="on-dark relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-forest"
    >
      <div className="absolute inset-0 -z-10">
        <Clip
          name="hero"
          eager
          priority
          sizes="100vw"
          label="Simulation: a trolley drives along the pipe rail down a greenhouse aisle while two robot arms harvest tomatoes from the rows on either side."
        />
        {/* ⚠️ One gradient, and a light one. The clip is already graded dark at
            encode time (see tools/publish.py), so the flat scrim that would
            normally go here darkens an already-dark image twice and the whole
            frame collapses to black. What is left is a gradient that only does
            the job CSS is actually needed for: guaranteeing contrast under the
            block of text at the bottom, wherever the machine happens to be. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(15 21 18 / 0.92) 0%, rgb(15 21 18 / 0.62) 34%, rgb(15 21 18 / 0.10) 72%, rgb(15 21 18 / 0.45) 100%)",
          }}
        />
      </div>

      <Nav />

      <div className="shell pb-10 pt-32 sm:pb-14">
        <p className="t-mono mb-7 text-chalk-soft">
          Vinea · Westland, Netherlands
        </p>

        <h1 className="t-display max-w-[16ch] text-chalk">
          It picks the
          <br />
          truss, in the
          <br />
          glasshouse you
          <br />
          already have.
        </h1>

        <div className="mt-8 flex flex-col gap-8 border-t border-forest-edge pt-7 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-[54ch]">
            <p className="t-lead text-chalk">
              A modular robot that harvests truss tomatoes from the pipe rail
              already running down every aisle of every Dutch high-wire house.
              No rebuild, no new track, no mapping guesswork.
            </p>
            {/* Said once, here, and then not again. The old site hedged about a
                dozen times and the cumulative effect was an apology. */}
            <p className="t-small mt-4 text-chalk-mute">
              Vinea is pre-prototype. There is no hardware — everything on this
              page runs in a MuJoCo simulation and no robot has run in a
              greenhouse. We want two or three growers to change that in 2027.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="#pilot"
              className="group inline-flex items-center gap-4 border border-chalk-mute px-7 py-5 transition-colors duration-500 hover:border-chalk hover:bg-chalk hover:text-forest"
            >
              <span className="t-mono">Take a free 2027 pilot</span>
              <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
            </a>
            <p className="t-mono-sm mt-4 text-chalk-mute lg:text-right">
              Recorded in simulation · Aug 2026
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
