// IGNITE — rune substitution/cipher archive engine (G4 fills the generator).
//
// F6 stub: `IgnitePuzzle` / `generateIgnite` NAME + SIGNATURE are STABLE.
// Trivial VALID placeholder body until G4 lands the cipher-substitution logic.

import { mulberry32 } from "./rng";

export interface IgnitePuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  runeSet: string; // flavor (table column: rune_set)
  seed: number;
  // G4 expands: glyphs[], clues[], solution: substitution-map. Placeholder here.
  solution: string;
}

export function generateIgnite(dayIndex: number, date: string): IgnitePuzzle {
  const seed = (dayIndex ^ 0x19ee) >>> 0;
  const rand = mulberry32(seed);
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();
  const runeSet = `Rune Set ${Math.floor(rand() * 900) + 100}`;
  return { date, weekday, runeSet, seed, solution: "unsolved" };
}
