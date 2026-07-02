// ─────────────────────────────────────────────────────────────
// THE SÉANCE — daily constraint-logic puzzle engine.
//
// A pure, deterministic CSP generator: given a dayIndex it produces exactly ONE
// uniquely-solvable logic grid (a single-anchor "zebra" puzzle). The expensive
// work — building the truth matrix, then the Subtraction Method (prune a clue,
// re-solve, keep only if still unique) — runs ONCE, server-side, in
// scripts/generate-seance.ts, and the result is archived to Neon. The browser
// never generates; it only renders a fetched SeancePuzzle. No RNG at solve time.
//
// Model: N "seats" (0..N-1, the ordered anchor axis) and K non-anchor categories
// (relic, sin, …), each a bijection assigning its N values to the N seats.
// Every clue reduces to a constraint on seat positions, so the solver reasons in
// one space. Difficulty scales by N and K (see WEEKDAY).
// ─────────────────────────────────────────────────────────────
import { mulberry32, hashKey, shuffled } from "./rng";
import { SPIRIT_PACKS } from "./seanceFlavor";

export type ClueType = "at" | "same" | "diff" | "order" | "neighbor";

/** A value: category index (0..K-1 over `categories`) + value index (0..N-1). */
export interface Ref {
  cat: number;
  val: number;
}

export interface Clue {
  type: ClueType;
  a: Ref;
  b?: Ref; // same | diff | order | neighbor
  seat?: number; // at (0-based)
  text: string; // themed rendering
}

export interface SeanceCategory {
  key: string;
  label: string;
  values: string[]; // length N
}

export interface SeancePuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  rite: string; // weekday label, e.g. "The Initiation"
  spirit: string; // weekly spirit name
  backstory: string;
  n: number; // grid dimension
  categories: SeanceCategory[]; // length K
  clues: Clue[];
  // solution[c][seat] = value index. Included so the client can validate the
  // board offline; ponytail: cheating a logic puzzle's own timer isn't a threat
  // worth a server round-trip per move. Upgrade to server-side check if it ever is.
  solution: number[][];
  seed: number;
  whisper: boolean; // whisper-mode scratchpad available (Fri–Sun)
}

interface WeekdayConfig {
  n: number;
  cats: number;
  rite: string;
  whisper: boolean;
}

// Mon intro → Sun exorcism. cats = non-anchor categories (sub-grids).
export const WEEKDAY: Record<number, WeekdayConfig> = {
  1: { n: 4, cats: 2, rite: "The Initiation", whisper: false }, // Mon
  2: { n: 4, cats: 2, rite: "First Contact", whisper: false }, // Tue
  3: { n: 5, cats: 3, rite: "The Deepening", whisper: false }, // Wed
  4: { n: 5, cats: 3, rite: "The Veil Thins", whisper: false }, // Thu
  5: { n: 6, cats: 3, rite: "The Haunting", whisper: true }, // Fri
  6: { n: 6, cats: 3, rite: "Restless Dead", whisper: true }, // Sat
  0: { n: 7, cats: 4, rite: "The Exorcism", whisper: true }, // Sun
};

// ── Solver ───────────────────────────────────────────────────
// Variables are value-positions: vid(c,v) = seat of value v in category c, with
// domain {0..N-1}. all-different per category + binary clue constraints. We only
// ever need to know "1 vs ≥2 solutions", so the count is capped at 2.

interface SolveConstraint {
  type: ClueType;
  x: number; // vid
  y?: number; // vid
  seat?: number;
}

const vid = (c: number, v: number, n: number) => c * n + v;

function cloneDomains(dom: boolean[][]): boolean[][] {
  return dom.map((d) => d.slice());
}

function domSeats(d: boolean[]): number[] {
  const out: number[] = [];
  for (let s = 0; s < d.length; s++) if (d[s]) out.push(s);
  return out;
}

