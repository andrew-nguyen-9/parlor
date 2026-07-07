// ─────────────────────────────────────────────────────────────
// CLIMB OF THE INITIATE — daily logic-puzzle LIBRARY (G8 revamp).
//
// De-Queens'd. The ascent is now a small stack of genuine deduction grids drawn
// from a library of DISTINCT logic-puzzle families, each proven to have a UNIQUE
// solution by a dedicated solver (no solve-time RNG — generators use the seeded
// PRNG, solvers are pure enumeration). The daily pull rotates which families a
// climb uses by date-seed, and rungs escalate 5×5 → 8×8.
//
// Families (all Latin-square / binary, none a Queens clone):
//   skyscrapers : Latin square (1..n) read via edge "visible skyline" clues
//   futoshiki   : Latin square constrained by < / > relations between neighbours
//   binairo     : balanced binary grid (Takuzu) — no 3-in-a-row, all lines unique
//
// Pure + deterministic: generated once server-side (scripts/generate-ladder.ts)
// and archived to Neon (`ladder_puzzles`, flexible jsonb payload). The browser
// only renders + validates against the archived `solution`.
// ─────────────────────────────────────────────────────────────
import { mulberry32, shuffled } from "./rng";
import { TRICKSTERS, LADDER_WEEKS } from "./ladderFlavor";

export type PuzzleKind = "skyscrapers" | "futoshiki" | "binairo";

export interface BaseRung {
  kind: PuzzleKind;
  n: number;
  modifier: string; // trickster name hosting this rung
  whisper: string; // trickster line
  resonance: number; // GCM value entering this rung (flavor, shown)
}

// Grids are number[][] (row-major). Empty cell = -1.

export interface SkyscrapersRung extends BaseRung {
  kind: "skyscrapers";
  // Edge clues: number of skyscrapers visible looking along that line; 0 = hidden.
  top: number[]; // per column, viewed top→bottom
  bottom: number[]; // per column, viewed bottom→top
  left: number[]; // per row, viewed left→right
  right: number[]; // per row, viewed right→left
  givens: number[][]; // n×n, -1 empty, else 1..n pre-placed
  solution: number[][]; // n×n, 1..n
}

export interface FutoshikiRung extends BaseRung {
  kind: "futoshiki";
  givens: number[][]; // n×n, -1 empty
  solution: number[][]; // n×n, 1..n
  // horizontal relations between (r,c) and (r,c+1): 1 ⇒ left<right, -1 ⇒ left>right, 0 none
  gh: number[][]; // n rows × (n-1)
  // vertical relations between (r,c) and (r+1,c): 1 ⇒ top<bottom, -1 ⇒ top>bottom, 0 none
  gv: number[][]; // (n-1) rows × n
}

export interface BinairoRung extends BaseRung {
  kind: "binairo";
  givens: number[][]; // n×n, -1 empty, else 0 | 1
  solution: number[][]; // n×n, 0 | 1
}

export type Rung = SkyscrapersRung | FutoshikiRung | BinairoRung;

export interface LadderPuzzle {
  date: string;
  weekday: number;
  rite: string;
  trickster: string; // the week's host
  framing: string;
  kinds: PuzzleKind[]; // the family used at each rung, in order
  rungs: Rung[];
  seed: number;
}

interface WeekdayConfig {
  rungs: number;
  sizes: number[]; // requested size per rung (clamped to each family's range)
  rite: string;
}

export const WEEKDAY: Record<number, WeekdayConfig> = {
  1: { rungs: 2, sizes: [5, 6], rite: "Stable Ascent" }, // Mon
  2: { rungs: 2, sizes: [6, 6], rite: "First Distortion" }, // Tue
  3: { rungs: 3, sizes: [5, 6, 7], rite: "Dual Logic" }, // Wed
  4: { rungs: 3, sizes: [6, 6, 8], rite: "Layer Shift" }, // Thu
  5: { rungs: 3, sizes: [6, 7, 8], rite: "Adversarial Logic" }, // Fri
  6: { rungs: 4, sizes: [5, 6, 7, 8], rite: "Ritual Instability" }, // Sat
  0: { rungs: 4, sizes: [6, 7, 8, 8], rite: "The Impossible Ascent" }, // Sun
};

