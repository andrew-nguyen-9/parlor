import { describe, it, expect } from "vitest";
import { generateChronos } from "./chronosPuzzle";

describe("generateChronos (F6 stub)", () => {
  it("returns a valid puzzle", () => {
    const p = generateChronos(20000, "2026-07-06");
    expect(p.date).toBe("2026-07-06");
    expect(p.weekday).toBe(1); // Monday
    expect(typeof p.mechanism).toBe("string");
    expect(p.mechanism.length).toBeGreaterThan(0);
    expect(Number.isInteger(p.seed)).toBe(true);
  });

  it("is deterministic for a fixed dayIndex", () => {
    expect(generateChronos(20000, "2026-07-06")).toEqual(
      generateChronos(20000, "2026-07-06"),
    );
  });
});
