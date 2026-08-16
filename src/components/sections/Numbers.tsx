import Figure from "@/components/Figure";
import { GAP, MEASURED, TARGET } from "@/lib/data";

/**
 * Section 6 — measured against target, in two columns that do not pretend to be
 * the same kind of thing.
 *
 * Left: what the simulation did, in the signal colour, counting up, each with
 * the method underneath it. Right: what the machine has to do, in plain ink,
 * still. Between them, the gap — stated as a multiple, with the mechanism that
 * causes it named.
 *
 * The gap is the point of the section. A robotics company that publishes only
 * the target is asking to be taken on faith; one that publishes both and says
 * which is which has given a grower something to check.
 */
export default function Numbers() {
  return (
    <section id="numbers" className="bg-bone py-(--spacing-section)">
      <div className="shell">
        <p className="t-mono mb-10 text-ink-mute" data-reveal>
          Measured against target
        </p>
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <h2 className="t-h1 lg:col-span-6" data-reveal>
            Every number
            <br />
            here is labelled
            <br />
            one or the other.
          </h2>
          <p
            className="t-lead text-ink-soft lg:col-span-6 lg:pt-4"
            data-reveal
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            Measured means it happened in the simulation and we can show you the
            run. Target means it has not happened. The two never share a colour,
            and only the measured ones move when they arrive on screen — if a
            number on this page is still, it is because we have not earned the
            right to animate it.
          </p>
        </div>
      </div>

      {/* --- the two columns -------------------------------------------- */}
      <div className="shell mt-20 sm:mt-28">
        <div className="grid gap-x-16 gap-y-16 lg:grid-cols-2">
          {/* measured */}
          <div className="lg:border-r lg:border-bone-edge lg:pr-16">
            {/* ⚠️ No qualifier beside the column heading. Every figure below
                already carries "Measured in simulation" in mono, and repeating
                it up here made the column say the same thing three times before
                the reader reached a number — which is the hedging tic this site
                was written to avoid. The tag belongs on the number, because
                that is the thing that travels when someone screenshots it. */}
            <div className="pb-10" data-reveal>
              <div
                className="h-0.5 w-full bg-signal"
                data-rule
                aria-hidden
              />
              <h3 className="t-h3 mt-5 text-signal">Measured</h3>
            </div>

            <div className="flex flex-col gap-14">
              {MEASURED.map((figure, i) => (
                <div
                  key={figure.id}
                  data-reveal
                  style={
                    { "--reveal-delay": `${i * 60}ms` } as React.CSSProperties
                  }
                >
                  <Figure figure={figure} />
                </div>
              ))}

              <div
                className="border-t border-bone-edge pt-8"
                data-reveal
              >
                <p className="t-mono text-ink-mute">Also measured</p>
                <p className="t-h3 mt-4 text-ink">
                  No hardcoded fruit positions, anywhere.
                </p>
                <p className="t-small mt-3 text-ink-soft">
                  The robot finds every fruit itself. Move them, add more
                  mid-run, arrange them in a way it has never seen — the plan is
                  thrown away and rebuilt from what the cameras report.
                </p>
              </div>
            </div>
          </div>

          {/* target */}
          <div>
            <div className="pb-10" data-reveal>
              <div
                className="h-0.5 w-full bg-ink"
                data-rule
                style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
                aria-hidden
              />
              <h3 className="t-h3 mt-5 text-ink">Target</h3>
            </div>

            <div className="flex flex-col gap-14">
              {TARGET.map((figure, i) => (
                <div
                  key={figure.id}
                  data-reveal
                  style={
                    { "--reveal-delay": `${i * 60}ms` } as React.CSSProperties
                  }
                >
                  <Figure figure={figure} />
                </div>
              ))}

              <div className="border-t border-bone-edge pt-8" data-reveal>
                <p className="t-mono text-ink-mute">What that means</p>
                <p className="t-h3 mt-4 text-ink">
                  One robot covers roughly what one picker takes off the vine in
                  a week — without the roster.
                </p>
                <p className="t-small mt-3 text-ink-soft">
                  That is the bar. It is set against what growers told us two
                  full-time pickers actually do, not against a number that
                  sounded good in a deck.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- the gap ----------------------------------------------------- */}
      <div className="shell mt-24 sm:mt-32">
        <div
          className="border-t border-bone-edge pt-12"
          data-reveal
        >
          <p className="t-mono text-ink-mute">The gap</p>
        </div>

        <div className="mt-8 grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <h3 className="t-h1">
              We are {GAP.factor}×
              <br />
              short.
            </h3>
            <p className="t-lead mt-8 text-ink-soft">
              Measured throughput extrapolates to about{" "}
              <span className="text-signal">{GAP.measuredWeekly} a week</span>.
              The target is {GAP.targetWeekly}. That is not a rounding error and
              we are not going to describe it as one.
            </p>
          </div>

          <div
            className="lg:col-span-6 lg:pt-6"
            data-reveal
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            <p className="t-body text-ink-soft">
              We know where it is. A fixed{" "}
              <span className="text-signal">
                ~{GAP.bottleneckSeconds}-second segment
              </span>{" "}
              of every pick cycle does not shrink when the arm is driven faster,
              because it is not waiting on the controller — it is waiting on the
              mechanism. Tuning has been tried and it moves the number by almost
              nothing.
            </p>
            <p className="t-body mt-6 text-ink-soft">
              So the next twelve seconds have to come out of the tool, not the
              software. That is a hardware problem, it is the reason a pilot
              matters, and it is the single thing standing between the left-hand
              column and the right-hand one.
            </p>
            <p className="t-small mt-8 text-ink-mute">
              We would rather tell you this now than have you find it in week
              three of a trial.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