const FAMILIES: PuzzleKind[] = ["skyscrapers", "futoshiki", "binairo"];

// Family → allowed grid sizes (skyscrapers kept small so the exhaustive
// uniqueness solver stays fast; binairo must be even).
const SIZE_RANGE: Record<PuzzleKind, number[]> = {
  skyscrapers: [5, 6],
  futoshiki: [5, 6],
  binairo: [6, 8],
};

function clampSize(kind: PuzzleKind, want: number): number {
  const allowed = SIZE_RANGE[kind];
  let best = allowed[0];
  let bestD = Infinity;
  for (const s of allowed) {
    const d = Math.abs(s - want);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

const KIND_HOST: Record<PuzzleKind, string> = {
  skyscrapers: "Prof. Marlow",
  futoshiki: "Dr. Chen",
  binairo: "Astrid Moon",
};

function hostOf(kind: PuzzleKind): { modifier: string; whisper: string } {
  const name = KIND_HOST[kind];
  const t = TRICKSTERS.find((x) => x.name === name) ?? TRICKSTERS[0];
  return { modifier: t.name, whisper: t.whisper };
}

// ─────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────

/** Visible count looking along a line (a taller building hides shorter ones behind). */
export function visible(line: number[]): number {
  let max = 0;
  let seen = 0;
  for (const v of line) {
    if (v > max) {
      max = v;
      seen++;
    }
  }
  return seen;
}

/** Build a random Latin square of order n (values 1..n), seeded + deterministic. */
function buildLatin(n: number, rand: () => number): number[][] {
  const g: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  function colHas(c: number, v: number, upto: number): boolean {
    for (let r = 0; r < upto; r++) if (g[r][c] === v) return true;
    return false;
  }
  function place(r: number, c: number): boolean {
    if (r === n) return true;
    const nr = c + 1 === n ? r + 1 : r;
    const nc = c + 1 === n ? 0 : c + 1;
    for (const v of shuffled([...Array(n).keys()].map((i) => i + 1), rand)) {
      if (g[r].includes(v)) continue;
      if (colHas(c, v, r)) continue;
      g[r][c] = v;
      if (place(nr, nc)) return true;
      g[r][c] = 0;
    }
    return false;
  }
  place(0, 0);
  return g;
}

/**
 * Generic Latin-square completion counter (columns + rows distinct), gated by
 * caller constraints. Counts solutions up to `cap`. Pure — no RNG.
 *   cellOk : local check when placing v at (r,c) (neighbours above/left filled)
 *   rowDone: check invoked when row r is fully filled
 *   gridDone: check invoked when the whole grid is filled
 */
function countLatin(
  n: number,
  givens: number[][],
  cellOk: (r: number, c: number, v: number, g: number[][]) => boolean,
  rowDone: (r: number, g: number[][]) => boolean,
  gridDone: (g: number[][]) => boolean,
  cap: number,
): number {
  const g: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  let count = 0;
  function colHas(c: number, v: number, upto: number): boolean {
    for (let r = 0; r < upto; r++) if (g[r][c] === v) return true;
    return false;
  }
  function rec(r: number, c: number): void {
    if (count >= cap) return;
    if (r === n) {
      if (gridDone(g)) count++;
      return;
    }
    const nr = c + 1 === n ? r + 1 : r;
    const nc = c + 1 === n ? 0 : c + 1;
    const fixed = givens[r][c];
    const cands = fixed >= 0 ? [fixed] : [...Array(n).keys()].map((i) => i + 1);
    for (const v of cands) {
      if (g[r].includes(v)) continue;
      if (colHas(c, v, r)) continue;
      if (!cellOk(r, c, v, g)) continue;
      g[r][c] = v;
      if (c + 1 === n) {
        if (rowDone(r, g)) rec(nr, nc);
      } else {
        rec(nr, nc);
      }
      g[r][c] = -1;
      if (count >= cap) return;
    }
  }
  rec(0, 0);
  return count;
}

// ─────────────────────────────────────────────────────────────
// SKYSCRAPERS
// ─────────────────────────────────────────────────────────────

/**
 * Count solutions of a skyscrapers rung consistent with its clues + givens.
 * Bespoke DFS with INCREMENTAL visibility pruning (partial left/top clues are
 * checked as each cell is placed), so even a sparse-clue board is proven unique
 * fast — no full Latin-square enumeration. Pure — no RNG.
 */
export function countSkyscrapers(
  n: number,
  clues: { top: number[]; bottom: number[]; left: number[]; right: number[] },
  givens: number[][],
  cap = 2,
): number {
  const g: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  const rowUsed: boolean[][] = Array.from({ length: n }, () => Array(n + 1).fill(false));
  const colUsed: boolean[][] = Array.from({ length: n }, () => Array(n + 1).fill(false));
  const rowMax = Array(n).fill(0);
  const rowVis = Array(n).fill(0);
  const colMax = Array(n).fill(0);
  const colVis = Array(n).fill(0);
  let count = 0;

  // A running visibility `vis` (with `max` already placed, `n` = order) can still
  // reach exactly `clue` iff clue is between vis and vis + (unseen values left).
  function reachable(vis: number, max: number, placed: number, clue: number): boolean {
    if (clue <= 0) return true;
    if (vis > clue) return false;
    const canStillAppear = max < n; // a taller building can still be revealed
    const remaining = n - placed;
    const maxFinal = vis + (canStillAppear ? remaining : 0);
    return clue <= maxFinal;
  }

  function rec(r: number, c: number): void {
    if (count >= cap) return;
    if (r === n) {
      count++;
      return;
    }
    const nr = c + 1 === n ? r + 1 : r;
    const nc = c + 1 === n ? 0 : c + 1;
    const fixed = givens[r][c];
    for (let v = 1; v <= n; v++) {
      if (fixed >= 0 && v !== fixed) continue;
      if (rowUsed[r][v] || colUsed[c][v]) continue;
      const nRowVis = v > rowMax[r] ? rowVis[r] + 1 : rowVis[r];
      const nRowMax = Math.max(rowMax[r], v);
      const nColVis = v > colMax[c] ? colVis[c] + 1 : colVis[c];
      const nColMax = Math.max(colMax[c], v);
      // partial-line feasibility (left/top)
      if (!reachable(nRowVis, nRowMax, c + 1, clues.left[r])) continue;
      if (!reachable(nColVis, nColMax, r + 1, clues.top[c])) continue;
      // exact checks once a line completes
      if (c + 1 === n) {
        if (clues.left[r] > 0 && nRowVis !== clues.left[r]) continue;
        if (clues.right[r] > 0) {
          const row = [...g[r]];
          row[c] = v;
          if (visible([...row].reverse()) !== clues.right[r]) continue;
        }
      }
      if (r + 1 === n) {
        if (clues.top[c] > 0 && nColVis !== clues.top[c]) continue;
        if (clues.bottom[c] > 0) {
          const col = g.map((row) => row[c]);
          col[r] = v;
          if (visible([...col].reverse()) !== clues.bottom[c]) continue;
        }
      }
      // place
      g[r][c] = v;
      rowUsed[r][v] = colUsed[c][v] = true;
      const sRowVis = rowVis[r], sRowMax = rowMax[r], sColVis = colVis[c], sColMax = colMax[c];
      rowVis[r] = nRowVis; rowMax[r] = nRowMax; colVis[c] = nColVis; colMax[c] = nColMax;
      rec(nr, nc);
      // undo
      g[r][c] = -1;
      rowUsed[r][v] = colUsed[c][v] = false;
      rowVis[r] = sRowVis; rowMax[r] = sRowMax; colVis[c] = sColVis; colMax[c] = sColMax;
      if (count >= cap) return;
    }
  }
  rec(0, 0);
  return count;
}

function makeSkyscrapers(n: number, rand: () => number, resonance: number): SkyscrapersRung {
  const solution = buildLatin(n, rand);
  const top = Array.from({ length: n }, (_, c) => visible(solution.map((r) => r[c])));
  const bottom = Array.from({ length: n }, (_, c) => visible(solution.map((r) => r[c]).reverse()));
  const left = Array.from({ length: n }, (_, r) => visible(solution[r]));
  const right = Array.from({ length: n }, (_, r) => visible([...solution[r]].reverse()));
  const clues = { top: [...top], bottom: [...bottom], left: [...left], right: [...right] };
  const givens: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));

  // Ensure uniqueness with full clues; reveal solution cells if needed.
  const cells = shuffled(
    Array.from({ length: n * n }, (_, i) => [Math.floor(i / n), i % n] as [number, number]),
    rand,
  );
  let ci = 0;
  while (countSkyscrapers(n, clues, givens) > 1 && ci < cells.length) {
    const [r, c] = cells[ci++];
    givens[r][c] = solution[r][c];
  }

  // Harden: hide as many edge clues as possible while the solution stays unique.
  type Slot = { side: "top" | "bottom" | "left" | "right"; i: number };
  const slots: Slot[] = [];
  for (let i = 0; i < n; i++) {
    slots.push({ side: "top", i }, { side: "bottom", i }, { side: "left", i }, { side: "right", i });
  }
  for (const s of shuffled(slots, rand)) {
    const saved = clues[s.side][s.i];
    if (saved === 0) continue;
    clues[s.side][s.i] = 0;
    if (countSkyscrapers(n, clues, givens) !== 1) clues[s.side][s.i] = saved;
  }

  return {
    kind: "skyscrapers",
    n,
    ...hostOf("skyscrapers"),
    resonance,
    top: clues.top,
    bottom: clues.bottom,
    left: clues.left,
    right: clues.right,
    givens,
    solution,
  };
}

