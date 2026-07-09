// CHRONOS — the gear-train ratio lock (G3). A ground-up rebuild of THE CLOCK as a
// 3D clockwork puzzle (rendered by F1's ThreeStage). The mechanism is a serial
// gear TRAIN of S shafts: shaft 1 sits nearest the mainspring barrel, shaft S
// carries the dial hand. Each shaft takes ONE brass wheel from the tray; a wheel's
// TOOTH COUNT steps the running index forward, and every shaft carries an engraved
// TARGET NOTCH the running index must land on. The lock opens only when the wheels
// are arranged so every shaft's index rests on its notch at once.
//
// The maths are EXACT integers (no floating point → a trustworthy uniqueness proof).
// Running index at shaft i = (drive + Σ_{j≤i} teeth(wheel at j)) mod dialTeeth. The
// generator draws wheels with DISTINCT tooth-residues mod dialTeeth, so each shaft's
// required step (target_i − target_{i-1}) pins down exactly one wheel → exactly one
// legal arrangement. `solveChronos` confirms this by brute-forcing every permutation
// (S ≤ 5 ⇒ ≤120 perms — instant, obviously correct). It reads ONLY tooth counts +
// notch targets; never the trivia.
//
// Trivia is a SHORTCUT, never a requirement: each wheel is stamped with a founding
// year and the train assembles oldest-first (nearest the barrel), so a chronology
// buff reads the order straight off the engravings. The notches alone already force
// the unique arrangement — the solver never looks at a year.
//
// Deterministic: same (dayIndex,date) ⇒ same mechanism for everyone (SSR/client
// agree, see lib/rng.ts). Solution baked in; NO solve-time RNG anywhere.

import { mulberry32, shuffled } from "./rng";
import { pickCalendar, type CalendarSystem } from "./calendars";

// ── shapes ────────────────────────────────────────────────────────────────────

export interface ChronosGear {
  key: string; // stable id, also the solution key
  label: string; // "The Fusée"
  glyph: string; // decorative brass glyph
  teeth: number; // tooth count — steps the running index by (teeth mod dialTeeth)
  /** trivia shortcut: the year this wheel was cast. The train assembles oldest-first
   *  (nearest the barrel), so ordering these years yields the shaft order. Never read
   *  by the solver — purely an optional accelerant. */
  cast: number;
}

export interface ChronosShaft {
  index: number; // 1..S — 1 is nearest the mainspring barrel, S carries the hand
  target: number; // engraved notch: the running index (0..dialTeeth-1) this shaft must show
}

export interface ChronosPuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  mechanism: string; // flavor name (table column: mechanism)
  seed: number;
  /** ancient/rotating calendar skin that restyles the dial (reuses calendars.ts). */
  calendarSkin: CalendarSystem;
  dialTeeth: number; // D — divisions on every dial ring (also the tooth modulus)
  drive: number; // barrel's starting index offset (0..D-1) — fixed part of the mechanism
  shafts: ChronosShaft[]; // length S, engraved notch per shaft
  gears: ChronosGear[]; // the tray: exactly S wheels, one per shaft
  /** solution[gearKey] = shaft index 1..S. Baked so the client validates offline. */
  solution: Record<string, number>;
  /** trivia flavor only — the year the assembled dial hand reads. */
  dialYear: number;
  provenance: string;
  /** one-line optional-shortcut prompt shown behind the "cheat with history" flap. */
  triviaHint: string;
}

// ── the solver (TRIVIA-BLIND) ───────────────────────────────────────────────────
//
// Brute force over every permutation of wheels → shafts. S is tiny (≤5, ≤120 perms)
// so this is instant and obviously correct — exactly what a uniqueness guarantee
// wants. Reads ONLY tooth counts, the notch targets, `drive` and `dialTeeth`; never
// the `cast` years or any other trivia.

function permutations(n: number): number[][] {
  const out: number[][] = [];
  const used = new Array(n).fill(false);
  const cur: number[] = [];
  const rec = () => {
    if (cur.length === n) {
      out.push(cur.slice());
      return;
    }
    for (let s = 0; s < n; s++) {
      if (used[s]) continue;
      used[s] = true;
      cur.push(s);
      rec();
      cur.pop();
      used[s] = false;
    }
  };
  rec();
  return out;
}

/** Running index at each shaft for a given wheel-per-shaft arrangement (shaft order). */
export function runningMarks(
  teethByShaft: number[],
  drive: number,
  dialTeeth: number,
): number[] {
  const marks: number[] = [];
  let acc = ((drive % dialTeeth) + dialTeeth) % dialTeeth;
  for (const t of teethByShaft) {
    acc = (acc + (((t % dialTeeth) + dialTeeth) % dialTeeth)) % dialTeeth;
    marks.push(acc);
  }
  return marks;
}

