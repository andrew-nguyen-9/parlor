import { describe, it, expect } from "vitest";
import { generateChronos, solveChronos } from "./chronosPuzzle";

// (dayIndex, YYYY-MM-DD) with the date derived from the epoch-day so the weekday
// the generator reads matches dayIndex — lets us sweep many distinct days.
function day(dayIndex: number): { dayIndex: number; date: string } {
  return {
    dayIndex,
    date: new Date(dayIndex * 86400000).toISOString().slice(0, 10),
  };
}

describe("generateChronos — clockwork logic box", () => {
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

  it("bakes a solution that is a genuine permutation of the stages", () => {
    const p = generateChronos(20000, "2026-07-06");
    const stagesUsed = Object.values(p.solution).sort((a, b) => a - b);
    expect(stagesUsed).toEqual(
      Array.from({ length: p.stages }, (_, i) => i + 1),
    );
    expect(Object.keys(p.solution).length).toBe(p.stages);
    expect(p.gears.length).toBe(p.stages);
  });

  it("SOLVER-IGNORING-TRIVIA reaches the unique solution across many days", () => {
    for (let d = 0; d < 120; d++) {
      const { dayIndex, date } = day(19000 + d);
      const p = generateChronos(dayIndex, date);

      // The solver sees ONLY gear keys + constraints — never `cast`, `dialYear`,
      // `provenance`, or any other trivia field. A pure-reasoning player.
      const gearKeys = p.gears.map((g) => ({ key: g.key }));
      const sols = solveChronos(gearKeys, p.constraints, p.stages, 5);

      // exactly one legal assembly …
      expect(sols.length, `day ${date} must be uniquely solvable`).toBe(1);
      // … and it is the baked answer.
      expect(sols[0]).toEqual(p.solution);
    }
  });

  it("weekend boxes run one stage longer than weekdays", () => {
    const sat = generateChronos(1, day(1).dayIndex); // pick by weekday below
    // derive concrete weekday days
    const findDay = (wd: number) => {
      for (let d = 0; d < 14; d++) {
        const { dayIndex, date } = day(19000 + d);
        const p = generateChronos(dayIndex, date);
        if (p.weekday === wd) return p;
      }
      throw new Error("no such weekday in window");
    };
    void sat;
    expect(findDay(3).stages).toBe(4); // Wednesday
    expect(findDay(6).stages).toBe(5); // Saturday
  });
});
