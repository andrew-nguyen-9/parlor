import { describe, it, expect } from "vitest";
import {
  generateAtlas,
  candidatesSatisfying,
  loadCatalog,
  type ClueKind,
} from "./atlasPuzzle";

// Every clue kind is a STRUCTURAL, countable property of the drawing — none is a
// fact of astronomy. This set is the whole vocabulary a solver ever needs.
const STRUCTURAL_KINDS: ClueKind[] = ["count", "parity", "lines", "loop", "hub", "split", "bright"];

// A day for each 3-day step across ~3.3 years: plenty to shake out any seed that
// fails to isolate a unique target or produces a degenerate board.
const days = Array.from({ length: 400 }, (_, i) => 20000 + i * 3);

describe("generateAtlas", () => {
  it("returns a valid, shaped puzzle", () => {
    const p = generateAtlas(20000, "2026-07-06");
    expect(p.date).toBe("2026-07-06");
    expect(p.weekday).toBe(1); // Monday
    expect(typeof p.skyRegion).toBe("string");
    expect(p.skyRegion.length).toBeGreaterThan(0);
    expect(Number.isInteger(p.seed)).toBe(true);
    expect(p.candidates.length).toBe(6);
    expect(p.clues.length).toBeGreaterThanOrEqual(3);
    // Solution is one of the drawn candidates.
    expect(p.candidates.map((c) => c.id)).toContain(p.solution);
  });

  it("is deterministic for a fixed dayIndex", () => {
    expect(generateAtlas(20000, "2026-07-06")).toEqual(generateAtlas(20000, "2026-07-06"));
  });

  it("every day yields a UNIQUE solution — the clues fit exactly one pattern", () => {
    for (const d of days) {
      const p = generateAtlas(d, "2026-07-06");
      const matches = candidatesSatisfying(p);
      expect(matches).toEqual([p.solution]);
    }
  });

  it("is solvable WITHOUT astronomy — every clue is a purely structural fact", () => {
    for (const d of days) {
      const p = generateAtlas(d, "2026-07-06");
      for (const clue of p.clues) {
        expect(STRUCTURAL_KINDS).toContain(clue.kind);
        // The clue text never leaks a star or constellation name.
        expect(clue.text).not.toMatch(/orion|dipper|betelgeuse|vega|constellation/i);
      }
      // Candidate positions are normalized (renderable in a unit frame, no map/geo).
      for (const cand of p.candidates) {
        for (const s of cand.stars) {
          expect(s.x).toBeGreaterThanOrEqual(0);
          expect(s.x).toBeLessThanOrEqual(1);
          expect(s.y).toBeGreaterThanOrEqual(0);
          expect(s.y).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("draws six DISTINCT patterns each day (no duplicate candidate)", () => {
    for (const d of days.slice(0, 60)) {
      const ids = generateAtlas(d, "2026-07-06").candidates.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("star catalog", () => {
  it("loads offline from committed JSON (the polygon-equivalent local fallback)", () => {
    const cat = loadCatalog();
    expect(cat.constellations.length).toBeGreaterThanOrEqual(12);
    expect(cat.license).toMatch(/HYG|IAU|public domain/i);
    for (const con of cat.constellations) {
      expect(con.stars.length).toBeGreaterThanOrEqual(3);
      expect(con.lines.length).toBeGreaterThanOrEqual(1);
      // Every line references real stars in the constellation.
      const ids = new Set(con.stars.map((s) => s.id));
      for (const [a, b] of con.lines) {
        expect(ids.has(a)).toBe(true);
        expect(ids.has(b)).toBe(true);
      }
    }
  });
});
