import type { Tutorial } from "./types";

// Codex (THE BOARD) — final tutorial (G2). Shape per F2 registry: rules 2–5,
// exactly one worked example; accent is a safelisted category ink, never HEX.
export const tutorial: Tutorial = {
  href: "/board",
  title: "Codex",
  accent: "history",
  tagline: "Five categories, five values, and a fresh daily theme — the same board for everyone.",
  rules: [
    "Pick a category and a value; higher values ask harder clues.",
    "Answer the clue to claim its value; a miss costs you the same amount.",
    "Every day carries a theme — an anniversary or holiday that tilts the board toward on-theme clues.",
    "One hidden daily double lets you wager before the clue is revealed.",
  ],
  example: {
    prompt: "On Moon Landing day the board leans lunar — even 'Dynasties' for 200 may ask a spacefaring clue.",
    walkthrough:
      "Read tonight's theme up top, bank easy low-value clues first, then hunt the daily double once you've read the room.",
  },
};
