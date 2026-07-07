import type { Tutorial } from "./types";

// G9 — real tutorial for the revamped Overture ("name the intro"): audio
// recognition, not notation. Two modes (a replayable set of 5, a shared daily
// intro). Copy stays plain per VOICE; accent resolves to safelisted text-music.
export const tutorial: Tutorial = {
  href: "/overture",
  title: "The Overture",
  accent: "music",
  tagline: "Name the track from its opening seconds.",
  rules: [
    "Hit play — the house band sounds a track's opening: a real 30-second clip when the bank is fresh, a synthesized melody otherwise.",
    "Pick the title from the choices before the meter runs out.",
    "In a set of 5, the faster you answer the more each round is worth; a second guess costs you.",
    "The daily intro gives everyone the same track — each miss reveals a little more of the opening, so fewer tries means a higher score.",
  ],
  example: {
    prompt: "A bright four-note piano figure plays and fades. Four titles wait below.",
    walkthrough:
      "You recognize the hook on the first phrase, tap that title straight away, and bank the top score for a clean, fast solve.",
  },
};
