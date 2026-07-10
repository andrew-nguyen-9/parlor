"use client";

import { TEXT_SIZES, useTextSize, type TextSize } from "@/lib/useTextSize";

const LABEL: Record<TextSize, string> = {
  S: "small text",
  M: "medium text",
  L: "large text",
};
// Glyph size hints S/M/L visually; screen readers get the aria-label instead.
const GLYPH: Record<TextSize, string> = { S: "0.7rem", M: "0.85rem", L: "1rem" };

/** Persistent app-wide text-size control (S/M/L). Mirrors ThemeToggle's global mount. */
export default function TextSizeControl() {
  const [size, setSize] = useTextSize();

  return (
    <div
      role="group"
      aria-label="text size"
      className="fixed bottom-6 left-6 z-30 flex items-center gap-0.5 rounded-full border border-line bg-surface/80 p-0.5 backdrop-blur"
    >
      {TEXT_SIZES.map((s) => (
        <button
          key={s}
          onClick={() => setSize(s)}
          aria-pressed={size === s}
          aria-label={LABEL[s]}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded-full px-1 leading-none transition ${
            size === s ? "bg-brass/20 text-ink" : "text-muted hover:text-ink"
          }`}
        >
          <span aria-hidden style={{ fontSize: GLYPH[s] }}>
            A
          </span>
        </button>
      ))}
    </div>
  );
}
