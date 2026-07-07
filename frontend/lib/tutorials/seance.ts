import type { Tutorial } from "./types";

// STUB (F2) — The Séance is being revamped this cycle; that game unit overwrites
// this file with final rules + example. Keep the shape; the overlay reads it.
export const tutorial: Tutorial = {
  href: "/seance",
  title: "The Séance",
  accent: "wildcard",
  tagline: "Who or what am I? Each clue costs a point — the earliest guess earns the most.",
  rules: [
    "The Medium reveals clues one at a time about a hidden person, place, or thing.",
    "Guess whenever you like; every clue you reveal first lowers the points on offer.",
    "Answer early for the big score, or wait for certainty and settle for less.",
  ],
  example: {
    prompt: "Clue 1: “I was born in 1856.”  Clue 2: “I hold over 1,000 patents.”",
    walkthrough: "Name Edison on clue two for near-full points instead of waiting for the giveaway.",
  },
};