// ─────────────────────────────────────────────────────────────
// FUTOSHIKI
// ─────────────────────────────────────────────────────────────

/** Count solutions of a futoshiki rung consistent with relations + givens. */
export function countFutoshiki(
  n: number,
  gh: number[][],
  gv: number[][],
  givens: number[][],
  cap = 2,
): number {
  const cellOk = (r: number, c: number, v: number, g: number[][]) => {
    // relation with left neighbour (already placed)
    if (c > 0) {
      const rel = gh[r][c - 1];
      const l = g[r][c - 1];
      if (rel === 1 && !(l < v)) return false; // left < right
      if (rel === -1 && !(l > v)) return false; // left > right
    }
    // relation with top neighbour (already placed)
    if (r > 0) {
      const rel = gv[r - 1][c];
      const u = g[r - 1][c];
      if (rel === 1 && !(u < v)) return false; // top < bottom
      if (rel === -1 && !(u > v)) return false; // top > bottom
    }
    return true;
  };
  return countLatin(n, givens, cellOk, () => true, () => true, cap);
}

function makeFutoshiki(n: number, rand: () => number, resonance: number): FutoshikiRung {
  const solution = buildLatin(n, rand);
  // full relation maps from the solution
  const gh: number[][] = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n - 1 }, (_, c) => (solution[r][c] < solution[r][c + 1] ? 1 : -1)),
  );
  const gv: number[][] = Array.from({ length: n - 1 }, (_, r) =>
    Array.from({ length: n }, (_, c) => (solution[r][c] < solution[r + 1][c] ? 1 : -1)),
  );
  const givens: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));

  // With every relation present it is (essentially always) unique; guarantee it
  // by revealing cells if some pathological square isn't.
  const cells = shuffled(
    Array.from({ length: n * n }, (_, i) => [Math.floor(i / n), i % n] as [number, number]),
    rand,
  );
  let ci = 0;
  while (countFutoshiki(n, gh, gv, givens) > 1 && ci < cells.length) {
    const [r, c] = cells[ci++];
    givens[r][c] = solution[r][c];
  }

  // Harden: drop relations while the board stays unique (a sparser board is the
  // classic, harder futoshiki look). We keep every retained inequality tightly
  // bounding the DFS, and — crucially for generation speed — only ATTEMPT to
  // remove a bounded budget of relations, so the uniqueness proofs stay cheap.
  type Rel = { dir: "h" | "v"; r: number; c: number };
  const rels: Rel[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n - 1; c++) rels.push({ dir: "h", r, c });
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n; c++) rels.push({ dir: "v", r, c });
  let budget = Math.floor(rels.length / 3); // trim ~a third of the relations
  for (const rel of shuffled(rels, rand)) {
    if (budget <= 0) break;
    const grid = rel.dir === "h" ? gh : gv;
    const saved = grid[rel.r][rel.c];
    if (saved === 0) continue;
    grid[rel.r][rel.c] = 0;
    if (countFutoshiki(n, gh, gv, givens) !== 1) grid[rel.r][rel.c] = saved;
    else budget--;
  }

  // Now trim givens that are no longer needed.
  for (const [r, c] of shuffled(cells, rand)) {
    if (givens[r][c] < 0) continue;
    const saved = givens[r][c];
    givens[r][c] = -1;
    if (countFutoshiki(n, gh, gv, givens) !== 1) givens[r][c] = saved;
  }

  return {
    kind: "futoshiki",
    n,
    ...hostOf("futoshiki"),
    resonance,
    givens,
    solution,
    gh,
    gv,
  };
}

