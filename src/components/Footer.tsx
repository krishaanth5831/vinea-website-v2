import { CONTACT } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="on-dark bg-forest pb-12">
      <div className="shell">
        <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-6 border-t border-forest-edge pt-10">
          <p className="t-mono-sm text-chalk-mute">
            Vinea · {CONTACT.location} · {new Date().getFullYear()}
          </p>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            <a
              href={`mailto:${CONTACT.email}`}
              className="t-mono-sm link text-chalk-soft"
            >
              {CONTACT.email}
            </a>
            <a href="/credits" className="t-mono-sm link text-chalk-soft">
              Image credits
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
