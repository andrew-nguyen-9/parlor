// THE BOARD's daily-theme engine (Codex, G2). A LARGE pool of dated
// anniversaries/holidays — the committed, offline "bundled fallback" the G2
// blocker requires: the day's theme is derived by CALENDAR DATE with zero
// network, so every player on a given day sees the same fresh framing and the
// app builds with the anniversary feed unreachable.
//
// Each entry names a `boardThemeKey` — one of lib/themes.ts THEMES (the visual
// skins, kept in sync with the pipeline's BOARD_THEME_KEYWORDS). Many dates map
// onto a handful of skins, so days feel fresh without exploding the skin set.
//
// Deterministic + SSR-safe: keyed only off dayIndex (days since epoch), never a
// live clock read or Math.random — SSR and client agree (see lib/rng.ts).

import raw from "./anniversaries.json";

export interface Anniversary {
  /** UTC calendar key, "MM-DD" */
  md: string;
  /** display name shown across THE BOARD ("Moon Landing") */
  name: string;
  /** one-line framing surfaced under the board frame */
  blurb: string;
  /** lib/themes.ts THEMES key — the visual skin this day borrows */
  boardThemeKey: string;
  /** lowercase keywords — a clue whose text hits one is "on-theme" (selection bias) */
  match: string[];
}

export const ANNIVERSARIES: Anniversary[] = (raw as { anniversaries: Anniversary[] })
  .anniversaries;

/** "MM-DD" (UTC) for a day index (days since the Unix epoch). Pure — the passed
 *  index fully determines the calendar date, so SSR and client never diverge. */
export function mdOfDay(dayIndex: number): string {
  const d = new Date(dayIndex * 86_400_000);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

// index the pool once by calendar key (first entry wins if a date is duplicated)
const BY_MD: Map<string, Anniversary> = (() => {
  const m = new Map<string, Anniversary>();
  for (const a of ANNIVERSARIES) if (!m.has(a.md)) m.set(a.md, a);
  return m;
})();

/** The anniversary that falls on `dayIndex`, or undefined for an ordinary day. */
export function anniversaryOfDay(dayIndex: number): Anniversary | undefined {
  return BY_MD.get(mdOfDay(dayIndex));
}
