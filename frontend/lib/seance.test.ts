import { describe, expect, it } from "vitest";
import {
  generateSeance,
  solutionCount,
  WEEKDAY,
  emptyBoard,
  nextHint,
  refreshClueText,
  clueDeductions,
  remainingFromClue,
  histCommit,
  histUndo,
  histRedo,
  histState,
  withAutoElim,
  type Board,
  type History,
  type Clue,
  type SeancePuzzle,
} from "./seance";

// (dayIndex, YYYY-MM-DD) pairs — date derived from the epoch-day so the weekday
// the engine reads always matches dayIndex.
function day(dayIndex: number): { dayIndex: number; date: string } {
  return { dayIndex, date: new Date(dayIndex * 86400000).toISOString().slice(0, 10) };
}

// seat of each (cat,val) from the solution matrix
function posOf(p: SeancePuzzle): number[][] {
  return p.solution.map((seatToVal) => {
    const arr = Array(p.n).fill(-1);
    seatToVal.forEach((v, s) => (arr[v] = s));
    return arr;
  });
}

function clueHolds(c: Clue, pos: number[][]): boolean {
  const a = pos[c.a.cat][c.a.val];
  const b = c.b ? pos[c.b.cat][c.b.val] : -1;
  switch (c.type) {
    case "at": return a === c.seat;
    case "same": return a === b;
    case "diff": return a !== b;
    case "order": return a < b;
    case "neighbor": return Math.abs(a - b) === 1;
  }
}

// A representative span of days (covers all 7 weekdays several times over).
const DAYS = Array.from({ length: 21 }, (_, i) => day(20000 + i));

describe("generateSeance", () => {
  it("is deterministic", () => {
    for (const { dayIndex, date } of DAYS.slice(0, 5)) {
      expect(generateSeance(dayIndex, date)).toEqual(generateSeance(dayIndex, date));
    }
  });

  it("produces exactly one solution every day", () => {
    for (const { dayIndex, date } of DAYS) {
      const p = generateSeance(dayIndex, date);
      expect(solutionCount(p.clues, p.n, p.categories.length)).toBe(1);
    }
  });

  it("the stored solution satisfies every clue", () => {
    for (const { dayIndex, date } of DAYS) {
      const p = generateSeance(dayIndex, date);
      const pos = posOf(p);
      for (const c of p.clues) expect(clueHolds(c, pos)).toBe(true);
    }
  });

  it("the clue set is minimal (removing any clue breaks uniqueness)", () => {
    for (const { dayIndex, date } of DAYS.slice(0, 6)) {
      const p = generateSeance(dayIndex, date);
      for (let i = 0; i < p.clues.length; i++) {
        const trimmed = p.clues.filter((_, j) => j !== i);
        expect(solutionCount(trimmed, p.n, p.categories.length)).toBeGreaterThan(1);
      }
    }
  });

  it("matches the weekday config for grid size and category count", () => {
    for (const { dayIndex, date } of DAYS) {
      const p = generateSeance(dayIndex, date);
      const cfg = WEEKDAY[p.weekday];
      expect(p.n).toBe(cfg.n);
      expect(p.categories).toHaveLength(cfg.cats);
      expect(p.whisper).toBe(cfg.whisper);
      for (const cat of p.categories) expect(cat.values).toHaveLength(p.n);
    }
  });
});

describe("deduction engine", () => {
  it("hint cites clue(s) that yield a solution-consistent move", () => {
    for (const { dayIndex, date } of DAYS.slice(0, 4)) {
      const p = generateSeance(dayIndex, date);
      const pos = posOf(p);
      const h = nextHint(emptyBoard(p), p);
      expect(h).not.toBeNull();
      // the move agrees with the truth: confirm ⇒ value really sits there;
      // eliminate ⇒ it does not.
      if (h!.mark === 2) expect(pos[h!.cat][h!.val]).toBe(h!.seat);
      else expect(pos[h!.cat][h!.val]).not.toBe(h!.seat);
      // a cited clue genuinely drives the move
      for (const i of h!.clues) {
        expect(clueDeductions(emptyBoard(p), p, i).some(
          (d) => d.cat === h!.cat && d.seat === h!.seat && d.val === h!.val && d.mark === h!.mark,
        )).toBe(true);
      }
    }
  });

  it("a mark contradicting the solution yields a wrong-mark hint, not a derived move", () => {
    for (const { dayIndex, date } of DAYS.slice(0, 3)) {
      const p = generateSeance(dayIndex, date);
      const pos = posOf(p);
      // wrongly snuff the true cell of (cat 0, val 0) — consistent under
      // propagation (no contradiction yet) but false against the solution
      const board = emptyBoard(p);
      board[0][pos[0][0]][0] = 1;
      const h = nextHint(board, p);
      expect(h).not.toBeNull();
      expect(h!.wrong).toBe(true);
      // the hint IS the correction: re-bind the truth at that cell
      expect(h!.cat).toBe(0);
      expect(h!.val).toBe(0);
      expect(h!.seat).toBe(pos[0][0]);
      expect(h!.mark).toBe(2);
    }
  });

  it("iterated hints drive the board to the full solution", () => {
    for (const { dayIndex, date } of DAYS.slice(0, 5)) {
      const p = generateSeance(dayIndex, date);
      let board = emptyBoard(p);
      for (let guard = 0; guard < 5000; guard++) {
        const h = nextHint(board, p);
        if (!h) break;
        board = board.map((c) => c.map((r) => r.slice()));
        board[h.cat][h.seat][h.val] = h.mark;
      }
      const pos = posOf(p);
      for (let c = 0; c < p.categories.length; c++) {
        for (let v = 0; v < p.n; v++) {
          expect(board[c][pos[c][v]][v]).toBe(2); // value bound at its true seat
        }
      }
    }
  });

  it("refreshClueText regenerates archived prose from clue structure", () => {
    const { dayIndex, date } = day(20002);
    const p = generateSeance(dayIndex, date);
    // simulate an archived payload with stale prose baked in
    const stale = { ...p, clues: p.clues.map((c) => ({ ...c, text: "old wording" })) };
    const fresh = refreshClueText(stale);
    fresh.clues.forEach((c, i) => expect(c.text).toBe(p.clues[i].text));
    // input untouched (pure)
    stale.clues.forEach((c) => expect(c.text).toBe("old wording"));
  });

  it("mark-clue-complete count matches the clue's real remaining deductions", () => {
    const { dayIndex, date } = day(20001);
    const p = generateSeance(dayIndex, date);
    const empty = emptyBoard(p);
    const pos = posOf(p);
    const i = p.clues.findIndex((_, k) => remainingFromClue(empty, p, k) > 0);
    expect(i).toBeGreaterThanOrEqual(0);
    const ded = clueDeductions(empty, p, i);
    expect(remainingFromClue(empty, p, i)).toBe(ded.length); // the count the UI shows == the real moves
    for (const d of ded) {
      if (d.mark === 2) expect(pos[d.cat][d.val]).toBe(d.seat);
      else expect(pos[d.cat][d.val]).not.toBe(d.seat);
    }
  });
});

