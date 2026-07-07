import { describe, expect, it } from "vitest";
import {
  generateLadder,
  countSkyscrapers,
  countFutoshiki,
  countBinairo,
  visible,
  WEEKDAY,
  type SkyscrapersRung,
  type FutoshikiRung,
  type BinairoRung,
} from "./ladder";

function day(dayIndex: number) {
  return { dayIndex, date: new Date(dayIndex * 86400000).toISOString().slice(0, 10) };
}
// 7 consecutive days (20101 = Monday) = every weekday config exactly once.
// Generation is exhaustive-solver-backed, so we keep the span tight + give the
// uniqueness sweep a generous timeout below.
const DAYS = Array.from({ length: 7 }, (_, i) => day(20101 + i));

function isLatin(g: number[][], n: number) {
  for (let r = 0; r < n; r++) expect(new Set(g[r]).size).toBe(n);
  for (let c = 0; c < n; c++) expect(new Set(g.map((row) => row[c])).size).toBe(n);
}

function assertSkyscrapers(rung: SkyscrapersRung) {
  const { n, solution, givens, top, bottom, left, right } = rung;
  isLatin(solution, n);
  // clues match the solution where present
  for (let c = 0; c < n; c++) {
    const col = solution.map((row) => row[c]);
    if (top[c] > 0) expect(top[c]).toBe(visible(col));
    if (bottom[c] > 0) expect(bottom[c]).toBe(visible([...col].reverse()));
  }
  for (let r = 0; r < n; r++) {
    if (left[r] > 0) expect(left[r]).toBe(visible(solution[r]));
    if (right[r] > 0) expect(right[r]).toBe(visible([...solution[r]].reverse()));
  }
  // givens consistent with solution
  givens.forEach((row, r) => row.forEach((v, c) => v >= 0 && expect(v).toBe(solution[r][c])));
  // UNIQUE
  expect(countSkyscrapers(n, { top, bottom, left, right }, givens)).toBe(1);
}

function assertFutoshiki(rung: FutoshikiRung) {
  const { n, solution, givens, gh, gv } = rung;
  isLatin(solution, n);
  // relations are consistent with the solution
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n - 1; c++) {
      if (gh[r][c] === 1) expect(solution[r][c]).toBeLessThan(solution[r][c + 1]);
      if (gh[r][c] === -1) expect(solution[r][c]).toBeGreaterThan(solution[r][c + 1]);
    }
  for (let r = 0; r < n - 1; r++)
    for (let c = 0; c < n; c++) {
      if (gv[r][c] === 1) expect(solution[r][c]).toBeLessThan(solution[r + 1][c]);
      if (gv[r][c] === -1) expect(solution[r][c]).toBeGreaterThan(solution[r + 1][c]);
    }
  givens.forEach((row, r) => row.forEach((v, c) => v >= 0 && expect(v).toBe(solution[r][c])));
  // UNIQUE
  expect(countFutoshiki(n, gh, gv, givens)).toBe(1);
}

function assertBinairo(rung: BinairoRung) {
  const { n, solution, givens } = rung;
  // balanced rows/cols
  for (let r = 0; r < n; r++) {
    expect(solution[r].filter((v) => v === 0).length).toBe(n / 2);
    // no 3-in-a-row
    for (let c = 2; c < n; c++)
      expect(solution[r][c] === solution[r][c - 1] && solution[r][c] === solution[r][c - 2]).toBe(false);
  }
  for (let c = 0; c < n; c++) {
    const col = solution.map((row) => row[c]);
    expect(col.filter((v) => v === 0).length).toBe(n / 2);
  }
  // all rows distinct, all cols distinct
  const rows = solution.map((r) => r.join(""));
  expect(new Set(rows).size).toBe(n);
  const cols = Array.from({ length: n }, (_, c) => solution.map((r) => r[c]).join(""));
  expect(new Set(cols).size).toBe(n);
  givens.forEach((row, r) => row.forEach((v, c) => v >= 0 && expect(v).toBe(solution[r][c])));
  // UNIQUE
  expect(countBinairo(n, givens)).toBe(1);
}

describe("generateLadder", () => {
  it("is deterministic", () => {
    for (const { dayIndex, date } of DAYS.slice(0, 4)) {
      expect(generateLadder(dayIndex, date)).toEqual(generateLadder(dayIndex, date));
    }
  });

  it("matches the weekday rung config and rotates families by date", () => {
    for (const { dayIndex, date } of DAYS) {
      const p = generateLadder(dayIndex, date);
      const cfg = WEEKDAY[p.weekday];
      expect(p.rungs).toHaveLength(cfg.rungs);
      expect(p.kinds).toHaveLength(cfg.rungs);
      // rungs escalate in the 5..8 band
      for (const rung of p.rungs) {
        expect(rung.n).toBeGreaterThanOrEqual(5);
        expect(rung.n).toBeLessThanOrEqual(8);
      }
    }
  }, 60_000);

  it("carries a changing resonance up the climb", () => {
    const p = generateLadder(20200, day(20200).date);
    if (p.rungs.length > 1) {
      const res = p.rungs.map((r) => r.resonance);
      expect(new Set(res).size).toBeGreaterThan(1);
    }
  });

  it("every rung has a UNIQUE, well-formed solution (per type)", () => {
    for (const { dayIndex, date } of DAYS) {
      const p = generateLadder(dayIndex, date);
      for (const rung of p.rungs) {
        if (rung.kind === "skyscrapers") assertSkyscrapers(rung);
        else if (rung.kind === "futoshiki") assertFutoshiki(rung);
        else assertBinairo(rung);
      }
    }
  }, 60_000);
});

describe("solvers", () => {
  it("visible counts a skyline correctly", () => {
    expect(visible([1, 2, 3, 4])).toBe(4);
    expect(visible([4, 1, 2, 3])).toBe(1);
    expect(visible([2, 1, 4, 3])).toBe(2);
  });

  it("countBinairo rejects an over-constrained impossible board as 0", () => {
    // a fully-given illegal 4×4 (a 3-in-a-column) has no valid completion
    const bad = [
      [0, 1, 0, 1],
      [0, 1, 1, 0],
      [0, 0, 1, 1],
      [1, 0, 0, 1],
    ];
    expect(countBinairo(4, bad)).toBe(0);
  });
});