/** Fixpoint constraint propagation. Returns false on contradiction. */
function propagate(
  dom: boolean[][],
  cons: SolveConstraint[],
  n: number,
  cats: number,
): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    // all-different within each category: a singleton seat is removed elsewhere.
    for (let c = 0; c < cats; c++) {
      for (let v = 0; v < n; v++) {
        const seats = domSeats(dom[vid(c, v, n)]);
        if (seats.length === 1) {
          const s = seats[0];
          for (let w = 0; w < n; w++) {
            if (w === v) continue;
            const id = vid(c, w, n);
            if (dom[id][s]) {
              dom[id][s] = false;
              changed = true;
            }
          }
        }
      }
      // hidden single: a seat reachable by only one value in the category.
      for (let s = 0; s < n; s++) {
        let only = -1;
        let cnt = 0;
        for (let v = 0; v < n; v++) {
          if (dom[vid(c, v, n)][s]) {
            cnt++;
            only = v;
          }
        }
        if (cnt === 0) return false;
        if (cnt === 1) {
          const id = vid(c, only, n);
          for (let s2 = 0; s2 < n; s2++) {
            if (s2 !== s && dom[id][s2]) {
              dom[id][s2] = false;
              changed = true;
            }
          }
        }
      }
    }

    for (const con of cons) {
      const dx = dom[con.x];
      if (con.type === "same" && con.y !== undefined) {
        const dy = dom[con.y];
        for (let s = 0; s < n; s++) {
          const both = dx[s] && dy[s];
          if (dx[s] !== both) {
            dx[s] = both;
            changed = true;
          }
          if (dy[s] !== both) {
            dy[s] = both;
            changed = true;
          }
        }
      } else if (con.type === "diff" && con.y !== undefined) {
        const dy = dom[con.y];
        const sx = domSeats(dx);
        const sy = domSeats(dy);
        if (sx.length === 1 && dy[sx[0]]) {
          dy[sx[0]] = false;
          changed = true;
        }
        if (sy.length === 1 && dx[sy[0]]) {
          dx[sy[0]] = false;
          changed = true;
        }
      } else if (con.type === "order" && con.y !== undefined) {
        // seat(x) < seat(y)
        const dy = dom[con.y];
        const maxY = Math.max(...domSeats(dy));
        const minX = Math.min(...domSeats(dx));
        for (let s = 0; s < n; s++) {
          if (dx[s] && s >= maxY) {
            dx[s] = false;
            changed = true;
          }
          if (dy[s] && s <= minX) {
            dy[s] = false;
            changed = true;
          }
        }
      } else if (con.type === "neighbor" && con.y !== undefined) {
        const dy = dom[con.y];
        for (let s = 0; s < n; s++) {
          if (dx[s] && !((s > 0 && dy[s - 1]) || (s < n - 1 && dy[s + 1]))) {
            dx[s] = false;
            changed = true;
          }
          if (dy[s] && !((s > 0 && dx[s - 1]) || (s < n - 1 && dx[s + 1]))) {
            dy[s] = false;
            changed = true;
          }
        }
      }
      if (domSeats(dx).length === 0) return false;
      if (con.y !== undefined && domSeats(dom[con.y]).length === 0) return false;
    }
  }
  return true;
}

/** Count solutions up to `cap` (default 2 — we only care about uniqueness). */
function countSolutions(
  dom: boolean[][],
  cons: SolveConstraint[],
  n: number,
  cats: number,
  cap = 2,
): number {
  if (!propagate(dom, cons, n, cats)) return 0;

  // pick the most-constrained unsolved variable
  let best = -1;
  let bestLen = Infinity;
  for (let id = 0; id < cats * n; id++) {
    const len = domSeats(dom[id]).length;
    if (len > 1 && len < bestLen) {
      bestLen = len;
      best = id;
    }
  }
  if (best === -1) return 1; // all singletons → one solution

  let total = 0;
  for (const s of domSeats(dom[best])) {
    const next = cloneDomains(dom);
    next[best] = next[best].map((_, i) => i === s);
    total += countSolutions(next, cons, n, cats, cap - total);
    if (total >= cap) return total;
  }
  return total;
}

function toSolveConstraints(clues: Clue[], n: number): SolveConstraint[] {
  return clues.map((cl) => ({
    type: cl.type,
    x: vid(cl.a.cat, cl.a.val, n),
    y: cl.b ? vid(cl.b.cat, cl.b.val, n) : undefined,
    seat: cl.seat,
  }));
}

