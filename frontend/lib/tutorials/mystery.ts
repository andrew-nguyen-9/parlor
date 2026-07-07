import type { Tutorial } from "./types";

// STUB (F2) — Sanctum Mysterii is being revamped this cycle; that game unit
// overwrites this file with final rules + example. Keep the shape; the overlay
// already reads it. Placeholder content is drawn from the room's deck blurb.
export const tutorial: Tutorial = {
  href: "/mystery",
  title: "Sanctum Mysterii",
  accent: "history",
  tagline: "A new case every night — read the dossiers, follow the clues, name the culprit.",
  rules: [
    "Each night the Order opens a fresh mystery with a small cast of suspects.",
    "Work through the clues to narrow down who did it.",
    "Commit to a culprit before the candle gutters out.",
  ],
  example: {
    prompt: "A clue rules out everyone who was seen in the library after midnight.",
    walkthrough: "Cross those suspects off, then weigh who's left against the remaining clues before you accuse.",
  },
};
