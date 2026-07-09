// ─────────────────────────────────────────────────────────────────────────────
// SANCTUM MYSTERII — a daily systematic-logic deduction puzzle (G1).
//
// The case is a single hidden TRIPLE: culprit × scene × hour, drawn from N
// suspects, N rooms and N (ordered) hours. Every clue is a pure ELIMINATION fact
// — it states a property the guilty triple must satisfy, ruling out the triples
// that don't. Solve by narrowing all three axes until one triple survives; there
// is never a "reveal" — the answer is deduced, not uncovered.
//
// Three clue families interlock so no axis falls out on its own (Séance-level):
//   • positive/negative exclusions  — "X is cleared", "not the {room}", time
//     brackets ("the murder came after {hour}")
//   • cross-axis relations          — "{room} was sealed until {hour}" (room↔time),
//     "{suspect} did not arrive until {hour}" (suspect↔time),
//     "{suspect} was never seen in {room}" (suspect↔room)
//
// PURE + date-seeded (lib/rng). The expensive Subtraction-Method prune (start from
// every true fact, drop any clue whose removal keeps the solution unique) runs
// once — server-side in scripts/generate-mystery.ts, or inline offline via the
// queries loader — and the result is archived. NO solve-time RNG. The candidate
// space is only N³ (≤125), so uniqueness is a cheap exhaustive count.
// ─────────────────────────────────────────────────────────────────────────────
import { mulberry32, shuffled } from "./rng";

export type ClueKind =
  | "clear-suspect" // this suspect is innocent
  | "clear-room" // the scene is not this room
  | "clear-time" // the hour is not this one
  | "after" // the murder happened strictly after this hour
  | "before" // …strictly before this hour
  | "room-sealed" // the room was locked until this hour (room ↔ time)
  | "arrived" // the suspect did not arrive until this hour (suspect ↔ time)
  | "never-in"; // the suspect was never in this room (suspect ↔ room)

export interface MysteryClue {
  kind: ClueKind;
  /** suspect index (clear-suspect | arrived | never-in). */
  s?: number;
  /** room index (clear-room | room-sealed | never-in). */
  r?: number;
  /** hour index (clear-time | after | before | room-sealed | arrived). */
  h?: number;
  text: string; // themed, self-contained sentence
}

export interface MysteryTriple {
  suspect: number; // index into suspects[]
  location: number; // index into locations[]
  time: number; // index into times[]
}

export interface MysteryPuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  caseName: string; // flavor (table column: case_name)
  seed: number;
  suspects: string[]; // length N
  locations: string[]; // length N
  times: string[]; // length N, chronologically ordered
  clues: MysteryClue[];
  solution: MysteryTriple; // the guilty triple, baked in
}

// ── difficulty by weekday (grid dimension N) ─────────────────────────────────
// Mon/Tue ease you in (3); midweek steps to 4; the weekend is the full 5-wide
// case. N³ candidates stays ≤125 so uniqueness is a trivial exhaustive count.
const WEEKDAY_N: Record<number, number> = {
  1: 3, // Mon
  2: 3, // Tue
  3: 4, // Wed
  4: 4, // Thu
  5: 5, // Fri
  6: 5, // Sat
  0: 5, // Sun
};

// ── flavor pools (theme-invariant content; the day's cast is a seeded slice) ──
const SUSPECTS = [
  "Miss Marisol",
  "Colonel Ashcroft",
  "Dr. Pemberton",
  "Lady Voss",
  "Mr. Calloway",
  "Sister Agnes",
  "Baron Reyes",
  "Professor Lark",
  "Madame Cerise",
  "Captain Doyle",
  "Vicar Holt",
  "Countess Mirela",
];

const LOCATIONS = [
  "the Library",
  "the Conservatory",
  "the Wine Cellar",
  "the Billiard Room",
  "the Ballroom",
  "the Observatory",
  "the Study",
  "the Gallery",
  "the Boathouse",
  "the Orangery",
];

