import type { Tutorial } from "./types";

// The Séance — E8: steps replace the old rule-sentence list; mechanic unchanged
// (a logic-grid "zebra" puzzle, not a 20-questions guess).
export const tutorial: Tutorial = {
  href: "/seance",
  title: "The Séance",
  accent: "wildcard",
  tagline: "Read the whispers, bind every soul to its seat — no guessing, only deduction.",
  steps: [
    { icon: "🔮", text: "Every seat holds one value from each category." },
    { icon: "👻", text: "Tap a cell: once to snuff (✕), again to bind (◯)." },
    { icon: "🔗", text: "Binding a seat auto-snuffs the rest of its row/column." },
    { icon: "⏳", text: "Stabilise once every seat is bound — a wrong guess costs 60s." },
  ],
  example: {
    prompt: "Whisper: “Mr. Vane and the salt ring mark the same soul.”",
    walkthrough: "Bind Mr. Vane to the salt ring, then snuff that ring from every other seat's row and column.",
  },
};
