import { describe, expect, it } from "vitest";
import {
  HOURS,
  ROOMS,
  deduceCulprits,
  deductionMatrix,
  generateCase,
  verifySolvable,
} from "./mystery";

describe("generateCase", () => {
  it("is deterministic for a given date", () => {
    const a = generateCase("2026-06-16");
    const b = generateCase("2026-06-16");
    expect(a).toEqual(b);
  });

  it("produces a verifiably solvable case for 200 consecutive days", () => {
    const start = Date.UTC(2026, 0, 1);
    for (let i = 0; i < 200; i++) {
      const date = new Date(start + i * 86400000).toISOString().slice(0, 10);
      const c = generateCase(date);
      expect(verifySolvable(c)).toBe(true);
    }
  });

  it("never names the scene or murder hour in the opening prose", () => {
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.UTC(2026, 0, 1) + i * 86400000)
        .toISOString()
        .slice(0, 10);
      const c = generateCase(date);
      expect(c.opening).not.toContain(c.scene);
      expect(c.opening).not.toContain(HOURS[c.hourIndex]);
    }
  });
});

describe("deduceCulprits", () => {
  it("matches the generated culprit set exactly", () => {
    const c = generateCase("2026-06-16");
    const deduced = new Set(deduceCulprits(c));
    expect(deduced.size).toBe(c.culprits.length);
    for (const id of c.culprits) expect(deduced.has(id)).toBe(true);
  });

  it("never flags an innocent suspect", () => {
    const c = generateCase("2026-06-16");
    const deduced = new Set(deduceCulprits(c));
    for (const s of c.suspects) {
      if (!c.culprits.includes(s.id)) expect(deduced.has(s.id)).toBe(false);
    }
  });
});

describe("deductionMatrix", () => {
  it("has exactly one confirmed cell once all clues are revealed, at the true scene/hour", () => {
    const c = generateCase("2026-06-16");
    const m = deductionMatrix(c, c.clues.length);
    let confirmed = 0;
    for (const row of m) for (const cell of row) if (cell === "confirmed") confirmed++;
    expect(confirmed).toBe(1);
    const sceneIdx = ROOMS.indexOf(c.scene as (typeof ROOMS)[number]);
    expect(m[sceneIdx][c.hourIndex]).toBe("confirmed");
  });

  it("has no confirmed cells before any clue is revealed", () => {
    const c = generateCase("2026-06-16");
    const m = deductionMatrix(c, 0);
    for (const row of m) for (const cell of row) expect(cell).not.toBe("confirmed");
  });

  it("only ever produces ruled-out, unknown, or confirmed cells", () => {
    const c = generateCase("2026-06-16");
    for (let n = 0; n <= c.clues.length; n++) {
      const m = deductionMatrix(c, n);
      for (const row of m) {
        for (const cell of row) {
          expect(["ruled-out", "unknown", "confirmed"]).toContain(cell);
        }
      }
    }
  });
});