// ─────────────────────────────────────────────────────────────
// BINAIRO (Takuzu)
// ─────────────────────────────────────────────────────────────

function binairoRowOk(row: number[], n: number): boolean {
  // no 3 consecutive equal among filled cells
  for (let c = 2; c < row.length; c++) {
    if (row[c] !== -1 && row[c] === row[c - 1] && row[c] === row[c - 2]) return false;
  }
  const zeros = row.filter((v) => v === 0).length;
  const ones = row.filter((v) => v === 1).length;
  return zeros <= n / 2 && ones <= n / 2;
}

function linesEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Count solutions of a binairo rung consistent with its givens. Pure. */
export function countBinairo(n: number, givens: number[][], cap = 2): number {
  const g: number[][] = givens.map((row) => [...row]);
  let count = 0;
  function colOk(c: number, upto: number): boolean {
    let run = 1;
    let prev = -2;
    let zeros = 0;
    let ones = 0;
    for (let r = 0; r <= upto; r++) {
      const v = g[r][c];
      if (v === 0) zeros++;
      if (v === 1) ones++;
      if (v !== -1 && v === prev) run++;
      else run = 1;
      prev = v;
      if (v !== -1 && run >= 3) return false;
    }
    return zeros <= n / 2 && ones <= n / 2;
  }
  function rec(r: number, c: number): void {
    if (count >= cap) return;
    if (r === n) {
      count++;
      return;
    }
    const nr = c + 1 === n ? r + 1 : r;
    const nc = c + 1 === n ? 0 : c + 1;
    const fixed = givens[r][c];
    const cands = fixed >= 0 ? [fixed] : [0, 1];
    for (const v of cands) {
      g[r][c] = v;
      let ok = binairoRowOk(g[r], n) && colOk(c, r);
      if (ok && c + 1 === n) {
        // row complete → must differ from every earlier complete row
        for (let rr = 0; rr < r; rr++) {
          if (linesEqual(g[rr], g[r])) {
            ok = false;
            break;
          }
        }
      }
      if (ok && r + 1 === n && c + 1 === n) {
        // grid complete → all columns distinct
        for (let ca = 0; ca < n && ok; ca++) {
          const colA = g.map((row) => row[ca]);
          for (let cb = ca + 1; cb < n; cb++) {
            if (linesEqual(colA, g.map((row) => row[cb]))) {
              ok = false;
              break;
            }
          }
        }
      }
      if (ok) rec(nr, nc);
      if (fixed < 0) g[r][c] = -1;
      if (count >= cap) return;
    }
    if (fixed >= 0) g[r][c] = fixed;
  }
  rec(0, 0);
  return count;
}