describe("withAutoElim (logic-grid assist)", () => {
  const { dayIndex, date } = day(20003);
  const p = generateSeance(dayIndex, date);
  const n = p.n;
  const blank = (): Board => emptyBoard(p);

  it("a confirm auto-excludes the rest of its seat-row and value-column", () => {
    const b = blank();
    b[0][1][2] = 2; // confirm cat0, seat1, val2
    const v = withAutoElim(b, n);
    expect(v[0][1][2]).toBe(2); // confirm survives
    for (let x = 0; x < n; x++) {
      if (x !== 2) expect(v[0][1][x]).toBe(1); // rest of the row snuffed
      if (x !== 1) expect(v[0][x][2]).toBe(1); // rest of the column snuffed
    }
    // never leaks into another category
    for (let s = 0; s < n; s++) for (let x = 0; x < n; x++) expect(v[1][s][x]).toBe(0);
  });

  it("is derived, not persisted: blanking the confirm releases its auto-X", () => {
    const b = blank();
    b[0][1][2] = 2;
    expect(withAutoElim(b, n)[0][0][2]).toBe(1); // forced while confirmed
    b[0][1][2] = 0; // blank it (input mutated, mirroring the app's manual store)
    expect(withAutoElim(b, n)[0][0][2]).toBe(0); // released — nothing forces it
  });

  it("keeps an auto-X still forced by ANOTHER confirm", () => {
    const b = blank();
    b[0][0][0] = 2; // forces col0 seat1 -> X
    b[0][1][1] = 2; // also forces col0 seat1 -> X (its row)
    expect(withAutoElim(b, n)[0][1][0]).toBe(1);
    b[0][0][0] = 0; // drop the first confirm
    expect(withAutoElim(b, n)[0][1][0]).toBe(1); // still forced by the second
  });

  it("preserves manual marks and never adds a confirm (solve-check safe)", () => {
    // build the full true solution as a confirm-only board
    const pos = posOf(p);
    const b = blank();
    for (let c = 0; c < p.categories.length; c++)
      for (let val = 0; val < n; val++) b[c][pos[c][val]][val] = 2;
    const v = withAutoElim(b, n);
    // exactly one confirm per (cat, seat), matching truth — validation intact
    for (let c = 0; c < p.categories.length; c++)
      for (let seat = 0; seat < n; seat++) {
        const confirms = v[c][seat].map((m, val) => (m === 2 ? val : -1)).filter((x) => x >= 0);
        expect(confirms).toEqual([p.solution[c][seat]]);
      }
    // a manual X is left untouched, never promoted
    const b2 = blank();
    b2[0][0][0] = 1;
    expect(withAutoElim(b2, n)[0][0][0]).toBe(1);
  });
});

describe("undo/redo history", () => {
  it("walks marks forward and back, and a new mark clears redo", () => {
    let h: History<number> = { stack: [0], idx: 0 };
    for (let k = 1; k <= 3; k++) h = histCommit(h, k); // apply 3 marks
    let u = h;
    for (let k = 0; k < 3; k++) u = histUndo(u);
    expect(histState(u)).toBe(0); // undo k → initial
    let r = u;
    for (let k = 0; k < 3; k++) r = histRedo(r);
    expect(histState(r)).toBe(3); // redo → restored
    const branched = histCommit(histUndo(h), 9); // new mark after undo
    expect(histState(branched)).toBe(9);
    expect(histRedo(branched)).toBe(branched); // redo stack cleared
  });

  it("undo/redo saturate at the ends", () => {
    const h: History<Board> = { stack: [[[[0]]]], idx: 0 };
    expect(histUndo(h)).toBe(h);
    expect(histRedo(h)).toBe(h);
  });
});
