import type { Tutorial } from "./types";

// STUB (F2) — The Overture is being revamped this cycle; that game unit
// overwrites this file with final rules + example. Keep the shape; overlay reads it.
export const tutorial: Tutorial = {
  href: "/overture",
  title: "The Overture",
  accent: "music",
  tagline: "Name the track before the needle lifts.",
  rules: [
    "The house band strikes up the opening of a track.",
    "Identify it as quickly as you can — the sooner you name it, the more it's worth.",
    "A music room for the sharp-eared.",
  ],
  example: {
    prompt: "A few opening bars play, then fade.",
    walkthrough: "Catch the hook early and answer on the first phrase for the top score.",
  },
};
