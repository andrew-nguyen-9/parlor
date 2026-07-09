import type { Tutorial } from "./types";

// ATLAS 3D (E3) — six constellation figures drift in a Three.js starfield.
// Tap/raycast to focus a figure; a DOM chip strip rules out + names it. No
// astronomy needed: solved by counting and reasoning over what's drawn.
export const tutorial: Tutorial = {
  href: "/map",
  title: "Atlas",
  accent: "geography",
  tagline: "Six patterns drift in deep space. The omens point to exactly one.",
  steps: [
    { icon: "✨", text: "Six star patterns drift among a thousand stars." },
    { icon: "👆", text: "Tap a pattern to focus it and read its shape." },
    { icon: "❌", text: "Cross off any pattern an omen rules out." },
    { icon: "🌟", text: "One pattern survives every omen — name it to win." },
  ],
  example: {
    prompt: "Omen: “drawn from exactly four stars, lines closing into a loop.”",
    walkthrough: "Count the stars in each pattern, keep the four-star ones, then keep only those whose lines close into a loop — one figure survives.",
  },
};