function buildBinairo(n: number, rand: () => number): number[][] {
  const g: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  function colOk(c: number, upto: number): boolean {
    let run = 1;
    let prev = -2;
    let zeros = 0;
    let ones = 0;
    for (let r = 0; r <= upto; r++) {
      const v = g[r][c];
      if (v === 0) zeros++;
      if (v === 1) ones++;
      if (v === prev) run++;
      else run = 1;
      prev = v;
      if (run >= 3) return false;
    }
    return zeros <= n / 2 && ones <= n / 2;
  }
  function rec(r: number, c: number): boolean {
    if (r === n) return true;
    const nr = c + 1 === n ? r + 1 : r;
    const nc = c + 1 === n ? 0 : c + 1;
    for (const v of shuffled([0, 1], rand)) {
      g[r][c] = v;
      let ok = binairoRowOk(g[r], n) && colOk(c, r);
      if (ok && c + 1 === n) {
        for (let rr = 0; rr < r; rr++)
          if (linesEqual(g[rr], g[r])) {
            ok = false;
            break;
          }
      }
      if (ok && r + 1 === n && c + 1 === n) {
        for (let ca = 0; ca < n && ok; ca++) {
          const colA = g.map((row) => row[ca]);
          for (let cb = ca + 1; cb < n; cb++) {
            if (linesEqual(colA, g.map((row) => row[cb]))) {
              ok = false;
              break;
            }
          }
        }
      }
      if (ok && rec(nr, nc)) return true;
      g[r][c] = -1;
    }
    return false;
  }
  rec(0, 0);
  return g;
}

