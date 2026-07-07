import type { Tutorial } from "./types";

// REAL content (F2) — Fractures is not being revamped this cycle.
export const tutorial: Tutorial = {
  href: "/wedges",
  title: "Fractures",
  accent: "sports",
  tagline: "Mend the shattered mirror — one wedge for every category, before the deck runs dry.",
  rules: [
    "You face a run of multiple-choice questions drawn from all six categories.",
    "Each question has a 15-second clock. Tap the answer you believe is right.",
    "A correct answer earns a base of 100 plus 20 for every second left on the clock — the faster you answer, the more it's worth. A miss or a timeout scores nothing.",
    "Your first correct answer in a category claims that category's wedge of the mirror. Fill all six wedges to mend it before the twenty-question deck is spent.",
  ],
  example: {
    prompt: "Sports · “Which country has won the most FIFA World Cup titles?”  (Germany / Brazil / Italy / Argentina)",
    walkthrough:
      "Brazil — five titles. Answer it in the first few seconds and you bank ~100 plus the speed bonus AND claim the sports wedge. Categories you've already claimed still score points, but only the first clear in each lights up its wedge.",
  },
};