function initDomains(
  clues: Clue[],
  n: number,
  cats: number,
): boolean[][] {
  const dom: boolean[][] = [];
  for (let i = 0; i < cats * n; i++) dom.push(Array(n).fill(true));
  for (const cl of clues) {
    if (cl.type === "at" && cl.seat !== undefined) {
      const id = vid(cl.a.cat, cl.a.val, n);
      dom[id] = dom[id].map((_, i) => i === cl.seat);
    }
  }
  return dom;
}

/** Public: how many solutions does this clue set admit (capped at 2)? */
export function solutionCount(
  clues: Clue[],
  n: number,
  cats: number,
): number {
  return countSolutions(
    initDomains(clues, n, cats),
    toSolveConstraints(clues, n),
    n,
    cats,
  );
}

// ── Clue text ────────────────────────────────────────────────
const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];

function renderClue(
  type: ClueType,
  a: Ref,
  b: Ref | undefined,
  seat: number | undefined,
  cats: SeanceCategory[],
): string {
  const name = (r: Ref) => cats[r.cat].values[r.val];
  switch (type) {
    case "at":
      return `${name(a)} took the ${ORDINALS[seat!]} seat at the table.`;
    case "same":
      return `${name(a)} and ${name(b!)} mark the same soul.`;
    case "diff":
      return `${name(a)} and ${name(b!)} never touch the same soul.`;
    case "order":
      return `${name(a)} sits somewhere left of ${name(b!)}.`;
    case "neighbor":
      return `${name(a)} sits directly beside ${name(b!)}.`;
  }
}

// ── Generation ───────────────────────────────────────────────

/** Build the full pool of TRUE clues about a solution, richest-first by type. */
function candidateClues(
  solution: number[][], // [cat][seat] = valueIndex
  cats: SeanceCategory[],
  n: number,
): Clue[] {
  const K = cats.length;
  // posOf[cat][val] = seat
  const posOf: number[][] = cats.map((_, c) => {
    const arr = Array(n).fill(0);
    for (let s = 0; s < n; s++) arr[solution[c][s]] = s;
    return arr;
  });
  const ref = (c: number, v: number): Ref => ({ cat: c, val: v });
  const mk = (type: ClueType, a: Ref, b?: Ref, seat?: number): Clue => ({
    type,
    a,
    b,
    seat,
    text: renderClue(type, a, b, seat, cats),
  });

  const out: Clue[] = [];
  // "same": co-located values across category pairs.
  for (let c1 = 0; c1 < K; c1++) {
    for (let c2 = c1 + 1; c2 < K; c2++) {
      for (let s = 0; s < n; s++) {
        out.push(mk("same", ref(c1, solution[c1][s]), ref(c2, solution[c2][s])));
      }
    }
  }
  // "neighbor": adjacent seats across category pairs.
  for (let c1 = 0; c1 < K; c1++) {
    for (let c2 = 0; c2 < K; c2++) {
      if (c1 === c2) continue;
      for (let s = 0; s < n - 1; s++) {
        out.push(
          mk("neighbor", ref(c1, solution[c1][s]), ref(c2, solution[c2][s + 1])),
        );
      }
    }
  }
  // "at": absolute seat pins.
  for (let c = 0; c < K; c++) {
    for (let v = 0; v < n; v++) {
      out.push(mk("at", ref(c, v), undefined, posOf[c][v]));
    }
  }
  // "order": full pairwise ordering (guarantees the full set is unique).
  for (let c1 = 0; c1 < K; c1++) {
    for (let c2 = 0; c2 < K; c2++) {
      for (let v1 = 0; v1 < n; v1++) {
        for (let v2 = 0; v2 < n; v2++) {
          if (c1 === c2 && v1 === v2) continue;
          if (posOf[c1][v1] < posOf[c2][v2]) {
            out.push(mk("order", ref(c1, v1), ref(c2, v2)));
          }
        }
      }
    }
  }
  return out;
}

