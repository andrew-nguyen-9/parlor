import type { Tutorial } from "./types";

// The Gauntlet — E8: steps replace the old rule-sentence list; mechanic unchanged.
export const tutorial: Tutorial = {
  href: "/gauntlet",
  title: "The Gauntlet",
  accent: "wildcard",
  tagline: "One trial from every room, one continuous clock — lower time wins.",
  steps: [
    { icon: "🏃", text: "One trial from every room, back to back." },
    { icon: "⏱️", text: "The clock never stops. Lower time wins." },
    { icon: "💡", text: "A hint costs 30s. A wrong answer costs 20s." },
    { icon: "🏅", text: "Finish, then share your line: clean, hinted, trapped." },
  ],
  example: {
    prompt: "The Sundial Gate · “In what year did the Berlin Wall fall?”",
    walkthrough: "Answer 1989 with no penalty; guess 1991 and it still opens (within 4 years) but adds a 20s trap.",
  },
};
