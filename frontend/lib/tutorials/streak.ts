import type { Tutorial } from "./types";

// IGNITE PHASER (E4) — the rune cipher now renders on a Phaser canvas (candle,
// inscription, rune grid, letter tray); React still owns the puzzle state. A
// glyph-substitution logic puzzle: deduce every rune's letter from the clues.
export const tutorial: Tutorial = {
  href: "/streak",
  title: "Ignite",
  accent: "screen",
  tagline: "Each rune hides a letter. Read the clues to light the incantation.",
  steps: [
    { icon: "🕯️", text: "Runes glow around a candlelit inscription." },
    { icon: "🔤", text: "Tap a rune, then tap the letter it hides." },
    { icon: "🧩", text: "The oracle's clues pin every rune to one letter." },
    { icon: "🔥", text: "Bind them all, then read the runes to ignite." },
  ],
  example: {
    prompt: "Clue: “Fehu ᚠ marks a vowel, and comes before Ansuz ᚨ in the alphabet.”",
    walkthrough: "Fehu must be an earlier vowel — cross-check the other clues to land on exactly one letter, then Ansuz falls into place after it.",
  },
};
