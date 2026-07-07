// ATLAS — constellation/asterism logic archive engine (G5 fills the generator).
//
// F6 stub: `AtlasPuzzle` / `generateAtlas` NAME + SIGNATURE are STABLE.
// Trivial VALID placeholder body until G5 lands the sky-region logic.

import { mulberry32 } from "./rng";

export interface AtlasPuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  skyRegion: string; // flavor (table column: sky_region)
  seed: number;
  // G5 expands: stars[], lines[], clues[], solution. Placeholder until then.
  solution: string;
}

export function generateAtlas(dayIndex: number, date: string): AtlasPuzzle {
  const seed = (dayIndex ^ 0xa715) >>> 0;
  const rand = mulberry32(seed);
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();
  const skyRegion = `Sky Region ${Math.floor(rand() * 900) + 100}`;
  return { date, weekday, skyRegion, seed, solution: "unsolved" };
}
