import Clip from "@/components/Clip";
import Photo from "@/components/Photo";

/**
 * Section 4 — the robot.
 *
 * The pipe rail is the sharpest thing Vinea has to say and it gets the top of
 * the section and a full-bleed photograph, not a clause in a feature list. The
 * argument is short enough to fit in a headline: the track is already there,
 * and because it is a track there is no mapping drift and nothing to localise
 * against.
 *
 * The module viewer below shows the actual machine turning, rendered from the
 * same scene the harvest runs in, rather than an illustration of one.
 */

const MODULES = [
  {
    tag: "Module one",
    name: "Harvest",
    status: "First",
    line:
      "Cradle-and-blade gripper, two arms, both sides of the aisle. This is what is built and measured.",
  },
  {
    tag: "Module two",
    name: "Scout",
    status: "Version two",
    line:
      "The same base, the same rail, the mapping pass on its own — a house walked nightly for ripeness and set.",
  },
];

export default function Robot() {
  return (
    <section id="robot" className="bg-bone py-(--spacing-section)">
      {/* --- the pipe rail --------------------------------------------- */}
      <div className="shell">
        <p className="t-mono mb-10 text-ink-mute" data-reveal>
          The robot
        </p>
        <h2 className="t-h1 max-w-[15ch]" data-reveal>
          It runs on the rail
          <br />
          you already heat
          <br />
          the house with.
        </h2>
      </div>

      <figure className="shell mt-14 sm:mt-20">
        <div
          className="relative aspect-4/3 overflow-hidden sm:aspect-16/9"
          data-reveal-mask
        >
          <Photo
            name="pipeRail"
            sizes="94vw"
            className="h-full w-full object-cover"
          />
        </div>
        <figcaption className="t-small mt-6 max-w-[58ch] text-ink-mute">
          The heating pipes in a Dutch aisle are already a track — growers push
          picking trolleys along them all season. Vinea is a trolley on the same
          pipes.
        </figcaption>
      </figure>

      <div className="shell mt-16 sm:mt-24">
        <div className="grid gap-x-16 gap-y-10 border-t border-bone-edge pt-12 lg:grid-cols-12">
          <p
            className="t-h3 lg:col-span-5"
            data-reveal
          >
            Nothing to lay. Nothing to rebuild.
          </p>
          <div
            className="lg:col-span-7"
            data-reveal
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            <p className="t-lead text-ink-soft">
              Every other machine that wants to move down a glasshouse aisle has
              to solve where it is. Vinea does not have that problem, because it
              is bolted to a fixed track: there is no map to drift, no odometry
              to lose, no feature to re-localise against. Position down the row
              is one number, and the rail keeps it honest.
            </p>
            <p className="t-body mt-6 text-ink-mute">
              It is also the only reason a pilot can start in an existing house.
              Nothing is installed, nothing is drilled, and if the robot is
              wheeled out on a Friday the aisle is exactly as it was.
            </p>
          </div>
        </div>
      </div>

      {/* --- two arms and the gripper ----------------------------------- */}
      <div className="shell mt-24 sm:mt-32">
        <div className="grid gap-x-16 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div
              className="relative aspect-4/3 overflow-hidden"
              data-reveal-mask
            >
              <Photo
                name="truss"
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-12 lg:col-span-6">
            <div data-reveal>
              <p className="t-mono text-ink-mute">Two arms</p>
              <h3 className="t-h2 mt-4">One per row, both sides at once.</h3>
              <p className="t-body mt-5 text-ink-soft">
                An aisle has a row on either side of it. A machine with one arm
                walks the house twice; a machine with two works both rows in one
                pass and halves the driving. The two arms share a deck, so they
                interlock over the middle of it — measured, not assumed, and the
                clearance is checked every control cycle.
              </p>
            </div>

            <div
              className="border-t border-bone-edge pt-12"
              data-reveal
              style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
            >
              <p className="t-mono text-ink-mute">The gripper</p>
              <h3 className="t-h2 mt-4">
                Cradle from below. Cut the stem.
              </h3>
              <p className="t-body mt-5 text-ink-soft">
                One moving joint. The tool comes up under the truss, takes its
                weight the way a picker&rsquo;s hand does, and a blade cuts the
                stem above it. Nothing closes around the fruit and nothing pulls
                on the plant, so the load the vine sees is the weight of its own
                cluster and no more.
              </p>
            </div>

            <div
              className="border-t border-bone-edge pt-12"
              data-reveal
              style={{ "--reveal-delay": "200ms" } as React.CSSProperties}
            >
              <p className="t-mono text-ink-mute">Scouting</p>
              <h3 className="t-h2 mt-4">Built, not planned.</h3>
              <p className="t-body mt-5 text-ink-soft">
                The robot maps the aisle as it drives and judges ripeness by
                colour, then plans the pick order off its own map. This is
                running in simulation today — it is not on a roadmap. There are
                no hardcoded fruit positions anywhere in the system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- module viewer ---------------------------------------------- */}
      <div className="shell mt-24 sm:mt-32">
        <div className="grid gap-x-16 gap-y-12 border-t border-bone-edge pt-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="t-mono text-ink-mute" data-reveal>
              One base, two modules
            </p>
            <h3 className="t-h2 mt-5" data-reveal>
              The trolley
              <br />
              stays. The tool
              <br />
              changes.
            </h3>
            <dl className="mt-10 flex flex-col gap-8">
              {MODULES.map((m, i) => (
                <div
                  key={m.name}
                  className="border-t border-bone-edge pt-6"
                  data-reveal
                  style={
                    { "--reveal-delay": `${i * 100}ms` } as React.CSSProperties
                  }
                >
                  <dt className="flex items-baseline justify-between gap-4">
                    <span className="t-h3 text-ink">{m.name}</span>
                    <span className="t-mono-sm text-ink-mute">{m.status}</span>
                  </dt>
                  <dd className="t-small mt-3 text-ink-soft">{m.line}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="lg:col-span-8">
            <div
              className="relative aspect-4/3 overflow-hidden bg-bone-sunk sm:aspect-16/10"
              data-reveal
            >
              <Clip
                name="module-loop"
                fit="cover"
                label="Simulation: the Vinea machine seen from all sides — a trolley sitting on the pipe rail, carrying two robot arms and two crates, rotating slowly."
              />
            </div>
            <figcaption className="t-small mt-6 max-w-[52ch] text-ink-mute">
              The machine as it exists — rendered from the same MuJoCo scene the
              harvest runs in, on its rail, with both arms and both crates. It
              has never been built.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
