// CHRONOS — the clockwork logic box (G3). A ground-up rebuild of THE CLOCK into
// a self-contained ordering puzzle: a horological gear TRAIN must be assembled
// in the one correct order. Each wheel occupies a distinct STAGE (1 = nearest
// the mainspring … N = the dial). Engraved on the backplate are CONSTRAINTS that
// pin the train down to exactly one legal assembly — reachable by pure reasoning.
//
// Trivia is a SHORTCUT, never a requirement: each wheel bears a founding year,
// and the train is assembled oldest-first, so a chronology buff can read the
// order straight off the engravings. But the constraints alone already force the
// unique solution — see `solveChronos`, which never looks at the trivia. The
// test drives that solver on the constraints only and reaches the baked answer.
//
// Deterministic: same (dayIndex,date) ⇒ same box for everyone (SSR/client agree,
// see lib/rng.ts). Solution baked in; NO solve-time RNG anywhere.

import { mulberry32, shuffled } from "./rng";
import { pickCalendar, type CalendarSystem } from "./calendars";

// ── shapes ────────────────────────────────────────────────────────────────────

export interface ChronosGear {
  key: string; // stable id, also the solution/constraint key
  label: string; // "The Fusée"
  glyph: string; // decorative brass glyph
  /** trivia shortcut: the year this wheel was cast. The train assembles
   *  oldest-first, so ordering these years yields the stage order. Never read by
   *  the solver — purely an optional accelerant. */
  cast: number;
}

export type ConstraintKind =
  | "first"
  | "last"
  | "fixed"
  | "before"
  | "imm-before"
  | "gap"
  | "adjacent"
  | "parity";

export interface ChronosConstraint {
  kind: ConstraintKind;
  /** engraved rule, phrased for the player */
  text: string;
  a: string; // gear key
  b?: string; // gear key (relational kinds)
  k?: number; // stage (fixed) / gap distance
  flag?: "even" | "odd"; // parity
}

export interface ChronosPuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  mechanism: string; // flavor name (table column: mechanism)
  seed: number;
  /** ancient/rotating calendar skin that restyles the dial (reuses calendars.ts). */
  calendarSkin: CalendarSystem;
  stages: number; // N — length of the train
  gears: ChronosGear[]; // length N (train order is the puzzle)
  constraints: ChronosConstraint[]; // minimal, uniquely-solving set
  /** solution[gearKey] = stage 1..N. Baked so the client validates offline. */
  solution: Record<string, number>;
  /** trivia flavor only — the dial the assembled train points to. */
  dialYear: number;
  provenance: string;
  /** one-line optional-shortcut prompt shown behind the "cheat with history" flap. */
  triviaHint: string;
}

// ── the solver (TRIVIA-BLIND) ───────────────────────────────────────────────────
//
// Pure ordering CSP over a permutation of stages 1..N. Brute force over every
// permutation — N is tiny (≤6, ≤720 perms) so this is instant and obviously
// correct, which is exactly what a uniqueness guarantee wants. Reads ONLY the
// constraints + gear keys; never the `cast` years or any trivia.

function permutations(n: number): number[][] {
  const out: number[][] = [];
  const used = new Array(n).fill(false);
  const cur: number[] = [];
  const rec = () => {
    if (cur.length === n) {
      out.push(cur.slice());
      return;
    }
    for (let s = 1; s <= n; s++) {
      if (used[s - 1]) continue;
      used[s - 1] = true;
      cur.push(s);
      rec();
      cur.pop();
      used[s - 1] = false;
    }
  };
  rec();
  return out;
}

