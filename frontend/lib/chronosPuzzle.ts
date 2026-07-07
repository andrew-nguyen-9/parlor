// CHRONOS — clockwork/gear logic archive engine (G3 fills the real generator).
//
// F6 stub: `ChronosPuzzle` / `generateChronos` NAME + SIGNATURE are STABLE.
// Trivial VALID placeholder body until G3 lands the gear-constraint logic.

import { mulberry32 } from "./rng";

export interface ChronosPuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  mechanism: string; // flavor (table column: mechanism)
  seed: number;
  // G3 expands: gears[]/constraints[], solution, calendarSkin. Placeholder here.
  solution: string;
}

export function generateChronos(dayIndex: number, date: string): ChronosPuzzle {
  const seed = (dayIndex ^ 0x3c07) >>> 0;
  const rand = mulberry32(seed);
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();
  const mechanism = `Mechanism ${Math.floor(rand() * 900) + 100}`;
  return { date, weekday, mechanism, seed, solution: "unsolved" };
}