// Removal priority: prune "boring" clue types first so the minimal set keeps the
// more interesting (same/neighbor/at) reasoning. Lower = removed earlier.
const PRUNE_PRIORITY: Record<ClueType, number> = {
  order: 0,
  diff: 1,
  at: 2,
  neighbor: 3,
  same: 4,
};

/**
 * Generate the deterministic daily Séance for `dayIndex` (and the matching
 * YYYY-MM-DD string). Pure: same inputs → byte-identical puzzle.
 */
export function generateSeance(dayIndex: number, date: string): SeancePuzzle {
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();
  const cfg = WEEKDAY[weekday];
  const n = cfg.n;

  const seed = (dayIndex ^ 0x53e4) >>> 0;
  const rand = mulberry32(seed);

  // weekly spirit (rotates by ISO-ish week number derived from dayIndex)
  const pack = SPIRIT_PACKS[Math.floor(dayIndex / 7) % SPIRIT_PACKS.length];

  // pick `cats` categories and N values each, deterministically.
  const chosenCats = shuffled(pack.categories, rand).slice(0, cfg.cats);
  const categories: SeanceCategory[] = chosenCats.map((fc) => ({
    key: fc.key,
    label: fc.label,
    values: shuffled(fc.values, rand).slice(0, n),
  }));

  // truth matrix: each category gets a seat permutation. solution[c][seat]=val.
  const solution: number[][] = categories.map(() => shuffled(
    Array.from({ length: n }, (_, i) => i),
    rand,
  ));

  // candidate clues → seeded shuffle → Subtraction Method down to a minimal,
  // uniquely-solvable set, pruning boring types first.
  const candidates = shuffled(candidateClues(solution, categories, n), rand).sort(
    (a, b) => PRUNE_PRIORITY[a.type] - PRUNE_PRIORITY[b.type],
  );

  let clues = candidates;
  for (let i = 0; i < candidates.length; i++) {
    const trial = clues.filter((c) => c !== candidates[i]);
    if (solutionCount(trial, n, categories.length) === 1) {
      clues = trial;
    }
  }

  // final order: present absolute/interesting clues first for readability.
  clues = [...clues].sort(
    (a, b) => PRUNE_PRIORITY[b.type] - PRUNE_PRIORITY[a.type],
  );

  return {
    date,
    weekday,
    rite: cfg.rite,
    spirit: pack.name,
    backstory: pack.backstory,
    n,
    categories,
    clues,
    solution,
    seed,
    whisper: cfg.whisper,
  };
}

// ── Player-facing deduction engine (hint / mark-clue-complete) ───────────────
// Pure functions over the player's board. The board is the same shape the UI
// keeps: marks[cat][seat][val], 0 = unmarked, 1 = snuffed (✕), 2 = bound (◯).
// These reuse the solver's domain propagation so a "hint" is always a real,
// solution-consistent next step — never a guess.

export type Mark = 0 | 1 | 2; // none | exclude | confirm
export type Board = Mark[][][]; // [cat][seat][val]

/** A single forced move the player can make right now. */
export interface Deduction {
  cat: number;
  seat: number;
  val: number;
  mark: 1 | 2; // 1 = eliminate, 2 = confirm
}

/** A deduction plus the clue(s) that drive it (indices into puzzle.clues). */
export interface Hint extends Deduction {
  clues: number[];
}

export function emptyBoard(p: SeancePuzzle): Board {
  return p.categories.map(() =>
    Array.from({ length: p.n }, () => Array<Mark>(p.n).fill(0)),
  );
}

/** Encode the player's marks as solver domains. */
function marksToDomains(board: Board, p: SeancePuzzle): boolean[][] {
  const n = p.n;
  const K = p.categories.length;
  const dom: boolean[][] = [];
  for (let i = 0; i < K * n; i++) dom.push(Array(n).fill(true));
  for (let c = 0; c < K; c++) {
    for (let seat = 0; seat < n; seat++) {
      for (let v = 0; v < n; v++) {
        const m = board[c][seat][v];
        if (m === 1) dom[vid(c, v, n)][seat] = false;
        else if (m === 2) {
          const id = vid(c, v, n);
          for (let s = 0; s < n; s++) dom[id][s] = s === seat;
        }
      }
    }
  }
  return dom;
}