function satisfies(
  stageOf: Record<string, number>,
  c: ChronosConstraint,
  stages: number,
): boolean {
  const a = stageOf[c.a];
  const b = c.b !== undefined ? stageOf[c.b] : undefined;
  switch (c.kind) {
    case "first":
      return a === 1;
    case "last":
      return a === stages;
    case "fixed":
      return a === c.k;
    case "before":
      return b !== undefined && a < b;
    case "imm-before":
      return b !== undefined && b === a + 1;
    case "gap":
      return b !== undefined && b - a === (c.k ?? 0);
    case "adjacent":
      return b !== undefined && Math.abs(a - b) === 1;
    case "parity":
      return c.flag === "even" ? a % 2 === 0 : a % 2 === 1;
    default:
      return false;
  }
}

/**
 * Every assembly consistent with `constraints`, capped at `cap` (default 2 — all
 * we need to prove uniqueness). Each result maps gearKey → stage. TRIVIA-BLIND:
 * reads only the gear keys and the constraints.
 */
export function solveChronos(
  gears: Pick<ChronosGear, "key">[],
  constraints: ChronosConstraint[],
  stages: number,
  cap = 2,
): Record<string, number>[] {
  const keys = gears.map((g) => g.key);
  const sols: Record<string, number>[] = [];
  for (const perm of permutations(stages)) {
    const stageOf: Record<string, number> = {};
    keys.forEach((k, i) => (stageOf[k] = perm[i]));
    if (constraints.every((c) => satisfies(stageOf, c, stages))) {
      sols.push(stageOf);
      if (sols.length >= cap) break;
    }
  }
  return sols;
}

// ── content ─────────────────────────────────────────────────────────────────────

// A pool of horological wheels; the day draws N of them into its train.
const GEAR_POOL: { key: string; label: string; glyph: string }[] = [
  { key: "mainspring", label: "The Mainspring Barrel", glyph: "◉" },
  { key: "fusee", label: "The Fusée", glyph: "◔" },
  { key: "great", label: "The Great Wheel", glyph: "✷" },
  { key: "centre", label: "The Centre Wheel", glyph: "✦" },
  { key: "third", label: "The Third Wheel", glyph: "❋" },
  { key: "fourth", label: "The Fourth Wheel", glyph: "✳" },
  { key: "escape", label: "The Escape Wheel", glyph: "⚙" },
  { key: "balance", label: "The Balance Wheel", glyph: "◍" },
  { key: "pallet", label: "The Pallet Fork", glyph: "⋔" },
];

const MECHANISMS = [
  "The Antikythera Regulator",
  "The Prague Orloj Train",
  "The Su Song Celestial Clock",
  "The Marine Chronometer H4",
  "The Verge-and-Foliot Tower",
  "The Tourbillon Escapement",
  "The Water-Clock Karakuri",
  "The Grand Complication",
];

const ORDINAL = ["", "first", "second", "third", "fourth", "fifth", "sixth"];

// ── generation ──────────────────────────────────────────────────────────────────

