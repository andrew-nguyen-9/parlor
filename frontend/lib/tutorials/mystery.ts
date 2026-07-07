import type { Tutorial } from "./types";

// REAL content (G1) — Sanctum Mysterii is a pure systematic-logic deduction room.
export const tutorial: Tutorial = {
  href: "/mystery",
  title: "Sanctum Mysterii",
  accent: "history",
  tagline: "One culprit, one room, one hour — deduced from the evidence, never revealed.",
  rules: [
    "Each night the Order lays out a case: a cast of suspects, the rooms of the house, and the hours of the evening. Exactly one suspect, in one room, at one hour, is guilty.",
    "The Case File holds every clue. Each is a fact of pure elimination — it clears a suspect, rules out a room or an hour, brackets the time, or links a suspect to a room or hour. No clue ever names the killer outright.",
    "Tap a suspect, room or hour to cycle its pill: Potential → Prime → Cleared → blank. Use Cleared to strike out what the clues rule out; use Prime to mark your single best pick in each column. (Long-press or right-click steps a pill back.)",
    "When one suspect, one room and one hour are Primed, make the accusation. Get all three right to close the case.",
  ],
  example: {
    prompt:
      "Clues: “The Library was locked until 10 PM.” · “The victim was seen alive at 9 PM, so the murder came later.” · “Colonel Ashcroft has an unshakeable alibi and is cleared.”",
    walkthrough:
      "The second clue means the hour is after 9 PM; if only 9 PM and 10 PM remain, Clear 9 PM and Prime 10 PM. The first clue tells you a murder in the Library could only be 10 PM or later — consistent, so the Library survives. The third clue lets you Clear Colonel Ashcroft. Keep crossing off until one suspect, one room and one hour stand alone, then accuse.",
  },
};
