import type { Tutorial } from "./types";

// CHRONOS — clockwork logic box (G3). Rules describe the deduction puzzle; the
// worked example proves it is solvable by reasoning alone, trivia optional.
export const tutorial: Tutorial = {
  href: "/clock",
  title: "Chronos",
  accent: "music",
  tagline: "Assemble the gear-train in the one order the backplate allows.",
  rules: [
    "A clockwork train has several wheels; each must sit at a distinct stage — 1 winds the mainspring, the last drives the dial.",
    "Tap a wheel in the tray, then tap a stage to seat it. Tap a seated wheel to lift it back.",
    "The engraved rules on the backplate pin down exactly one legal order — a ✓ means a rule is satisfied, a ✕ means the train would jam.",
    "It is pure logic: reason it out from the rules. The founding-year engravings behind “cheat with history” are only a shortcut, never required.",
  ],
  example: {
    prompt: "“The Fusée turns before the Escape Wheel; the Escape Wheel drives the dial.”",
    walkthrough:
      "Two rules, two wheels: the Escape Wheel must be last, so the Fusée seats earlier in the train — no dates needed to place them.",
  },
};
