import Arrow from "@/components/Arrow";
import { CONTACT } from "@/lib/data";

/**
 * Section 7 — the pilot, and the ask. Dark close.
 *
 * The offer is three lines because it is genuinely three lines: you give rows
 * and honest feedback, we bring the robot and write everything down, you keep
 * the data and owe nothing. Anything longer would be a contract, and there
 * isn't one.
 */

const TERMS = [
  {
    who: "You give",
    what: "A block of rows, and honest feedback",
    note:
      "One aisle is enough to start. We work around your picking, not through it, and we leave when you say so.",
  },
  {
    who: "We bring",
    what: "The robot, and write down every measurement",
    note:
      "Throughput, cycle time, misses, damage, refusals — recorded whether it flatters us or not.",
  },
  {
    who: "You keep",
    what: "The data, and owe nothing",
    note:
      "The pilot is free. There is no fee, no commitment and no exclusivity attached to it.",
  },
];

export default function Pilot() {
  return (
    <section id="pilot" className="on-dark bg-forest py-(--spacing-section)">
      <div className="shell">
        <p className="t-mono mb-10 text-chalk-mute" data-reveal>
          Pilot · 2027 season
        </p>

        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <h2 className="t-h1 text-chalk lg:col-span-7" data-reveal>
            Two or three
            <br />
            growers. One
            <br />
            free season.
          </h2>

          <div
            className="lg:col-span-5 lg:pt-4"
            data-reveal
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            <p className="t-lead text-chalk">
              The 2027 season, not this one — the Dutch season ends around week
              48 and there is a mechanism problem to solve before a robot is
              worth your aisle.
            </p>
            <p className="t-small mt-6 text-chalk-mute">
              What we want from a pilot is a real house, a real crop and someone
              who will tell us plainly when it is not good enough.
            </p>
          </div>
        </div>

        <dl className="mt-20 grid gap-px border-t border-forest-edge sm:mt-24 lg:grid-cols-3">
          {TERMS.map((term, i) => (
            <div
              key={term.who}
              className="border-b border-forest-edge py-10 pr-10 lg:border-b-0"
              data-reveal
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            >
              <dt className="t-mono text-chalk-mute">{term.who}</dt>
              <dd>
                <p className="t-h3 mt-5 text-chalk">{term.what}</p>
                <p className="t-small mt-3 text-chalk-soft">{term.note}</p>
              </dd>
            </div>
          ))}
        </dl>

        <p
          className="t-small mt-12 max-w-[62ch] text-chalk-mute"
          data-reveal
        >
          On price: there isn&rsquo;t one yet, and quoting a number before a
          robot has run in a real house would be a guess with a euro sign on it.
          Vinea is intended to be sold as a service rather than a machine, and
          the rate will be set with pilot partners once there is measured
          performance to set it against.
        </p>

        {/* --- the ask ---------------------------------------------------- */}
        <div className="mt-24 border-t border-forest-edge pt-16 sm:mt-32">
          <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h3 className="t-h2 max-w-[16ch] text-chalk" data-reveal>
                If you grow truss tomatoes in Westland, we should talk.
              </h3>
            </div>

            <div
              className="flex flex-col gap-8 lg:col-span-6"
              data-reveal
              style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
            >
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noreferrer"
                className="press group flex items-baseline justify-between gap-6 border-b border-forest-edge pb-6 hover:border-chalk"
              >
                <span>
                  <span className="t-mono block text-chalk-mute">
                    Twenty minutes, no deck
                  </span>
                  <span className="t-h3 mt-3 block text-chalk">
                    Book a call
                  </span>
                </span>
                <Arrow
                  direction="up-right"
                  className="shrink-0 text-chalk transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="press group flex items-baseline justify-between gap-6 border-b border-forest-edge pb-6 hover:border-chalk"
              >
                <span>
                  <span className="t-mono block text-chalk-mute">
                    Or just write
                  </span>
                  <span className="t-h3 mt-3 block break-all text-chalk">
                    {CONTACT.email}
                  </span>
                </span>
                <Arrow className="shrink-0 text-chalk transition-transform duration-500 group-hover:translate-x-1" />
              </a>

              <p className="t-small text-chalk-mute">
                Vinea is {CONTACT.founder}, working from {CONTACT.location}.
                One person, which is why the answer comes back the same day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
