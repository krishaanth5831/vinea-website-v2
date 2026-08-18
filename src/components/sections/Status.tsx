import RoundReadiness from "./RoundReadiness";
import status from "@/lib/status";

const { eyebrow, heading, body, columns } = status;

/**
 * Status — "Where we are". Three columns — Built, In simulation, Next — so the
 * development stage is stated plainly, with a hard honesty line up top: no
 * deployed units, no field data. This is the section a grower checks us
 * against.
 *
 * ⚠️ The stage statements are v1's words, carried verbatim and unverified
 * (see the merge report). The nested RoundReadiness below reads
 * docs/content/funding.json and types nothing by hand.
 */
export default function Status() {
  return (
    <section
      id="status"
      className="border-t border-bone-edge bg-bone py-(--spacing-section)"
    >
      <div className="shell">
        <p className="t-mono mb-10 text-ink-mute" data-reveal>
          {eyebrow}
        </p>

        <h2 className="t-h1 max-w-2xl" data-reveal>
          {heading}
        </h2>

        <p
          className="t-lead mt-6 max-w-2xl text-ink-soft"
          data-reveal
          style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
        >
          {body}
        </p>

        <div className="mt-14 grid gap-px border border-bone-edge sm:grid-cols-3">
          {columns.map((col, i) => (
            <div
              key={col.k}
              className="flex flex-col gap-5 p-8"
              data-reveal
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            >
              <p className="t-mono flex items-center gap-2 text-ink">
                <span className="h-1.5 w-1.5 rotate-45 bg-ink" aria-hidden />
                {col.k}
              </p>
              <ul className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-mute"
                      aria-hidden
                    />
                    <span className="t-body text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <RoundReadiness className="mt-14" />
      </div>
    </section>
  );
}
