import type { Tutorial } from "./types";

// The Overture — E8: steps replace the old rule-sentence list; mechanic unchanged
// (audio recognition, not notation). Accent resolves to safelisted text-music.
export const tutorial: Tutorial = {
  href: "/overture",
  title: "The Overture",
  accent: "music",
  tagline: "Name the track from its opening seconds.",
  steps: [
    { icon: "▶️", text: "Hit play — hear a track's opening seconds." },
    { icon: "🎵", text: "Pick the title before the meter runs out." },
    { icon: "⚡", text: "Faster answers score more in a set of 5." },
    { icon: "📻", text: "Daily mode: same clip for everyone, fewer tries wins." },
  ],
  example: {
    prompt: "A bright four-note piano figure plays and fades. Four titles wait below.",
    walkthrough: "You recognize the hook on the first phrase and tap that title for the top, fast-solve score.",
  },
};