/** Propagate marks + the given clue indices to fixpoint. null = contradiction. */
function domsWithClues(
  board: Board,
  p: SeancePuzzle,
  idxs: number[],
): boolean[][] | null {
  const n = p.n;
  const K = p.categories.length;
  const dom = marksToDomains(board, p);
  const cons: SolveConstraint[] = [];
  for (const i of idxs) {
    const cl = p.clues[i];
    if (cl.type === "at" && cl.seat !== undefined) {
      const id = vid(cl.a.cat, cl.a.val, n);
      for (let s = 0; s < n; s++) dom[id][s] = s === cl.seat;
    } else {
      cons.push({
        type: cl.type,
        x: vid(cl.a.cat, cl.a.val, n),
        y: cl.b ? vid(cl.b.cat, cl.b.val, n) : undefined,
        seat: cl.seat,
      });
    }
  }
  return propagate(dom, cons, n, K) ? dom : null;
}

/** Forced moves implied by `dom` that the player has not yet marked. */
function deductionsFrom(dom: boolean[][], board: Board, p: SeancePuzzle): Deduction[] {
  const n = p.n;
  const K = p.categories.length;
  const out: Deduction[] = [];
  for (let c = 0; c < K; c++) {
    for (let v = 0; v < n; v++) {
      const id = vid(c, v, n);
      const seats = domSeats(dom[id]);
      for (let seat = 0; seat < n; seat++) {
        if (!dom[id][seat] && board[c][seat][v] === 0) {
          out.push({ cat: c, seat, val: v, mark: 1 });
        }
      }
      if (seats.length === 1 && board[c][seats[0]][v] !== 2) {
        out.push({ cat: c, seat: seats[0], val: v, mark: 2 });
      }
    }
  }
  return out;
}

const dedKey = (d: Deduction) => `${d.cat}:${d.seat}:${d.val}:${d.mark}`;
const byCell = (a: Deduction, b: Deduction) =>
  a.cat - b.cat || a.seat - b.seat || a.val - b.val || a.mark - b.mark;

/**
 * The next move the player can deduce, plus the clue(s) that justify it. Reveals
 * the *clue*, not the answer — the UI highlights those clues. Prefers a move a
 * single clue forces (most instructive); falls back to pure grid logic, then to
 * a multi-clue step (attributing every clue whose removal loses the move).
 * Returns null only when the board is already solved.
 */
export function nextHint(board: Board, p: SeancePuzzle): Hint | null {
  // If the player's marks are self-contradictory, hint from a clean board so a
  // hint is still always available (the puzzle is solvable from clues alone).
  let use = board;
  let base = domsWithClues(use, p, []);
  if (!base) {
    use = emptyBoard(p);
    base = domsWithClues(use, p, [])!;
  }
  const baseKeys = new Set(deductionsFrom(base, use, p).map(dedKey));

  // Tier 1 — a single clue forces something structural logic alone does not.
  for (let i = 0; i < p.clues.length; i++) {
    const dom = domsWithClues(use, p, [i]);
    if (!dom) continue;
    const fresh = deductionsFrom(dom, use, p)
      .filter((d) => !baseKeys.has(dedKey(d)))
      .sort(byCell);
    if (fresh.length) return { clues: [i], ...fresh[0] };
  }

  // Tier 2 — pure grid logic (all-different) already forces a cell; no clue.
  const baseDed = deductionsFrom(base, use, p).sort(byCell);
  if (baseDed.length) return { clues: [], ...baseDed[0] };

  // Tier 3 — propagation has stalled but the puzzle is still uniquely solvable,
  // so a next move exists that needs case-analysis (search), not just
  // propagation. Read it off the unique solution and attribute the clue(s) whose
  // removal would make it non-forced (verified with the complete solver).
  return deepHint(use, p);
}

/** seat-of-(cat,val) from the stored unique solution. */
function seatOf(p: SeancePuzzle): number[][] {
  return p.solution.map((seatToVal) => {
    const arr = Array(p.n).fill(-1);
    seatToVal.forEach((v, s) => (arr[v] = s));
    return arr;
  });
}