// Ordered clock — the day's window is a consecutive slice so "before/after" reads
// chronologically. Kept coarse (hourly) so the ordering is unambiguous.
const CLOCK = ["7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "midnight", "1 AM"];

const CASE_ADJ = [
  "Gilded",
  "Silent",
  "Crimson",
  "Vanishing",
  "Whispering",
  "Shattered",
  "Midnight",
  "Forgotten",
  "Velvet",
  "Bitter",
];
const CASE_NOUN = [
  "Locket",
  "Candelabra",
  "Portrait",
  "Cipher",
  "Waltz",
  "Decanter",
  "Signet",
  "Requiem",
  "Bequest",
  "Alibi",
];

// ── clue semantics ───────────────────────────────────────────────────────────
/** Does the guilty triple (s,r,h) satisfy this clue's constraint? */
export function clueHolds(cl: MysteryClue, s: number, r: number, h: number): boolean {
  switch (cl.kind) {
    case "clear-suspect":
      return s !== cl.s;
    case "clear-room":
      return r !== cl.r;
    case "clear-time":
      return h !== cl.h;
    case "after":
      return h > (cl.h as number);
    case "before":
      return h < (cl.h as number);
    case "room-sealed":
      // if the scene is that room, it can't have happened before it was unsealed
      return !(r === cl.r && h < (cl.h as number));
    case "arrived":
      // if that suspect is guilty, they weren't present before they arrived
      return !(s === cl.s && h < (cl.h as number));
    case "never-in":
      return !(s === cl.s && r === cl.r);
  }
}

/** Exhaustive count of triples consistent with EVERY clue (candidate space N³). */
export function solutionCount(clues: MysteryClue[], n: number): number {
  let count = 0;
  for (let s = 0; s < n; s++)
    for (let r = 0; r < n; r++)
      for (let h = 0; h < n; h++)
        if (clues.every((cl) => clueHolds(cl, s, r, h))) count++;
  return count;
}

/** The unique surviving triple, or null if the clues are ambiguous/contradictory. */
export function uniqueSolution(clues: MysteryClue[], n: number): MysteryTriple | null {
  let found: MysteryTriple | null = null;
  for (let s = 0; s < n; s++)
    for (let r = 0; r < n; r++)
      for (let h = 0; h < n; h++)
        if (clues.every((cl) => clueHolds(cl, s, r, h))) {
          if (found) return null; // ≥2 solutions
          found = { suspect: s, location: r, time: h };
        }
  return found;
}

/** Which axis-values still appear in at least one clue-consistent triple. A value
 *  the surviving triples never use is provably eliminated — the pure-elimination
 *  reasoning the room's "Cleared" pill tracks. */
export function liveValues(
  clues: MysteryClue[],
  n: number,
): { suspects: boolean[]; locations: boolean[]; times: boolean[] } {
  const suspects = Array<boolean>(n).fill(false);
  const locations = Array<boolean>(n).fill(false);
  const times = Array<boolean>(n).fill(false);
  for (let s = 0; s < n; s++)
    for (let r = 0; r < n; r++)
      for (let h = 0; h < n; h++)
        if (clues.every((cl) => clueHolds(cl, s, r, h))) {
          suspects[s] = true;
          locations[r] = true;
          times[h] = true;
        }
  return { suspects, locations, times };
}

// ── clue search/filter (E6 · Case File panel) ───────────────────────────────
export type ClueFilter = "all" | "suspects" | "locations" | "times";

/** Does this clue pass the Case File's search text + axis filter? Pure so the
 *  UI logic is unit-testable outside the component. */
export function clueMatches(clue: MysteryClue, search: string, filter: ClueFilter): boolean {
  if (filter === "suspects" && clue.s === undefined) return false;
  if (filter === "locations" && clue.r === undefined) return false;
  if (filter === "times" && clue.h === undefined) return false;
  const q = search.trim().toLowerCase();
  return !q || clue.text.toLowerCase().includes(q);
}

// ── clue text ────────────────────────────────────────────────────────────────
function renderClue(
  cl: Omit<MysteryClue, "text">,
  suspects: string[],
  locations: string[],
  times: string[],
): string {
  const S = (i?: number) => suspects[i as number];
  const R = (i?: number) => locations[i as number];
  const T = (i?: number) => times[i as number];
  switch (cl.kind) {
    case "clear-suspect":
      return `${S(cl.s)} has an unshakeable alibi and is cleared.`;
    case "clear-room":
      return `Forensics find no trace of the struggle in ${R(cl.r)}.`;
    case "clear-time":
      return `The coroner is certain the blow did not fall at ${T(cl.h)}.`;
    case "after":
      return `The victim was seen alive at ${T(cl.h)}, so the murder came later.`;
    case "before":
      return `By ${T(cl.h)} the body was already cold — the deed was done earlier.`;
    case "room-sealed":
      return `${cap(R(cl.r))} was locked until ${T(cl.h)}; any murder there could only have happened at ${T(cl.h)} or after.`;
    case "arrived":
      return `${S(cl.s)} did not arrive until ${T(cl.h)}; were they guilty, the deed was no earlier than that.`;
    case "never-in":
      return `${S(cl.s)} was never once seen in ${R(cl.r)} all evening.`;
  }
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ── generation ───────────────────────────────────────────────────────────────
// Removal priority — attempt to drop the "boring" single-axis exclusions first,
// so the minimal surviving set favours the interlocking cross-axis relations.
const PRUNE_PRIORITY: Record<ClueKind, number> = {
  "clear-suspect": 0,
  "clear-room": 0,
  "clear-time": 0,
  after: 1,
  before: 1,
  "room-sealed": 2,
  arrived: 2,
  "never-in": 3,
};
// Presentation order — lead with brackets/relations, exclusions last.
const DISPLAY_ORDER: Record<ClueKind, number> = {
  after: 0,
  before: 0,
  "room-sealed": 1,
  arrived: 2,
  "never-in": 3,
  "clear-suspect": 4,
  "clear-room": 4,
  "clear-time": 4,
};

/** Every TRUE elimination fact about this solution — the pool the prune trims. */
function candidatePool(sol: MysteryTriple, n: number): Omit<MysteryClue, "text">[] {
  const { suspect: sc, location: rc, time: hc } = sol;
  const pool: Omit<MysteryClue, "text">[] = [];

  // single-axis exclusions (every innocent value)
  for (let s = 0; s < n; s++) if (s !== sc) pool.push({ kind: "clear-suspect", s });
  for (let r = 0; r < n; r++) if (r !== rc) pool.push({ kind: "clear-room", r });
  for (let h = 0; h < n; h++) if (h !== hc) pool.push({ kind: "clear-time", h });

  // time brackets around the true hour
  for (let h = 0; h < hc; h++) pool.push({ kind: "after", h });
  for (let h = hc + 1; h < n; h++) pool.push({ kind: "before", h });

  // room ↔ time: "sealed until h" (true unless it would exonerate the real scene)
  for (let r = 0; r < n; r++)
    for (let h = 1; h < n; h++)
      if (!(r === rc && hc < h)) pool.push({ kind: "room-sealed", r, h });

  // suspect ↔ time: "arrived at h" (true unless it would exonerate the culprit)
  for (let s = 0; s < n; s++)
    for (let h = 1; h < n; h++)
      if (!(s === sc && hc < h)) pool.push({ kind: "arrived", s, h });

  // suspect ↔ room: "never in r" (true for any pair that isn't culprit+scene)
  for (let s = 0; s < n; s++)
    for (let r = 0; r < n; r++)
      if (!(s === sc && r === rc)) pool.push({ kind: "never-in", s, r });

  return pool;
}

/**
 * Deterministic daily case for `dayIndex` (+ its YYYY-MM-DD string). Pure: same
 * inputs → byte-identical puzzle. Signature matches the F6 engine contract.
 */
export function generateMystery(dayIndex: number, date: string): MysteryPuzzle {
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();
  const n = WEEKDAY_N[weekday];
  const seed = (dayIndex ^ 0x4d59) >>> 0;
  const rand = mulberry32(seed);

  const suspects = shuffled(SUSPECTS, rand).slice(0, n);
  const locations = shuffled(LOCATIONS, rand).slice(0, n);
  // consecutive clock window so before/after stays chronological
  const start = Math.floor(rand() * (CLOCK.length - n + 1));
  const times = CLOCK.slice(start, start + n);

  const caseName = `The ${pick(CASE_ADJ, rand)} ${pick(CASE_NOUN, rand)}`;

  const solution: MysteryTriple = {
    suspect: Math.floor(rand() * n),
    location: Math.floor(rand() * n),
    time: Math.floor(rand() * n),
  };

  // Subtraction Method: the full pool pins the solution (every innocent value is
  // excluded), then drop any clue whose removal keeps the solution unique. Prune
  // the dull exclusions first so relations survive.
  const withText = (c: Omit<MysteryClue, "text">): MysteryClue => ({
    ...c,
    text: renderClue(c, suspects, locations, times),
  });
  const ordered = shuffled(candidatePool(solution, n), rand)
    .map(withText)
    .sort((a, b) => PRUNE_PRIORITY[a.kind] - PRUNE_PRIORITY[b.kind]);

  let kept = ordered;
  for (const c of ordered) {
    const trial = kept.filter((x) => x !== c);
    if (solutionCount(trial, n) === 1) kept = trial;
  }

  const clues = [...kept].sort((a, b) => DISPLAY_ORDER[a.kind] - DISPLAY_ORDER[b.kind]);

  return { date, weekday, caseName, seed, suspects, locations, times, clues, solution };
}

const pick = <T>(arr: readonly T[], rand: () => number): T =>
  arr[Math.floor(rand() * arr.length)];
