import type { Tutorial } from "./types";

// STUB (F2) — Ignite is being revamped this cycle; that game unit overwrites
// this file with final rules + example. Keep the shape; the overlay reads it.
export const tutorial: Tutorial = {
  href: "/streak",
  title: "Ignite",
  accent: "screen",
  tagline: "Higher or lower? One wrong call ends the run.",
  rules: [
    "Two things are shown — populations, box offices, fan counts.",
    "Call whether the next value is higher or lower than the last.",
    "Every correct call extends your streak; the first miss ends it.",
  ],
  example: {
    prompt: "“Did this film gross MORE or LESS than the one before it?”",
    walkthrough: "Blockbuster sequels usually out-earn originals — lean higher, but a flop can break the chain.",
  },
};
