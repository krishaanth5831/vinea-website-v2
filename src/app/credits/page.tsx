import type { Metadata } from "next";
import Link from "next/link";

import { IMAGES } from "@/lib/images";
import { CONTACT } from "@/lib/data";

export const metadata: Metadata = {
  title: "Image credits",
  description:
    "Photography credits for the Vinea site. Every photograph is free stock from Pexels, downloaded, graded and served from this domain.",
  robots: { index: false, follow: true },
};

const CREDITS = Object.values(IMAGES);

export default function Credits() {
  return (
    <main id="main" className="min-h-svh bg-bone py-(--spacing-section)">
      <div className="shell">
        <Link href="/" className="t-mono link press-text text-ink-mute">
          &#8592; Vinea
        </Link>

        <h1 className="t-h1 mt-12 max-w-[14ch]">Image credits</h1>

        <p className="t-lead mt-8 text-ink-soft">
          The photographs on this site are free stock from{" "}
          <a
            className="link press-text"
            href="https://www.pexels.com"
            target="_blank"
            rel="noreferrer"
          >
            Pexels
          </a>
          , used under the Pexels licence. Every one was downloaded, graded
          toward the palette and is served from this domain — nothing is
          hotlinked.
        </p>

        <p className="t-body mt-6 text-ink-mute">
          The video is not stock. All of it was rendered from Vinea&rsquo;s own
          MuJoCo simulation in August 2026, and none of it shows hardware,
          because there is none.
        </p>

        <ul className="mt-16 border-t border-bone-edge">
          {CREDITS.map((image) => (
            <li
              key={image.src}
              className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-bone-edge py-6"
            >
              <span className="t-body max-w-[52ch] text-ink">
                {image.alt}
              </span>
              <a
                className="t-mono link press-text shrink-0 text-ink-mute"
                href={image.credit.url}
                target="_blank"
                rel="noreferrer"
              >
                {image.credit.author} · Pexels
              </a>
            </li>
          ))}
        </ul>

        <p className="t-small mt-16 text-ink-mute">
          Something credited wrongly? Write to{" "}
          <a className="link press-text" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>{" "}
          and it will be fixed the same day.
        </p>
      </div>
    </main>
  );
}
