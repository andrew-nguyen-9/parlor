// The Overture's committed OFFLINE melody backup — plays through the same Web
// Audio synth engine as everything else (lib/sound.ts playMelody). Used when a
// round has neither a real Deezer preview (audio_url) nor a curated melody
// (q.melody): the Deezer network round-trip, an expired preview URL, or a
// browser autoplay block all leave a round with nothing to sound — this bank
// guarantees the needle always drops. Committed data, no network fetch, no dep
// (native Web Audio only, same as the rest of the app).
import bank from "../public/overture-melodies.json";
import type { Note } from "./types";
import { mulberry32 } from "./rng";

export interface BankMelody {
  title: string;
  melody: Note[];
}

const MELODIES = bank as BankMelody[];

/** Deterministic pick from the committed bank. Same seed ⇒ same melody (daily
 *  mode needs SSR/client + every player to agree; `set` mode just needs *a*
 *  tune, so any stable seed works there too). */
export function pickBankMelody(seed: number): BankMelody {
  const rand = mulberry32(seed);
  return MELODIES[Math.floor(rand() * MELODIES.length)];
}
