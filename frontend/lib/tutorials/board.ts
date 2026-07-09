import type { Tutorial } from "./types";

// Codex (THE BOARD) — E8: steps replace the old rule-sentence list. Accent is
// a safelisted category ink, never HEX.
export const tutorial: Tutorial = {
  href: "/board",
  title: "Codex",
  accent: "history",
  tagline: "Five categories, five values, one daily theme — the same board for everyone.",
  steps: [
    { icon: "🗂️", text: "Pick a category and a value." },
    { icon: "💰", text: "Answer right, claim the value. Miss it, lose it." },
    { icon: "📅", text: "Today's theme tilts some clues toward it." },
    { icon: "🎲", text: "One hidden Daily Double lets you wager blind." },
  ],
  example: {
    prompt: "On Moon Landing day, even 'Dynasties' for 200 may ask a spacefaring clue.",
    walkthrough: "Read the theme up top, bank easy low values first, then hunt the daily double.",
  },
};
