"use client";

import { useState } from "react";

import funding from "@/lib/funding";

/**
 * RoundReadiness — a segmented bar of the things that have to be true before a
 * round can close, each one weighted. NOT "how funded am I": it hits 100% the
 * day the round closes. Everything shown is computed from docs/content/
 * funding.json — the percentage, the "Next" line, the fills — nothing is typed
 * by hand. The acceptance criteria are public so the number can't quietly
 * inflate, and are never truncated.
 *
 * ⚠️ The values themselves are carried verbatim from v1 and are unverified.
 *
 * The fill runs once into view and stops, using the site's `data-rule`
 * primitive (a scaleX from a left origin) instead of a per-segment width
 * tween: transform-only, so nothing triggers layout, and under
 * prefers-reduced-motion it resolves to a fully-filled bar for free.
 *
 * The fill colour is moss, not the signal terracotta: that is reserved for
 * measured numbers, and a funding milestone is not a measurement.
 */

type Milestone = {
  id: string;
  label: string;
  criterion: string;
  weight: number;
  status?: "done" | "partial" | "todo";
  type?: "count";
  count?: number;
  target?: number;
  progress?: number;
};

const MILESTONES = funding.milestones as Milestone[];
const LAST_UPDATED = funding.lastUpdated;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Fraction 0..1 of this milestone that is earned. */
function fillOf(m: Milestone): number {
  if (m.type === "count") return clamp01((m.count ?? 0) / (m.target ?? 1));
  if (m.status === "done") return 1;
  if (m.status === "partial") return clamp01(m.progress ?? 0);
  return 0;
}

/** Screen-reader / hover status string. */
function statusOf(m: Milestone): string {
  if (m.type === "count") return `${m.count ?? 0} / ${m.target ?? 0}`;
  if (m.status === "done") return "Complete";
  if (m.status === "partial") return `${Math.round(fillOf(m) * 100)}% complete`;
  return "Not started";
}

// ── Computed, never typed ────────────────────────────────────────────────────
const totalWeight = MILESTONES.reduce((s, m) => s + m.weight, 0);
const earned = MILESTONES.reduce((s, m) => s + m.weight * fillOf(m), 0);
// Never rounded up: 26.04 → 26.
const percent = Math.floor((earned / totalWeight) * 100);

// "Next" = the heaviest milestone currently in progress (0 < fill < 1); if none
// is underway, the heaviest one still outstanding. Derived from the data.
const incomplete = MILESTONES.filter((m) => fillOf(m) < 1);
const underway = incomplete.filter((m) => fillOf(m) > 0);
const nextPool = underway.length > 0 ? underway : incomplete;
const nextMilestone = nextPool.reduce(
  (a, b) => (b.weight > a.weight ? b : a),
  nextPool[0],
);
const nextLabel = nextMilestone
  ? nextMilestone.label.charAt(0).toLowerCase() + nextMilestone.label.slice(1)
  : null;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function formatDate(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number);
  if (!y || !mo || !d) return iso;
  return `${MONTHS[mo - 1]} ${d}, ${y}`;
}

