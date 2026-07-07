import { describe, it, expect } from "vitest";
import { generateIgnite } from "./ignitePuzzle";

describe("generateIgnite (F6 stub)", () => {
  it("returns a valid puzzle", () => {
    const p = generateIgnite(20000, "2026-07-06");
    expect(p.date).toBe("2026-07-06");
    expect(p.weekday).toBe(1); // Monday
    expect(typeof p.runeSet).toBe("string");
    expect(p.runeSet.length).toBeGreaterThan(0);
    expect(Number.isInteger(p.seed)).toBe(true);
  });

  it("is deterministic for a fixed dayIndex", () => {
    expect(generateIgnite(20000, "2026-07-06")).toEqual(
      generateIgnite(20000, "2026-07-06"),
    );
  });
});
