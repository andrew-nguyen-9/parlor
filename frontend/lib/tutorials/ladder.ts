import type { Tutorial } from "./types";

// FINAL (G8) — Climb of the Initiate is a stack of genuine deduction grids drawn
// from a rotating library of logic-puzzle families (skyscrapers, futoshiki,
// binairo). One worked example keeps the rules literal; the overlay reads this.
export const tutorial: Tutorial = {
  href: "/ladder",
  title: "Climb of the Initiate",
  accent: "history",
  tagline: "Each rung is a logic grid with ONE solution. Deduce it, lock it, climb.",
  rules: [
    "Every rung is a deduction puzzle — no guessing. The family rotates by the day: Skyline (skyscrapers), the Balance (futoshiki), or Twin Sigils (binairo).",
    "Fill the whole board so no constraint is broken; conflicting cells glow red and the Lock stays sealed until the board is clean.",
    "A wrong Lock collapses the rung and adds time (+90s, then +180s). Clear every rung to reach the summit.",
    "Tap the help panel on any rung for that family's exact rules.",
  ],
  example: {
    prompt: "A Skyline rung: a clue of “1” sits on the left of a row.",
    walkthrough:
      "A left clue of 1 means only one tower is visible from the left, so the tallest tower (height n) must sit in that row's first cell — nothing can hide behind it. Place it, then deduce the rest of the Latin square.",
  },
};
