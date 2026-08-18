import Arrow from "@/components/Arrow";
import Photo from "@/components/Photo";
import { CTA, CTA_HREF, EYEBROW, HEADLINE, HONESTY, LEAD } from "./copy";

/**
 * Hero C — instrument-led. The argument is a headline over a three-line status
 * readout (built / in simulation / deployed), set like a telemetry panel rather
 * than prose. A narrow pipe-rail photograph closes it, so the only image is
 * the one fact that matters: the track is already there. Static — nothing
 * moves, because a readout that animates is a readout pretending to be live.
 */

const ROWS = [
  { label: "Built", value: "Nothing yet. There is no hardware." },
  {
    label: "In simulation",
    value: "Survey, plan, pick, carry, crate — recorded in MuJoCo.",
  },
  { label: "Deployed", value: "None. No robot has run in a greenhouse." },
];

export default function HeroC() {
  return (
    <section id="top" className="on-dark bg-forest">
      <div className="shell flex min-h-svh flex-col justify-center pt-28 pb-10 sm:pt-32">
        <p className="t-mono text-chalk-soft">{EYEBROW}</p>

        <div className="mt-8 grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="t-h1 text-chalk">{HEADLINE}</h1>
            <p className="t-lead mt-6 max-w-[46ch] text-chalk-soft">{LEAD}</p>
            <a
              href={CTA_HREF}
              className="press group mt-10 inline-flex w-fit items-center gap-4 border border-chalk-mute px-7 py-5 text-chalk hover:border-chalk hover:bg-chalk hover:text-forest"
            >
              <span className="t-mono">{CTA}</span>
              <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="lg:col-span-5">
            <dl className="border-t border-forest-edge">
              {ROWS.map((row) => (
                <div key={row.label} className="border-b border-forest-edge py-6">
                  <dt className="t-mono flex items-center gap-2 text-chalk-mute">
                    <span
                      className="h-1.5 w-1.5 rotate-45 bg-chalk-soft"
                      aria-hidden
                    />
                    {row.label}
                  </dt>
                  <dd className="t-h3 mt-3 text-chalk">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="t-small mt-6 text-chalk-mute">{HONESTY}</p>
          </div>
        </div>

        <figure className="relative mt-14 hidden h-28 w-full overflow-hidden lg:block">
          <Photo
            name="pipeRail"
            sizes="94vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-forest/30" />
        </figure>
      </div>
    </section>
  );
}
