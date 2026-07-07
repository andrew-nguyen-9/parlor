import { describe, it, expect } from "vitest";
import { generateAtlas } from "./atlasPuzzle";

describe("generateAtlas (F6 stub)", () => {
  it("returns a valid puzzle", () => {
    const p = generateAtlas(20000, "2026-07-06");
    expect(p.date).toBe("2026-07-06");
    expect(p.weekday).toBe(1); // Monday
    expect(typeof p.skyRegion).toBe("string");
    expect(p.skyRegion.length).toBeGreaterThan(0);
    expect(Number.isInteger(p.seed)).toBe(true);
  });

  it("is deterministic for a fixed dayIndex", () => {
    expect(generateAtlas(20000, "2026-07-06")).toEqual(
      generateAtlas(20000, "2026-07-06"),
    );
  });
});
