import Photo from "@/components/Photo";

/**
 * Section 3 — who it is for. Four facts, no cards.
 *
 * The brief for this section is that it should be possible to read it in ten
 * seconds and know whether it is about you. So it is four labelled lines in a
 * row, on rules rather than in boxes: nesting them in cards would add three
 * borders and a shadow and say nothing extra.
 */

const FACTS = [
  {
    label: "Crop",
    value: "Truss tomatoes",
    note: "Tomatoes-on-the-vine, cut and graded as a cluster rather than picked as loose fruit.",
  },
  {
    label: "Cultivation",
    value: "High wire",
    note: "Plants lowered and leaned along the wire through the season, fruit worked at a consistent height.",
  },
  {
    label: "Greenhouse",
    value: "Existing Venlo glass",
    note: "Pipe rail already in every aisle. Nothing is laid, nothing is rebuilt, nothing is retrofitted to the structure.",
  },
  {
    label: "Size",
    value: "5–15 hectares",
    note: "Owner-operated, Westland or Lansingerland. One decision-maker, who still walks the rows.",
  },
];

export default function WhoItsFor() {
  return (
    <section id="who" className="bg-bone-sunk py-(--spacing-section)">
      <div className="shell">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="t-mono mb-10 text-ink-mute" data-reveal>
              Who it is for
            </p>
            {/* Breaks are explicit rather than left to the browser: at this
                size the column decides the wrap, and a heading that reflows
                from three lines to four between breakpoints is a different
                heading. */}
            <h2 className="t-h1" data-reveal>
              One kind of house.
              <br />
              One kind of grower.
            </h2>
          </div>

          <div
            className="lg:col-span-5 lg:pt-24"
            data-reveal
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            <p className="t-lead text-ink-soft">
              Vinea is not a general-purpose farm robot and is not trying to be.
              It is built for one crop in one cultivation system in one region,
              because that is the only way a machine this early can be honest
              about what it will do in your house.
            </p>
          </div>
        </div>

        <dl className="mt-20 grid gap-px border-t border-bone-edge sm:mt-28 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact, i) => (
            <div
              key={fact.label}
              className="border-b border-bone-edge py-8 pr-8 lg:border-b-0"
              data-reveal
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
            >
              <dt className="t-mono text-ink-mute">{fact.label}</dt>
              <dd>
                <p className="t-h3 mt-4 text-ink">{fact.value}</p>
                <p className="t-small mt-3 text-ink-soft">{fact.note}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="shell mt-20 sm:mt-24">
        <figure
          className="relative aspect-16/9 overflow-hidden sm:aspect-21/9"
          data-reveal-mask
        >
          <Photo
            name="glasshouse"
            sizes="94vw"
            className="h-full w-full object-cover"
          />
          <figcaption className="sr-only">
            A modern Venlo glasshouse in South Holland — the kind of house Vinea
            is designed to work inside without modification.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
