import type { Tutorial } from "./types";

// CLIMB + QUEENS/KEYBOARD (E5) — a stack of deduction grids from a rotating
// family library (skyscrapers, futoshiki, binairo, and now Queens). Full
// keyboard entry: arrows move the cursor, digits fill, Enter/Space toggles a
// queen, Backspace erases. One worked example keeps the rules literal.
export const tutorial: Tutorial = {
  href: "/ladder",
  title: "Climb of the Initiate",
  accent: "history",
  tagline: "Each rung is a logic grid with ONE solution. Deduce it, lock it, climb.",
  steps: [
    { icon: "🧩", text: "Every rung is a logic grid — no guessing, one solution." },
    { icon: "⌨️", text: "Arrows move, digits fill, Enter/Space places a queen." },
    { icon: "👑", text: "Queens rungs: one queen per row, column, and diagonal." },
    { icon: "🔓", text: "Clean board, then Lock it. A wrong Lock costs time." },
  ],
  example: {
    prompt: "A Skyline rung: a clue of “1” sits on the left of a row.",
    walkthrough: "Only the tallest tower can be seen alone from that side, so it fills that row's first cell — deduce the rest from there.",
  },
};
