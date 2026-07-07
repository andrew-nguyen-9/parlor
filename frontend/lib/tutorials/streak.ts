import type { Tutorial } from "./types";

// IGNITE — the Witch's rune cipher (G4). A glyph-substitution logic puzzle:
// deduce which rune stands for which letter from the oracle's clues alone.
export const tutorial: Tutorial = {
  href: "/streak",
  title: "Ignite",
  accent: "screen",
  tagline: "Each rune hides a letter. Read the oracle's clues to light the incantation.",
  rules: [
    "Every rune in the key stands for exactly one letter — and each letter is used once.",
    "The oracle's clues (anchors, vowel/consonant marks, alphabet order and neighbours) pin the mapping down to a single answer.",
    "Tap a rune to select it, tap a letter to bind it, then read the runes when all are lit.",
  ],
  example: {
    prompt: "“Fehu ᚠ marks a vowel” and “Fehu ᚠ comes before Ansuz ᚨ in the alphabet.”",
    walkthrough:
      "If only A and E are vowels in play, Fehu is one of them; since it precedes Ansuz's letter, cross-check the other clues to fix it as A — then Ansuz must be a later letter.",
  },
};
