"use client";

import { useEffect, useState } from "react";

/** App-wide text size. Multiplies the responsive root type scale via --text-scale. */
export type TextSize = "S" | "M" | "L";

export const TEXT_SIZES: TextSize[] = ["S", "M", "L"];

// Single source for the multiplier. The no-flash inline script in layout.tsx
// mirrors these values (it can't import); keep them in sync.
export const TEXT_SCALE: Record<TextSize, number> = { S: 0.9, M: 1, L: 1.15 };

const KEY = "parlor.textsize";

function apply(size: TextSize) {
  document.documentElement.style.setProperty("--text-scale", String(TEXT_SCALE[size]));
  try {
    localStorage.setItem(KEY, size);
  } catch {
    /* private mode — best effort */
  }
}

/** Persisted S/M/L text size. Reads the value the no-flash script already applied. */
export function useTextSize(): [TextSize, (s: TextSize) => void] {
  const [size, setSize] = useState<TextSize>("M");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* ignore */
    }
    if (stored === "S" || stored === "M" || stored === "L") setSize(stored);
  }, []);

  function update(s: TextSize) {
    setSize(s);
    apply(s);
  }

  return [size, update];
}
