"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe `prefers-reduced-motion: reduce` hook shared by every atmosphere
 * primitive. Starts `false` (matches the server render / no-motion-info state),
 * flips on mount, and tracks live OS changes so a primitive can freeze to its
 * still frame without re-mounting.
 *
 * Every atmosphere primitive treats `true` as "designed still frame": freeze
 * particles, kill drift, drop the RAF — legibility over effect (North Star Floor).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