function makeBinairo(n: number, rand: () => number, resonance: number): BinairoRung {
  const solution = buildBinairo(n, rand);
  const givens: number[][] = solution.map((row) => [...row]);
  // Dig holes while the solution stays unique — the fewer givens the harder.
  const cells = shuffled(
    Array.from({ length: n * n }, (_, i) => [Math.floor(i / n), i % n] as [number, number]),
    rand,
  );
  for (const [r, c] of cells) {
    const saved = givens[r][c];
    givens[r][c] = -1;
    if (countBinairo(n, givens) !== 1) givens[r][c] = saved;
  }
  return {
    kind: "binairo",
    n,
    ...hostOf("binairo"),
    resonance,
    givens,
    solution,
  };
}

// ─────────────────────────────────────────────────────────────
// The daily climb
// ─────────────────────────────────────────────────────────────

function resonanceBump(rung: Rung): number {
  return rung.solution.flat().reduce((s, v) => s + (v >= 0 ? v : 0), 0);
}

function makeRung(kind: PuzzleKind, n: number, rand: () => number, resonance: number): Rung {
  if (kind === "skyscrapers") return makeSkyscrapers(n, rand, resonance);
  if (kind === "futoshiki") return makeFutoshiki(n, rand, resonance);
  return makeBinairo(n, rand, resonance);
}

/** Build the deterministic daily climb for `dayIndex` / `date`. Pure. */
export function generateLadder(dayIndex: number, date: string): LadderPuzzle {
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();
  const cfg = WEEKDAY[weekday];
  const seed = (dayIndex ^ 0x1adde7) >>> 0;
  const rand = mulberry32(seed);

  const framing = LADDER_WEEKS[Math.floor(dayIndex / 7) % LADDER_WEEKS.length];

  // Rotate which family leads today's climb; rungs then cycle the library so a
  // single day shows off several distinct mechanics, escalating in size.
  const start = ((dayIndex % FAMILIES.length) + FAMILIES.length) % FAMILIES.length;
  const kinds: PuzzleKind[] = [];
  for (let i = 0; i < cfg.rungs; i++) kinds.push(FAMILIES[(start + i) % FAMILIES.length]);

  let res = (seed % 9) + 1;
  const rungs: Rung[] = [];
  for (let i = 0; i < cfg.rungs; i++) {
    const kind = kinds[i];
    const n = clampSize(kind, cfg.sizes[i] ?? cfg.sizes[cfg.sizes.length - 1]);
    const rung = makeRung(kind, n, rand, res);
    rungs.push(rung);
    res = ((res + resonanceBump(rung)) % 12) + 1;
  }

  return {
    date,
    weekday,
    rite: cfg.rite,
    trickster: "Loki", // the Illusionist of the Order hosts the climb
    framing,
    kinds,
    rungs,
    seed,
  };
}