export default function RoundReadiness({ className = "" }: { className?: string }) {
  // The segment whose detail is shown. Hover/focus sets `hovered`; a tap pins
  // `pinned` (so touch, which has no hover, still works — it expands the plain
  // detail row underneath rather than needing a floating tooltip).
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const shownId = pinned ?? hovered;
  const shown = MILESTONES.find((m) => m.id === shownId) ?? null;

  return (
    <div className={`border-t border-bone-edge pt-10 ${className}`}>
      {/* Heading + last updated */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h3 className="t-h3 text-ink">
          Round readiness — <span className="tabular-nums">{percent}%</span>
        </h3>
        <p className="t-mono-sm text-ink-mute">
          Last updated{" "}
          <time dateTime={LAST_UPDATED} className="text-ink">
            {formatDate(LAST_UPDATED)}
          </time>
        </p>
      </div>

      {/* Segmented bar — one block per milestone, width proportional to weight */}
      <div
        role="group"
        aria-label={`Round readiness by milestone, ${percent}% overall`}
        className="flex gap-1"
      >
        {MILESTONES.map((m, i) => {
          const frac = fillOf(m);
          const pctText = `${Math.round(frac * 100)}%`;
          const isShown = shownId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              style={{ flexGrow: m.weight, flexBasis: 0 }}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() =>
                setHovered((cur) => (cur === m.id ? null : cur))
              }
              onFocus={() => setHovered(m.id)}
              onBlur={() => setHovered((cur) => (cur === m.id ? null : cur))}
              onClick={() => setPinned((cur) => (cur === m.id ? null : m.id))}
              aria-pressed={pinned === m.id}
              aria-label={`${m.label}: ${statusOf(m)}, weight ${m.weight} of ${totalWeight}`}
              className={`group relative block h-10 min-w-0 overflow-hidden rounded-sm bg-bone-sunk ring-1 ring-inset transition-shadow ${
                isShown ? "ring-ink-mute" : "ring-bone-edge"
              }`}
            >
              {/* Fill — runs once into view, then stops */}
              <div
                className="absolute inset-y-0 left-0 bg-moss"
                style={
                  {
                    width: pctText,
                    "--reveal-delay": `${i * 60}ms`,
                  } as React.CSSProperties
                }
                data-rule
              />
            </button>
          );
        })}
      </div>

      {/* Derived "Next" line */}
      {nextLabel && (
        <p className="t-body mt-3 text-ink-soft">
          <span className="t-mono-sm text-moss">Next:</span> {nextLabel}.
        </p>
      )}

      {/* Reveal row — updates on hover/focus, pins on tap. Fixed min-height so
          nothing shifts as it changes. */}
      <div
        aria-live="polite"
        className="mt-4 min-h-[4.75rem] rounded-lg border border-bone-edge bg-bone-sunk p-4"
      >
        {shown ? (
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="t-mono-sm text-ink">{shown.label}</span>
              <span className="t-mono-sm text-ink-mute">
                {statusOf(shown)} · weight {shown.weight}/{totalWeight}
              </span>
            </div>
            <p className="t-body text-ink-soft">
              {shown.criterion || "No acceptance criterion — this is the close."}
            </p>
          </div>
        ) : (
          <p className="t-body text-ink-mute">
            Hover, focus, or tap a block for its acceptance criterion and weight.
          </p>
        )}
      </div>

      {/* Full list — legible without hovering anything, and the SR backbone */}
      <details className="group mt-4 rounded-lg border border-bone-edge bg-bone-sunk">
        <summary className="t-mono flex cursor-pointer list-none items-center justify-between px-4 py-3 text-ink-mute transition-colors hover:text-ink">
          What each stage means
          <span
            className="text-ink-mute transition-transform group-open:rotate-90"
            aria-hidden
          >
            ›
          </span>
        </summary>
        <ol className="border-t border-bone-edge px-4 py-2">
          {MILESTONES.map((m) => (
            <li
              key={m.id}
              className="flex gap-3 border-b border-bone-edge py-3 last:border-b-0"
            >
              <span
                className="mt-2 h-2 w-2 shrink-0 rotate-45"
                style={{
                  background:
                    fillOf(m) >= 1
                      ? "var(--color-moss)"
                      : fillOf(m) > 0
                        ? "color-mix(in srgb, var(--color-moss) 45%, transparent)"
                        : "var(--color-bone-edge)",
                }}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="t-body font-medium text-ink">{m.label}</span>
                  <span className="t-mono-sm text-ink-mute">
                    {statusOf(m)} · weight {m.weight}/{totalWeight}
                  </span>
                </p>
                <p className="t-body mt-0.5 text-ink-soft">
                  {m.criterion || "No acceptance criterion — this is the close."}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