export function generateChronos(dayIndex: number, date: string): ChronosPuzzle {
  const seed = (dayIndex ^ 0x3c07) >>> 0;
  const rand = mulberry32(seed);
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();

  // weekend days run one stage longer (a touch harder, per the daily-twist mandate)
  const stages = weekday === 0 || weekday === 5 || weekday === 6 ? 5 : 4;

  const gears = shuffled(GEAR_POOL, rand).slice(0, stages);
  const keys = gears.map((g) => g.key);

  // baked solution: a random assembly order (permutation of stages)
  const order = shuffled(
    Array.from({ length: stages }, (_, i) => i + 1),
    rand,
  );
  const solution: Record<string, number> = {};
  keys.forEach((k, i) => (solution[k] = order[i]));
  const gearAt = (stage: number) => keys.find((k) => solution[k] === stage)!;
  const label = (k: string) => gears.find((g) => g.key === k)!.label;

  // Enumerate every constraint TRUE of the baked solution, then subtract down to
  // a minimal set that still forces a single assembly (same discipline as the
  // séance engine).
  const candidates: ChronosConstraint[] = [];
  const s = solution;

  candidates.push({
    kind: "first",
    a: gearAt(1),
    text: `${label(gearAt(1))} sits nearest the mainspring — the first wheel of the train.`,
  });
  candidates.push({
    kind: "last",
    a: gearAt(stages),
    text: `${label(gearAt(stages))} drives the dial — the last wheel of the train.`,
  });

  for (let st = 2; st < stages; st++) {
    candidates.push({
      kind: "fixed",
      a: gearAt(st),
      k: st,
      text: `${label(gearAt(st))} turns at the ${ORDINAL[st]} stage.`,
    });
  }

  for (let i = 0; i < keys.length; i++) {
    for (let j = 0; j < keys.length; j++) {
      if (i === j) continue;
      const ki = keys[i];
      const kj = keys[j];
      const si = s[ki];
      const sj = s[kj];
      if (si < sj) {
        candidates.push({
          kind: "before",
          a: ki,
          b: kj,
          text: `${label(ki)} turns somewhere before ${label(kj)}.`,
        });
      }
      if (sj === si + 1) {
        candidates.push({
          kind: "imm-before",
          a: ki,
          b: kj,
          text: `${label(ki)} meshes directly into ${label(kj)}.`,
        });
      }
      if (sj - si >= 2) {
        candidates.push({
          kind: "gap",
          a: ki,
          b: kj,
          k: sj - si,
          text: `${label(kj)} lies ${sj - si} stages down-train from ${label(ki)}.`,
        });
      }
      if (i < j && Math.abs(si - sj) === 1) {
        candidates.push({
          kind: "adjacent",
          a: ki,
          b: kj,
          text: `${label(ki)} and ${label(kj)} are neighbours in the train.`,
        });
      }
    }
  }

  for (const k of keys) {
    const even = s[k] % 2 === 0;
    candidates.push({
      kind: "parity",
      a: k,
      flag: even ? "even" : "odd",
      text: `${label(k)} occupies an ${even ? "even" : "odd"}-numbered stage.`,
    });
  }

  // Prune priority: drop the strongest/most-revealing kinds first so the minimal
  // survivor set leans on deduction rather than one give-away.
  const PRUNE: Record<ConstraintKind, number> = {
    fixed: 0,
    first: 1,
    last: 1,
    "imm-before": 2,
    gap: 3,
    adjacent: 4,
    before: 5,
    parity: 6,
  };

  let clues = shuffled(candidates, rand).sort(
    (a, b) => PRUNE[a.kind] - PRUNE[b.kind],
  );
  const gearKeys = gears.map((g) => ({ key: g.key }));
  for (const cand of [...clues]) {
    const trial = clues.filter((c) => c !== cand);
    if (solveChronos(gearKeys, trial, stages, 2).length === 1) {
      clues = trial;
    }
  }
  // present interesting/absolute clues first for readability
  clues = [...clues].sort((a, b) => PRUNE[b.kind] - PRUNE[a.kind]);

  // trivia layer (SHORTCUT ONLY) — cast years increase with distance from the
  // mainspring; the dial points to the youngest wheel's year.
  const baseEra = 1650 + Math.floor(rand() * 250); // 1650..1899
  const step = 12 + Math.floor(rand() * 20); // 12..31 years between wheels
  const gearsWithCast: ChronosGear[] = gears.map((g) => ({
    ...g,
    cast: baseEra + (solution[g.key] - 1) * step,
  }));
  const dialYear = baseEra + (stages - 1) * step;
  const mechanism = MECHANISMS[Math.floor(rand() * MECHANISMS.length)];
  const calendarSkin = pickCalendar(dayIndex);
  const provenance = `${mechanism}, re-cased through ${stages} generations of the Order's horologists.`;
  const triviaHint =
    "Each wheel is stamped with the year it was cast — the train assembles oldest-first, nearest the mainspring.";

  return {
    date,
    weekday,
    mechanism,
    seed,
    calendarSkin,
    stages,
    gears: gearsWithCast,
    constraints: clues,
    solution,
    dialYear,
    provenance,
    triviaHint,
  };
}
