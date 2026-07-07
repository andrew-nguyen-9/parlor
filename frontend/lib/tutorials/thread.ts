import type { Tutorial } from "./types";

// STUB (F2) — Thread of Fate is being revamped this cycle; that game unit
// overwrites this file with final rules + example. Keep the shape; overlay reads it.
export const tutorial: Tutorial = {
  href: "/thread",
  title: "Thread of Fate",
  accent: "history",
  tagline: "Follow the chain of clues — each answer links to the next.",
  rules: [
    "Answers form a chain: each one is the key to the clue that follows.",
    "Solve them in order, using what you just learned to unlock the next link.",
    "Unravel the whole thread before it tangles.",
  ],
  example: {
    prompt: "Clue 1 answers “Rome”; clue 2 asks about a river running through that answer.",
    walkthrough: "Carry “Rome” into clue two — the river is the Tiber — and the thread pulls forward.",
  },
};
