import { describe, it, expect } from "vitest";
import { generateMystery } from "./mysteryPuzzle";

describe("generateMystery (F6 stub)", () => {
  it("returns a valid puzzle", () => {
    const p = generateMystery(20000, "2026-07-06");
    expect(p.date).toBe("2026-07-06");
    expect(p.weekday).toBe(1); // Monday
    expect(typeof p.caseName).toBe("string");
    expect(p.caseName.length).toBeGreaterThan(0);
    expect(Number.isInteger(p.seed)).toBe(true);
  });

  it("is deterministic for a fixed dayIndex", () => {
    expect(generateMystery(20000, "2026-07-06")).toEqual(
      generateMystery(20000, "2026-07-06"),
    );
  });
});