/**
 * Every arrangement consistent with the engraved notches, capped at `cap` (default 2
 * — all we need to prove uniqueness). Each result maps gearKey → shaft index 1..S.
 * TRIVIA-BLIND: reads only tooth counts + shaft targets + drive + dialTeeth.
 */
export function solveChronos(
  gears: Pick<ChronosGear, "key" | "teeth">[],
  shafts: Pick<ChronosShaft, "index" | "target">[],
  drive: number,
  dialTeeth: number,
  cap = 2,
): Record<string, number>[] {
  const order = [...shafts].sort((a, b) => a.index - b.index);
  const targets = order.map((s) => s.target);
  const sols: Record<string, number>[] = [];
  for (const perm of permutations(gears.length)) {
    // perm[position] = index into `gears` for the wheel seated at shaft order[position]
    const teethByShaft = perm.map((gi) => gears[gi].teeth);
    const marks = runningMarks(teethByShaft, drive, dialTeeth);
    if (marks.every((m, i) => m === targets[i])) {
      const stageOf: Record<string, number> = {};
      perm.forEach((gi, pos) => (stageOf[gears[gi].key] = order[pos].index));
      sols.push(stageOf);
      if (sols.length >= cap) break;
    }
  }
  return sols;
}

// ── content ─────────────────────────────────────────────────────────────────────

// A pool of horological wheels; the day draws S of them into its train.
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

// ── generation ──────────────────────────────────────────────────────────────────

const DIAL_TEETH = 12; // clock-face divisions; also the tooth modulus

export function generateChronos(dayIndex: number, date: string): ChronosPuzzle {
  const seed = (dayIndex ^ 0x3c07) >>> 0;
  const rand = mulberry32(seed);
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();

  // weekend trains run one shaft longer (a touch harder, per the daily-twist mandate)
  const stages = weekday === 0 || weekday === 5 || weekday === 6 ? 5 : 4;
  const dialTeeth = DIAL_TEETH;

  const chosen = shuffled(GEAR_POOL, rand).slice(0, stages);

  // DISTINCT tooth-residues mod dialTeeth (1..D-1) — this is what forces uniqueness:
  // each shaft's required step maps to exactly one wheel. Real tooth counts hide the
  // residue behind a plausible clock-wheel size (residue + a multiple of the modulus,
  // which leaves the residue — and therefore the maths — unchanged).
  const residues = shuffled(
    Array.from({ length: dialTeeth - 1 }, (_, i) => i + 1),
    rand,
  ).slice(0, stages);
  const gearsBase = chosen.map((g, i) => ({
    ...g,
    teeth: residues[i] + dialTeeth * (2 + Math.floor(rand() * 3)), // 25..47
  }));

  // baked arrangement: wheel → shaft (a random permutation of stages)
  const order = shuffled(
    Array.from({ length: stages }, (_, i) => i + 1),
    rand,
  );
  const solution: Record<string, number> = {};
  gearsBase.forEach((g, i) => (solution[g.key] = order[i]));
  const gearAtShaft = (s: number) => gearsBase.find((g) => solution[g.key] === s)!;

  const drive = Math.floor(rand() * dialTeeth);

  // engraved notches = the running index the true arrangement produces at each shaft
  const shafts: ChronosShaft[] = [];
  let acc = drive;
  for (let s = 1; s <= stages; s++) {
    acc = (acc + (gearAtShaft(s).teeth % dialTeeth)) % dialTeeth;
    shafts.push({ index: s, target: acc });
  }

  // trivia layer (SHORTCUT ONLY): cast years increase with distance from the barrel;
  // the dial hand reads the youngest wheel's year.
  const baseEra = 1650 + Math.floor(rand() * 250); // 1650..1899
  const step = 12 + Math.floor(rand() * 20); // 12..31 years between wheels
  const gears: ChronosGear[] = gearsBase.map((g) => ({
    ...g,
    cast: baseEra + (solution[g.key] - 1) * step,
  }));
  const dialYear = baseEra + (stages - 1) * step;

  const mechanism = MECHANISMS[Math.floor(rand() * MECHANISMS.length)];
  const calendarSkin = pickCalendar(dayIndex);
  const provenance = `${mechanism}, re-cased through ${stages} generations of the Order's horologists.`;
  const triviaHint =
    "Each wheel is stamped with the year it was cast — the train assembles oldest-first, nearest the barrel.";

  return {
    date,
    weekday,
    mechanism,
    seed,
    calendarSkin,
    dialTeeth,
    drive,
    shafts,
    gears,
    solution,
    dialYear,
    provenance,
    triviaHint,
  };
}
