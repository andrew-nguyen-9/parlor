import type { Tutorial } from "./types";

// REAL content (G6) — Thread of Fate revamp: easier, weaving-loom UI, clear
// last-letter→first-letter hint. Overlay reads this; games edit only this file.
export const tutorial: Tutorial = {
  href: "/thread",
  title: "Thread of Fate",
  accent: "history",
  tagline: "Work the loom stitch by stitch — every answer's last letter starts the next.",
  rules: [
    "The Weaver hands you a chain of clues with well-known answers — recognizable on purpose.",
    "Each answer's LAST letter is the first letter of the next answer along the warp. Use that pass to unlock the stitch below it.",
    "Stuck? Spend a hint to reveal the passing letter — it downgrades a clean stitch to a mended one, but keeps the thread moving.",
    "After the final stitch, name the master theme that runs through every answer to weave the thread whole.",
  ],
  example: {
    prompt: "Stitch one answers “Rome”. It ends in “e”, so stitch two's answer begins with “E”.",
    walkthrough:
      "“Rome” → the next clue's answer starts with E: “Egypt”. Egypt ends in “t”, so the third answer begins with “T”, and so on down the loom. Solve the chain, then name what ties them all — the theme is never spoken in a link, only revealed by weaving it.",
  },
};
