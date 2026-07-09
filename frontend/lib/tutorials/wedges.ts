import type { Tutorial } from "./types";

// Fractures — E8: steps replace the old rule-sentence list; mechanic unchanged.
export const tutorial: Tutorial = {
  href: "/wedges",
  title: "Fractures",
  accent: "sports",
  tagline: "Mend the mirror — one wedge per category, before the deck runs dry.",
  steps: [
    { icon: "❓", text: "Multiple-choice questions from all six categories." },
    { icon: "⏲️", text: "15 seconds each — faster answers score more." },
    { icon: "🪞", text: "First correct answer in a category claims its wedge." },
    { icon: "✅", text: "Fill all six wedges before the deck runs out." },
  ],
  example: {
    prompt: "Sports · “Which country has won the most FIFA World Cup titles?”",
    walkthrough: "Brazil, with five titles — answer fast to bank the speed bonus and claim the sports wedge.",
  },
};
