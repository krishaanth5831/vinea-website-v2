"use client";

import { useSyncExternalStore } from "react";

import Nav from "@/components/Nav";
import HeroA from "./hero/HeroA";
import HeroB from "./hero/HeroB";
import HeroC from "./hero/HeroC";
import HeroD from "./hero/HeroD";

/**
 * Section 1 — the hero, as a switchboard over four structurally different
 * concepts.
 *
 * The concepts live in ./hero/ (A: split editorial, B: image-led overlay,
 * C: instrument-led, D: centred manifesto). Which one renders is set by the
 * HERO_VARIANT constant below — the single place to flip it. A `?hero=A|B|C|D`
 * query parameter overrides the constant at runtime, so each concept can be
 * screenshot and compared without a rebuild; in production no query parameter
 * is ever sent and the constant decides.
 */

const VARIANTS = {
  A: HeroA,
  B: HeroB,
  C: HeroC,
  D: HeroD,
} as const;

type VariantKey = keyof typeof VARIANTS;

/** Flip the hero here. */
const HERO_VARIANT: VariantKey = "D";

/**
 * The active variant, read as a value rather than set in an effect. The query
 * parameter is static for the life of the page, so the store never changes;
 * useSyncExternalStore is used only for its server-snapshot semantics — the
 * server (and hydration) always see HERO_VARIANT, and the client then reads
 * `?hero=` once, with no hydration mismatch. Same shape as useReducedMotion.
 */
function useVariant(): VariantKey {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const q = new URLSearchParams(window.location.search).get("hero");
      return q && q in VARIANTS ? (q as VariantKey) : HERO_VARIANT;
    },
    () => HERO_VARIANT,
  );
}

export default function Hero() {
  const Variant = VARIANTS[useVariant()];

  return (
    <>
      <Nav />
      <Variant />
    </>
  );
}
