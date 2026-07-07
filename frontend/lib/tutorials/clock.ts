import type { Tutorial } from "./types";

// STUB (F2) — Chronos is being revamped this cycle; that game unit overwrites
// this file with final rules + example. Keep the shape; the overlay reads it.
export const tutorial: Tutorial = {
  href: "/clock",
  title: "Chronos",
  accent: "music",
  tagline: "When did it happen? Drag the year — closer guesses, bigger points.",
  rules: [
    "You're shown an event, a photo, or a track and asked when it dates from.",
    "Drag the slider to the year you think is right and lock it in.",
    "The closer your guess, the more you score — across five rounds against the century.",
  ],
  example: {
    prompt: "“When was this photograph taken?”",
    walkthrough: "Guess 1969; if the answer is 1971 you're only two years off and still bank most of the points.",
  },
};
