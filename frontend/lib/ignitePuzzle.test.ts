import { describe, it, expect } from "vitest";
import {
  generateIgnite,
  type IgniteClue,
  type IgnitePuzzle,
} from "./ignitePuzzle";

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);
const code = (c: string) => c.charCodeAt(0);

// Independent solver (does NOT share the engine's baked solution): enumerate all
// glyph→letter bijections and keep those satisfying every clue. Proves the clues
// alone determine the mapping.
function solve(p: IgnitePuzzle): number[][] {
  const K = p.letters.length;
  const out: number[][] = [];
  const assign: number[] = [];
  const used = new Array(K).fill(false);
  const check = (c: IgniteClue, a: number[]): boolean => {
    const L = (g: number) => p.letters[a[g]];
    switch (c.type) {
      case "anchor":
        return L(c.glyphs[0]) === c.letter;
      case "not":
        return L(c.glyphs[0]) !== c.letter;
      case "vowel":
        return VOWELS.has(L(c.glyphs[0]));
      case "consonant":
        return !VOWELS.has(L(c.glyphs[0]));
      case "before":
        return code(L(c.glyphs[0])) < code(L(c.glyphs[1]));
      case "adjacent":
        return code(L(c.glyphs[1])) - code(L(c.glyphs[0])) === 1;
    }
  };
  const rec = (g: number) => {
    if (g === K) {
      if (p.clues.every((c) => check(c, assign))) out.push(assign.slice());
      return;
    }
    for (let l = 0; l < K; l++) {
      if (used[l]) continue;
      assign[g] = l;
      used[l] = true;
      rec(g + 1);
      used[l] = false;
    }
  };
  rec(0);
  return out;
}

describe("generateIgnite", () => {
  it("is deterministic for a fixed (dayIndex, date)", () => {
    expect(generateIgnite(20000, "2026-07-06")).toEqual(
      generateIgnite(20000, "2026-07-06"),
    );
  });

  it("clues uniquely determine the mapping, and it is the baked solution", () => {
    // sweep a week's worth of day indices (every weekday K value exercised)
    for (let i = 0; i < 40; i++) {
      const date = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
      const p = generateIgnite(20000 + i, date);
      const sols = solve(p);
      expect(sols.length, `day ${date} must have exactly one solution`).toBe(1);
      expect(sols[0]).toEqual(p.solution);
    }
  });

  it("is well-formed: bijection over distinct letters, cipher spells the incantation", () => {
    const p = generateIgnite(31337, "2026-07-06");
    const K = p.letters.length;
    expect(p.glyphs.length).toBe(K);
    expect(p.letters).toEqual([...new Set(p.incantation.split(""))].sort());
    // solution is a permutation of 0..K-1
    expect([...p.solution].sort((a, b) => a - b)).toEqual(
      Array.from({ length: K }, (_, i) => i),
    );
    // the inscription, decoded via the solution, is the incantation
    const decoded = p.cipher
      .map((g) => p.letters[p.solution[g]])
      .join("");
    expect(decoded).toBe(p.incantation);
    // at least one vowel and one consonant → property clues are meaningful
    expect(p.letters.some((l) => VOWELS.has(l))).toBe(true);
    expect(p.letters.some((l) => !VOWELS.has(l))).toBe(true);
  });

  it("is harder: K floor is 5 and the surviving set is relational, not give-away anchors", () => {
    // E4 difficulty tune — every day maps >=5 runes (no easy 4-rune boards) and the
    // minimal set leans on before/adjacent/not deduction (anchors dropped first),
    // while STILL being uniquely solvable (covered by the sweep test above).
    for (let i = 0; i < 40; i++) {
      const date = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
      const p = generateIgnite(20000 + i, date);
      expect(p.letters.length, `day ${date} K floor`).toBeGreaterThanOrEqual(5);
      const anchors = p.clues.filter((c) => c.type === "anchor").length;
      // give-away anchors are removed first → the survivor is relational-heavy
      expect(anchors, `day ${date} should lean relational`).toBeLessThanOrEqual(1);
    }
  });

  it("is minimal: removing any clue breaks uniqueness", () => {
    const p = generateIgnite(777, "2026-07-04"); // Saturday → K=6
    for (let i = 0; i < p.clues.length; i++) {
      const pruned: IgnitePuzzle = {
        ...p,
        clues: p.clues.filter((_, j) => j !== i),
      };
      expect(solve(pruned).length).toBeGreaterThan(1);
    }
  });
});
