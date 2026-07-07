import type { Tutorial } from "./types";

// STUB (F2) — Codex is being revamped this cycle; that game unit overwrites this
// file with final rules + example. Keep the shape; the overlay already reads it.
export const tutorial: Tutorial = {
  href: "/board",
  title: "Codex",
  accent: "history",
  tagline: "Five categories, five values, one daily double — the same board for everyone.",
  rules: [
    "Pick a category and a value; higher values ask harder questions.",
    "Answer to claim the value; a wrong answer costs you.",
    "One hidden daily double lets you wager before you see the clue.",
  ],
  example: {
    prompt: "History for 200 · a gentle opener to warm up the board.",
    walkthrough: "Start low to bank easy points, then hunt the daily double once you've read the room.",
  },
};
