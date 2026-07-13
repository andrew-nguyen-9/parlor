import { describe, it, expect } from "vitest";
import { tutorial, SEANCE_DEMO, DEMO_TARGET } from "./seance";

// E3 — the animated board-fill demo is a pure function of this deterministic
// script, so asserting the script proves the step sequence + static fallback
// exist and stay coherent (the .tsx player is compiled + typechecked by the
// build; vitest runs node-env, so we test the data it renders).

describe("séance tutorial content (E3)", () => {
  it("keeps 2–5 icon+phrase steps that narrate the core loop", () => {
    expect(tutorial.steps).toBeDefined();
    const steps = tutorial.steps!;
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps.length).toBeLessThanOrEqual(5);
    const all = steps.map((s) => s.text.toLowerCase()).join(" ");
    for (const kw of ["snuff", "bind", "row and column", "stabilise"]) {
      expect(all).toContain(kw);
    }
  });

  it("uses the fixed evergreen whisper example, never a live clue", () => {
    expect(tutorial.example.prompt.toLowerCase()).toContain("vane");
  });
});

describe("séance demo script (E3 animated board-fill)", () => {
  const { beats, still, size, beatMs } = SEANCE_DEMO;

  it("is a finite, played-once sequence within the motion budget", () => {
    expect(beats.length).toBeGreaterThanOrEqual(3);
    expect(beatMs).toBeLessThanOrEqual(600); // ≤600ms per beat Floor
  });

  it("every beat is a size×size board with marks in {0,1,2}", () => {
    for (const b of beats) {
      expect(b.grid.length).toBe(size);
      for (const row of b.grid) {
        expect(row.length).toBe(size);
        for (const m of row) expect([0, 1, 2]).toContain(m);
      }
      expect(b.caption.length).toBeGreaterThan(0);
    }
  });

  it("the final beat proves the cascade: one bound seat, its whole row + column snuffed", () => {
    const g = beats[beats.length - 1].grid;
    const { row, col } = DEMO_TARGET;
    expect(g[row][col]).toBe(2); // bound ◯
    for (let c = 0; c < size; c++) if (c !== col) expect(g[row][c]).toBe(1); // row auto-snuffed ✕
    for (let r = 0; r < size; r++) if (r !== row) expect(g[r][col]).toBe(1); // column auto-snuffed ✕
  });

  it("has a reduced-motion static fallback: blank before → solved after", () => {
    expect(still.before.flat().every((m) => m === 0)).toBe(true);
    expect(still.after).toEqual(beats[beats.length - 1].grid);
  });
});
