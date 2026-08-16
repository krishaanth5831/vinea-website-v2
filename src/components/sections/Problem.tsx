import Photo from "@/components/Photo";
import Figure from "@/components/Figure";
import { GROWER } from "@/lib/data";

const cost = GROWER.find((f) => f.id === "labour-cost")!;
const crew = GROWER.find((f) => f.id === "crew")!;
const tonnes = GROWER.find((f) => f.id === "tonnes")!;

/**
 * Section 2 — the problem, led by the number a grower already knows.
 *
 * The €250,000 is a grower's own figure, so it is tagged as one and attributed
 * in the copy. It does not get the signal colour and it does not count up:
 * those belong to things Vinea measured, and borrowing them for someone else's
 * number would be the first crack in the rule the rest of the page depends on.
 */
export default function Problem() {
  return (
    <section id="problem" className="bg-bone py-(--spacing-section)">
      <div className="shell">
        <p className="t-mono mb-10 text-ink-mute" data-reveal>
          The problem
        </p>

        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <h2 className="t-h1 lg:col-span-7" data-reveal>
            Picking runs on
            <br />
            labour you cannot
            <br />
            count on.
          </h2>

          <div
            className="lg:col-span-5 lg:pt-3"
            data-reveal
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            <p className="t-lead text-ink-soft">
              Harvest is booked week to week through agencies, largely with
              migrant crews. Peak demand lands on every grower in Westland in
              the same fortnight, and the season runs roughly week 13 to week 48
              whether the crew turns up or not.
            </p>
            <p className="t-body mt-6 text-ink-mute">
              In every conversation we have had with growers, availability comes
              up before wage does. Nobody leads with what a picker costs. They
              lead with whether there will be one.
            </p>
          </div>
        </div>
      </div>

      <div className="shell mt-20 sm:mt-28">
        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-12">
          <figure
            className="relative aspect-4/5 overflow-hidden lg:col-span-5 lg:aspect-3/4"
            data-reveal-mask
          >
            <Photo
              name="crates"
              sizes="(max-width: 1024px) 92vw, 38vw"
              className="h-full w-full object-cover"
            />
          </figure>

          <div className="flex flex-col justify-between gap-14 lg:col-span-7">
            <div
              data-reveal
              style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
            >
              <Figure figure={cost} />
              <p className="t-body mt-8 max-w-[46ch] text-ink-soft">
                That is the wage bill for taking fruit off the vine and nothing
                else — before the roster, before the agency margin, before the
                weeks when nobody is available at any price.
              </p>
            </div>

            <div className="grid gap-10 border-t border-bone-edge pt-10 sm:grid-cols-2">
              <div
                data-reveal
                style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
              >
                <Figure figure={crew} />
              </div>
              <div
                data-reveal
                style={{ "--reveal-delay": "240ms" } as React.CSSProperties}
              >
                <Figure figure={tonnes} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shell mt-20 sm:mt-28">
        <figure
          className="relative aspect-16/9 overflow-hidden sm:aspect-21/9"
          data-reveal-mask
        >
          <Photo
            name="hand"
            sizes="94vw"
            className="h-full w-full object-cover"
            altOverride="A picker's hand under a truss of green tomatoes in a glasshouse row, taking the weight of the cluster from below."
          />
        </figure>
        <p
          className="t-small mt-6 max-w-[54ch] text-ink-mute"
          data-reveal
        >
          A picker takes the weight of a truss from underneath and cuts it free.
          It is a good motion, done thousands of times a day, and it is the
          motion the robot copies.
        </p>
      </div>
    </section>
  );
}
