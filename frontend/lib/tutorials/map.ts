import type { Tutorial } from "./types";

// REAL content (G5) — Atlas is now a constellation LOGIC puzzle. No astronomy
// needed: you solve it by counting and reasoning over the drawn star patterns.
export const tutorial: Tutorial = {
  href: "/map",
  title: "Atlas",
  accent: "geography",
  tagline: "Six patterns burn in the dark. The omens point to exactly one.",
  rules: [
    "Each night the sky lays out six star patterns, drawn as dots joined by lines.",
    "A short list of omens describes the one you seek — but only by what you can SEE and COUNT: how many stars, whether the lines close into a loop, where the single brightest star sits. No stargazing knowledge is needed or rewarded.",
    "Cross off any pattern an omen rules out. Exactly one pattern obeys every omen.",
    "Name that pattern to win. Fewer wrong guesses, higher score — the constellation's real name is revealed only once you solve it.",
  ],
  example: {
    prompt:
      "Omens: “drawn from exactly four stars,” “its lines close into a loop,” “no star gathers more than two lines.”",
    walkthrough:
      "Ignore what the shapes are called. Count: keep only the four-star patterns. Of those, keep the ones whose lines form a closed loop. Toss any where a star has three lines meeting at it. One four-star, single-loop, no-hub figure survives — that's your answer.",
  },
};
