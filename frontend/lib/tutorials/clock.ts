import type { Tutorial } from "./types";

// CHRONOS 3D (E2) — a serial gear TRAIN in Three.js: each wheel's tooth count
// steps a running index around every shaft's notch. Lock opens when all
// notches land at once. Kinematic logic puzzle, trivia is an optional peek.
export const tutorial: Tutorial = {
  href: "/clock",
  title: "Chronos",
  accent: "music",
  tagline: "Turn the gear-train until every notch lines up at once.",
  steps: [
    { icon: "⚙️", text: "Wheels mesh in a train — turning one turns them all." },
    { icon: "🔢", text: "Each wheel's tooth count shifts its shaft's marker." },
    { icon: "📍", text: "Arrange wheels so every shaft's notch lands together." },
    { icon: "🕰️", text: "Pure logic — the year peek is a shortcut, never required." },
  ],
  example: {
    prompt: "A 12-tooth wheel sits on a shaft whose notch is 3 steps away.",
    walkthrough: "Only a wheel that steps the marker by 3 (mod its dial) can seat there — swap wheels until every shaft's notch lines up.",
  },
};
