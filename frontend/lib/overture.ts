// THE OVERTURE ("Name the Intro") — pure helpers, no React, so they unit-test
// cleanly (vitest can't resolve the @/ alias, so the test imports this relatively).
//
// Two audio-round shapes reach the room (both audio_guess questions):
//   • Deezer 30s-preview rows (G9): the REAL opening seconds stream from
//     `q.audio_url`; the track title rides in `q.subject_a` (a Deezer URL isn't
//     sluggable). These appear only when Deezer was reachable at forge time.
//   • synth-melody rows (offline fallback): `q.melody` is a note list played by
//     lib/sound.ts, and the title is recovered from the Wikipedia source_url slug
//     (…/wiki/Ode_to_Joy). These keep the room fully playable with zero network.
// The room derives a title per row and builds the name-the-tune choice pool from
// every titled row plus a bank of famous decoys (so choices stay rich even when
// the offline pool is small).

import type { Question } from "./types";

/** Recover a track title from a fact's source_url. Returns null when no title is
 *  derivable (e.g. a future Deezer track URL), so the row drops from the pool
 *  rather than offering a garbage choice. */
export function titleFromSource(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/wiki\/([^?#]+)/);
  if (!m) return null;
  try {
    const t = decodeURIComponent(m[1]).replace(/_/g, " ").trim();
    return t.length ? t : null;
  } catch {
    return null; // malformed %-escape
  }
}

/** Resolve a row's answer title. Deezer-preview rows (real clip) carry the title
 *  in `subject_a` — a Deezer URL can't be slugged; synth-melody rows fall back to
 *  the Wikipedia source_url slug. Returns null when neither yields a title so the
 *  row drops rather than offering a garbage choice. */
export function trackTitle(q: Question): string | null {
  if (q.audio_url) {
    const t = q.subject_a?.trim();
    if (t) return t;
  }
  return titleFromSource(q.source_url);
}

export interface TitledRow {
  q: Question;
  title: string;
}

/** The playable pool: rows that carry a derivable title. */
export function titledRows(pool: Question[]): TitledRow[] {
  const out: TitledRow[] = [];
  for (const q of pool) {
    const title = trackTitle(q);
    if (title) out.push({ q, title });
  }
  return out;
}

// Famous-song decoys — padded into the choice pool so a round always offers a
// full, plausible set even when the live/offline pool of real intros is thin.
// buildChoices dedups + filters the correct answer, so a decoy that happens to
// match the real title is harmless. Deliberately broad + era-spanning.
export const DECOY_TITLES: readonly string[] = [
  "Bohemian Rhapsody", "Billie Jean", "Hey Jude", "Smells Like Teen Spirit",
  "Rolling in the Deep", "Like a Rolling Stone", "Imagine", "Sweet Child o' Mine",
  "Purple Rain", "Wonderwall", "Hotel California", "Take On Me",
  "Uptown Funk", "Bad Guy", "Shape of You", "Blinding Lights",
  "Lose Yourself", "Stairway to Heaven", "Superstition", "Dancing Queen",
  "Africa", "Every Breath You Take", "No Woman No Cry", "Thriller",
  "Wannabe", "Toxic", "Umbrella", "Levitating",
];

/** Build a round's choices: the correct title + up to `want-1` distinct
 *  distractor titles drawn from the rest of the pool, all shuffled. `rand` keeps
 *  it deterministic (daily mode / tests). Degrades gracefully when the pool is
 *  smaller than `want` — never invents or duplicates a choice. */
export function buildChoices(
  title: string,
  otherTitles: string[],
  rand: () => number,
  want = 4,
): string[] {
  const distractors = shuffle([...new Set(otherTitles)].filter((t) => t !== title), rand);
  return shuffle([title, ...distractors.slice(0, Math.max(0, want - 1))], rand);
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