/**
 * Solutions consistent with the marks, all clues (except `skip`), and one extra
 * assumption: the OPPOSITE of `target`. If this is 0, the target move is forced.
 */
function countOpposite(
  board: Board,
  p: SeancePuzzle,
  target: Deduction,
  skip: number,
): number {
  const n = p.n;
  const K = p.categories.length;
  const dom = marksToDomains(board, p);
  const cons: SolveConstraint[] = [];
  p.clues.forEach((cl, i) => {
    if (i === skip) return;
    if (cl.type === "at" && cl.seat !== undefined) {
      const id = vid(cl.a.cat, cl.a.val, n);
      for (let s = 0; s < n; s++) dom[id][s] = s === cl.seat;
    } else {
      cons.push({
        type: cl.type,
        x: vid(cl.a.cat, cl.a.val, n),
        y: cl.b ? vid(cl.b.cat, cl.b.val, n) : undefined,
        seat: cl.seat,
      });
    }
  });
  const id = vid(target.cat, target.val, n);
  if (target.mark === 2) dom[id][target.seat] = false; // assume NOT here → confirm forced iff 0
  else for (let s = 0; s < n; s++) dom[id][s] = s === target.seat; // assume here → elim forced iff 0
  return countSolutions(dom, cons, n, K);
}

function deepHint(board: Board, p: SeancePuzzle): Hint | null {
  const n = p.n;
  const K = p.categories.length;
  const pos = seatOf(p);
  // Prefer confirming a true seat (most progress); else eliminate a false cell.
  let target: Deduction | null = null;
  for (let c = 0; c < K && !target; c++)
    for (let v = 0; v < n && !target; v++) {
      const s = pos[c][v];
      if (board[c][s][v] !== 2) target = { cat: c, seat: s, val: v, mark: 2 };
    }
  if (!target)
    for (let c = 0; c < K && !target; c++)
      for (let seat = 0; seat < n && !target; seat++)
        for (let v = 0; v < n && !target; v++)
          if (seat !== pos[c][v] && board[c][seat][v] === 0)
            target = { cat: c, seat, val: v, mark: 1 };
  if (!target) return null; // solved

  // Clue i drives the move iff removing it lets the opposite become possible.
  const drivers: number[] = [];
  for (let i = 0; i < p.clues.length; i++) {
    if (countOpposite(board, p, target, i) > 0) drivers.push(i);
  }
  return { clues: drivers, ...target };
}

/** Every fresh move clue `i` still yields given the current marks. */
export function clueDeductions(board: Board, p: SeancePuzzle, i: number): Deduction[] {
  const base = domsWithClues(board, p, []);
  if (!base) return [];
  const baseKeys = new Set(deductionsFrom(base, board, p).map(dedKey));
  const dom = domsWithClues(board, p, [i]);
  if (!dom) return [];
  return deductionsFrom(dom, board, p).filter((d) => !baseKeys.has(dedKey(d)));
}

/** How many fresh deductions clue `i` still yields — the mark-complete warning. */
export function remainingFromClue(board: Board, p: SeancePuzzle, i: number): number {
  return clueDeductions(board, p, i).length;
}

// ── Undo/redo — a tiny generic snapshot stack (grids are small; ponytail) ────
export interface History<T> {
  stack: T[];
  idx: number;
}

/** Commit a new state, dropping any redo branch after the cursor. */
export function histCommit<T>(h: History<T>, next: T): History<T> {
  const stack = h.stack.slice(0, h.idx + 1);
  stack.push(next);
  return { stack, idx: stack.length - 1 };
}

export function histUndo<T>(h: History<T>): History<T> {
  return h.idx > 0 ? { stack: h.stack, idx: h.idx - 1 } : h;
}

export function histRedo<T>(h: History<T>): History<T> {
  return h.idx < h.stack.length - 1 ? { stack: h.stack, idx: h.idx + 1 } : h;
}

export const histState = <T,>(h: History<T>): T => h.stack[h.idx];
