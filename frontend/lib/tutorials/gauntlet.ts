import type { Tutorial } from "./types";

// REAL content (F2) — The Gauntlet is not being revamped this cycle.
export const tutorial: Tutorial = {
  href: "/gauntlet",
  title: "The Gauntlet",
  accent: "wildcard",
  tagline: "One trial from every room, one continuous clock. Your time is your score — lower is better.",
  rules: [
    "A daily expedition: one round from each room in turn — a multiple-choice bridge, a year gate, a higher-or-lower scale, a map trial, a riddle door.",
    "The clock starts on the first trial and never stops. Everyone plays the same gauntlet each day.",
    "Clear a gate cleanly and only your reflexes cost you time. Ask the Adventurer for a hint and it adds 30 seconds; spring a trap — a wrong answer, or a guess outside tolerance — and it adds 20.",
    "Year gates clear within 4 years; map trials within 800 km. When you finish, share your line of squares: ⛏️ clean, 💡 hinted, 🪤 trapped.",
  ],
  example: {
    prompt: "The Sundial Gate · “In what year did the Berlin Wall fall?”",
    walkthrough:
      "Answer 1989 and the gate opens with no penalty. Guess 1991 and you're still inside the 4-year tolerance — the gate opens, but a trap adds 20 seconds. Tap the hint first and that's 30 seconds either way, so guess before you ask.",
  },
};
