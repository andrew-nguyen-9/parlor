import { describe, it, expect } from "vitest";
import {
  generateMystery,
  clueHolds,
  clueMatches,
  solutionCount,
  uniqueSolution,
  liveValues,
  clueReliability,
  isMinimal,
  isLoadBearing,
  minimumClueCount,
  solvabilityProof,
  caseIntro,
  type MysteryPuzzle,
} from "./mysteryPuzzle";

// N per weekday (mirrors WEEKDAY_N in the engine).
const N_FOR = (weekday: number) => ({ 1: 3, 2: 3, 3: 4, 4: 4, 5: 5, 6: 5, 0: 5 }[weekday]!);

// A representative week + a spread of indices — every weekday shape gets exercised.
const DAYS = [
  "2026-07-06", // Mon N=3
  "2026-07-07", // Tue N=3
  "2026-07-08", // Wed N=4
  "2026-07-09", // Thu N=4
  "2026-07-10", // Fri N=5
  "2026-07-11", // Sat N=5
  "2026-07-12", // Sun N=5
];

// Generate the sample corpus ONCE (subtraction-method generation is the costly
// part); every property test then reads over the cached puzzles.
const PUZZLES: MysteryPuzzle[] = Array.from({ length: 140 }, (_, i) =>
  generateMystery(20000 + i, DAYS[i % DAYS.length]),
);

function eachDay(fn: (p: MysteryPuzzle, i: number) => void) {
  PUZZLES.forEach((p, i) => fn(p, i));
}

describe("generateMystery (G1 engine)", () => {
  it("returns a valid, well-shaped puzzle", () => {
    const p = generateMystery(20000, "2026-07-06");
    expect(p.date).toBe("2026-07-06");
    expect(p.weekday).toBe(1); // Monday
    expect(p.caseName.length).toBeGreaterThan(0);
    expect(Number.isInteger(p.seed)).toBe(true);
    expect(p.suspects).toHaveLength(3);
    expect(p.locations).toHaveLength(3);
    expect(p.times).toHaveLength(3);
    expect(p.clues.length).toBeGreaterThan(0);
    expect(p.clues.every((c) => typeof c.text === "string" && c.text.length > 0)).toBe(true);
  });

  it("is deterministic for a fixed dayIndex + date", () => {
    expect(generateMystery(20000, "2026-07-06")).toEqual(
      generateMystery(20000, "2026-07-06"),
    );
  });

  it("grid dimension scales with the weekday", () => {
    for (const date of DAYS) {
      const p = generateMystery(1234, date);
      const n = N_FOR(p.weekday);
      expect(p.suspects).toHaveLength(n);
      expect(p.locations).toHaveLength(n);
      expect(p.times).toHaveLength(n);
    }
  });

  it("the baked solution satisfies EVERY clue", () => {
    eachDay((p) => {
      const { suspect, location, time } = p.solution;
      expect(p.clues.every((c) => clueHolds(c, suspect, location, time))).toBe(true);
    });
  });

  it("the clue set admits EXACTLY ONE solution (unique)", () => {
    eachDay((p) => {
      const n = p.suspects.length;
      expect(solutionCount(p.clues, n)).toBe(1);
      expect(uniqueSolution(p.clues, n)).toEqual(p.solution);
    });
  });

  it("is solvable by pure elimination — every non-answer value is provably dead", () => {
    // Uniqueness means only the solution triple survives, so each axis has exactly
    // one live value (the answer) and every other value is eliminated by the clues.
    eachDay((p) => {
      const n = p.suspects.length;
      const live = liveValues(p.clues, n);
      const onlyLive = (arr: boolean[], answer: number) =>
        arr.filter(Boolean).length === 1 && arr[answer] === true;
      expect(onlyLive(live.suspects, p.solution.suspect)).toBe(true);
      expect(onlyLive(live.locations, p.solution.location)).toBe(true);
      expect(onlyLive(live.times, p.solution.time)).toBe(true);
    });
  });

  it("no single clue solves the case alone (fair — Séance-level)", () => {
    eachDay((p) => {
      const n = p.suspects.length;
      expect(p.clues.length).toBeGreaterThan(1);
      for (const c of p.clues) {
        expect(solutionCount([c], n)).toBeGreaterThan(1);
      }
    });
  });
});

describe("minimality + solvability proof (Q3.5 / Q4.2 / Q6.4)", () => {
  it("the shipped clue set is MINIMAL — every clue is load-bearing", () => {
    eachDay((p) => {
      const n = p.suspects.length;
      expect(isMinimal(p.clues, n)).toBe(true);
      // and concretely: removing any single clue re-admits ≥2 triples
      for (const c of p.clues) expect(isLoadBearing(p.clues, c, n)).toBe(true);
    });
  });

  it("minimumClueCount is the shipped clue count (the calculated minimum)", () => {
    eachDay((p) => {
      expect(minimumClueCount(p)).toBe(p.clues.length);
    });
  });

  it("solvabilityProof names the true triple and the minimum, spoiler-safe post-solve", () => {
    eachDay((p) => {
      const proof = solvabilityProof(p);
      expect(proof.length).toBe(3);
      const joined = proof.join(" ");
      expect(joined).toContain(String(p.clues.length));
      expect(joined).toContain(p.suspects[p.solution.suspect]);
      expect(joined).toContain(p.locations[p.solution.location]);
      expect(joined).toContain(p.times[p.solution.time]);
    });
  });
});

describe("clueReliability (Q2.5 credibility badge)", () => {
  it("classifies every clue kind as forensic or witness", () => {
    eachDay((p) => {
      for (const c of p.clues) {
        expect(["forensic", "witness"]).toContain(clueReliability(c.kind));
      }
    });
  });
});

describe("caseIntro (Q1.3 scene-setter)", () => {
  it("is deterministic per puzzle and reads as a multi-sentence framing", () => {
    const p = generateMystery(20000, "2026-07-06");
    const a = caseIntro(p);
    expect(a).toBe(caseIntro(p)); // pure over the seed
    expect(a).toContain(p.caseName);
    expect(a.split(". ").length).toBeGreaterThanOrEqual(3); // 2–3+ sentences
  });
});

describe("clueMatches (E6 · Case File search/filter)", () => {
  const p = generateMystery(20000, "2026-07-06");

  it("empty search + 'all' filter passes every clue", () => {
    expect(p.clues.every((c) => clueMatches(c, "", "all"))).toBe(true);
  });

  it("search matches clue text case-insensitively", () => {
    const target = p.clues[0];
    const needle = target.text.slice(2, 8);
    expect(clueMatches(target, needle.toUpperCase(), "all")).toBe(true);
    expect(clueMatches(target, "xyz-not-present-zzz", "all")).toBe(false);
  });

  it("axis filters only pass clues touching that axis", () => {
    for (const c of p.clues) {
      expect(clueMatches(c, "", "suspects")).toBe(c.s !== undefined);
      expect(clueMatches(c, "", "locations")).toBe(c.r !== undefined);
      expect(clueMatches(c, "", "times")).toBe(c.h !== undefined);
    }
  });

  it("search and filter combine (AND)", () => {
    const c = p.clues.find((cl) => cl.s !== undefined);
    if (!c) return;
    expect(clueMatches(c, c.text, "suspects")).toBe(true);
    expect(clueMatches(c, "xyz-not-present-zzz", "suspects")).toBe(false);
  });
});
