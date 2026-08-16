"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Whether the visitor has asked for less motion, as a value rather than as
 * something an effect syncs into state.
 *
 * Read with `useSyncExternalStore` for two reasons. It is reactive — a visitor
 * who turns the setting on mid-session gets the still version of the page
 * without a reload — and it keeps the preference out of `useEffect`, so a
 * component that must not animate never renders a first frame in which it is
 * about to.
 *
 * The server snapshot is `false`: the markup is identical either way (motion is
 * a transition, never a difference in content), and assuming motion is allowed
 * means the count-up starts from zero on the server and on the client in the
 * same render.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
