import { describe, it, expect } from "vitest";
import { generateChronos, solveChronos, runningMarks } from "./chronosPuzzle";

// (dayIndex, YYYY-MM-DD) with the date derived from the epoch-day so the weekday
// the generator reads matches dayIndex — lets us sweep many distinct days.
function day(dayIndex: number): { dayIndex: number; date: string } {
  return {
    dayIndex,
    date: new Date(dayIndex * 86400000).toISOString().slice(0, 10),
  };
}

describe("generateChronos — gear-train ratio lock", () => {
  it("keeps the stable F6 surface (date/weekday/mechanism/seed)", () => {
    const p = generateChronos(20000, "2026-07-06");
    expect(p.date).toBe("2026-07-06");
    expect(p.weekday).toBe(1); // Monday
    expect(typeof p.mechanism).toBe("string");
    expect(p.mechanism.length).toBeGreaterThan(0);
    expect(Number.isInteger(p.seed)).toBe(true);
  });

  it("is deterministic for a fixed (dayIndex,date)", () => {
    expect(generateChronos(20000, "2026-07-06")).toEqual(
      generateChronos(20000, "2026-07-06"),
    );
  });

  it("bakes a solution that seats every wheel on a distinct shaft", () => {
    const p = generateChronos(20000, "2026-07-06");
    const stages = p.shafts.length;
    const seats = Object.values(p.solution).sort((a, b) => a - b);
    expect(seats).toEqual(Array.from({ length: stages }, (_, i) => i + 1));
    expect(Object.keys(p.solution).length).toBe(stages);
    expect(p.gears.length).toBe(stages);
    // tooth-residues distinct mod dialTeeth (the uniqueness lever)
    const residues = new Set(p.gears.map((g) => g.teeth % p.dialTeeth));
    expect(residues.size).toBe(stages);
  });

  it("the baked arrangement actually lands every shaft on its engraved notch", () => {
    const p = generateChronos(20000, "2026-07-06");
    const order = [...p.shafts].sort((a, b) => a.index - b.index);
    const teethByShaft = order.map(
      (s) => p.gears.find((g) => p.solution[g.key] === s.index)!.teeth,
    );
    const marks = runningMarks(teethByShaft, p.drive, p.dialTeeth);
    expect(marks).toEqual(order.map((s) => s.target));
  });

  it("SOLVER-IGNORING-TRIVIA reaches the unique arrangement across many days", () => {
    for (let d = 0; d < 120; d++) {
      const { dayIndex, date } = day(19000 + d);
      const p = generateChronos(dayIndex, date);

      // The solver sees ONLY tooth counts + the engraved notches — never `cast`,
      // `dialYear`, `provenance`, or any other trivia field. A pure-reasoning player.
      const gears = p.gears.map((g) => ({ key: g.key, teeth: g.teeth }));
      const sols = solveChronos(gears, p.shafts, p.drive, p.dialTeeth, 5);

      // exactly one legal arrangement …
      expect(sols.length, `day ${date} must be uniquely solvable`).toBe(1);
      // … and it is the baked answer.
      expect(sols[0]).toEqual(p.solution);
    }
  });

  it("weekend trains run one shaft longer than weekdays", () => {
    const findDay = (wd: number) => {
      for (let d = 0; d < 14; d++) {
        const { dayIndex, date } = day(19000 + d);
        const p = generateChronos(dayIndex, date);
        if (p.weekday === wd) return p;
      }
      throw new Error("no such weekday in window");
    };
    expect(findDay(3).shafts.length).toBe(4); // Wednesday
    expect(findDay(6).shafts.length).toBe(5); // Saturday
  });
});
