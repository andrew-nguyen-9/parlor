import type { Tutorial } from "./types";

// STUB (F2) — Climb of the Initiate is being revamped this cycle; that game unit
// overwrites this file with final rules + example. Keep the shape; overlay reads it.
export const tutorial: Tutorial = {
  href: "/ladder",
  title: "Climb of the Initiate",
  accent: "music",
  tagline: "Pick the closest match and climb. Hints reveal what the answers share.",
  rules: [
    "Each rung offers a set of options; choose the one that best fits the target.",
    "Hints reveal shared attributes — category, region, magnitude — to guide you.",
    "A right choice lifts you a rung; keep climbing the ladder as high as you can.",
  ],
  example: {
    prompt: "“Which of these is closest in population to Paris?”",
    walkthrough: "Use the region hint to rule out far-off cities, then pick the nearest match to climb.",
  },
};
