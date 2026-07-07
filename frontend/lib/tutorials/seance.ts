import type { Tutorial } from "./types";

// REAL content (G7) — The Séance is a logic-grid deduction puzzle (a "zebra"
// grid), NOT a 20-questions guess. The stub's guessing framing was wrong; this
// replaces it with the actual mechanic. Rules describe presentation-neutral
// play so a revamp never dates the copy.
export const tutorial: Tutorial = {
  href: "/seance",
  title: "The Séance",
  accent: "wildcard",
  tagline: "Read the spirit's whispers, bind every soul to its seat — no guessing, only deduction.",
  rules: [
    "The spirit names N seats and a set of categories (guests, relics, fates…). Every seat holds exactly one value from each category, and no value repeats.",
    "The whispers on the left are your clues. Trace them across the scrying matrix: tap a cell once to snuff it (✕, an impossibility), tap again to bind it (◯, a certainty). Binding a value snuffs the rest of that seat's row and column for you.",
    "Deduce, never guess — every solution is forced by the clues alone. Triple-tap a cell to clear a row and column you've muddled; the Clear button wipes the board (both undoable).",
    "The Ectoplasmic Decay timer counts up; a wrong ‘Stabilise the Séance' costs a 60-second poltergeist strike. Stabilise only once every seat is fully bound and consistent with the whispers.",
  ],
  example: {
    prompt:
      "Whispers: “Mr. Vane sits somewhere above Lady Crale.” · “Mr. Vane and the salt ring mark the same soul.”",
    walkthrough:
      "Bind Mr. Vane to the salt ring (same soul), then snuff Lady Crale from the top seat — she must sit below Mr. Vane. Each whisper eliminates cells until only one arrangement survives; bind those and stabilise.",
  },
};
