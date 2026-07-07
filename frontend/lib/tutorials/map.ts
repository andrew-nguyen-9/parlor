import type { Tutorial } from "./types";

// STUB (F2) — Atlas Obscura is being revamped this cycle; that game unit
// overwrites this file with final rules + example. Keep the shape; overlay reads it.
export const tutorial: Tutorial = {
  href: "/map",
  title: "Atlas Obscura",
  accent: "geography",
  tagline: "Drop a pin where it happened. Scored by the kilometer.",
  rules: [
    "Each round names a place or an event tied to somewhere on Earth.",
    "Tap the map to drop your pin, then confirm your guess.",
    "The closer your pin lands to the true spot, the more you score.",
  ],
  example: {
    prompt: "“Where is the Colosseum?”",
    walkthrough: "Drop your pin on Rome; a pin in central Italy still scores well, one in Spain far less.",
  },
};
