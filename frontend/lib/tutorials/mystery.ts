import type { Tutorial } from "./types";

// Sanctum Mysterii — E8: steps replace the old rule-sentence list; mechanic unchanged.
export const tutorial: Tutorial = {
  href: "/mystery",
  title: "Sanctum Mysterii",
  accent: "history",
  tagline: "One suspect, one room, one hour — deduced from the evidence alone.",
  steps: [
    { icon: "🕵️", text: "One suspect, one room, one hour is guilty." },
    { icon: "📋", text: "Clues clear or narrow — never name the killer." },
    { icon: "👆", text: "Tap a pill: Potential → Prime → Cleared." },
    { icon: "⚖️", text: "Prime one of each, then accuse to close the case." },
  ],
  example: {
    prompt: "Clue: “The victim was seen alive at 9 PM, so the murder came later.”",
    walkthrough: "Clear 9 PM as the hour, keeping only later hours — cross off the rest with the remaining clues until one suspect, room, and hour stand alone.",
  },
};
