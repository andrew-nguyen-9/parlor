// MYSTERY — deduction-grid archive engine (G1 fills the real generator).
//
// F6 stub: the exported NAME (`MysteryPuzzle` / `generateMystery`) and the
// SIGNATURE are STABLE — the queries loader + generate script import them by
// name. The body is a trivial VALID placeholder so build/test/lint stay green
// until G1 lands the suspects × locations × times deduction logic.

import { mulberry32 } from "./rng";

export interface MysteryPuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  caseName: string; // flavor (table column: case_name)
  seed: number;
  // G1 expands: suspects[], locations[], times[], clues: MysteryClue[],
  // solution: { suspect, location, time }. Placeholder until then.
  solution: string;
}

export function generateMystery(dayIndex: number, date: string): MysteryPuzzle {
  const seed = (dayIndex ^ 0x4d59) >>> 0;
  const rand = mulberry32(seed);
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();
  const caseName = `Case #${Math.floor(rand() * 900) + 100}`;
  return { date, weekday, caseName, seed, solution: "unsolved" };
}
