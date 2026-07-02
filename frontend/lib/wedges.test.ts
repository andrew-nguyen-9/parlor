import { describe, expect, it } from "vitest";
import { dailyOrder } from "./rng";
import {
  buildDailyWedges,
  shatterMirror,
  ghostQuip,
  wedgeShareLine,
  wedgeShareText,
  PER_CATEGORY_MAIN,
  PER_CATEGORY_BONUS,
  GHOST_QUIPS,
} from "./wedges";
import { CATEGORIES, type Question } from "./types";

function q(category: string, prompt: string): Question {
  return {
    qtype: "multiple_choice",
    category: category as Question["category"],
    difficulty: 1,
    prompt,
    correct: "a",
    choices: ["a", "b", "c", "d"],
  };
}

// A pool with plenty of volume per category.
function pool(): Question[] {
  const out: Question[] = [];
  for (const c of CATEGORIES) {
    for (let i = 0; i < 10; i++) out.push(q(c, `${c}-${i}`));
  }
  return out;
}

describe("dailyOrder (shared daily order)", () => {
  it("is identical for two players on the same date", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g"];
    const p1 = dailyOrder("history", items, 20000);
    const p2 = dailyOrder("history", items, 20000);
    expect(p1).toEqual(p2);
  });

  it("returns a permutation (every question exactly once, no drops/dupes)", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g"];
    const ordered = dailyOrder("music", items, 20000);
    expect([...ordered].sort()).toEqual([...items].sort());
  });

  it("rotates day-to-day but keys diverge per category", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g"];
    expect(dailyOrder("history", items, 20000)).not.toEqual(
      dailyOrder("history", items, 20001),
    );
    expect(dailyOrder("history", items, 20000)).not.toEqual(
      dailyOrder("music", items, 20000),
    );
  });

  it("is empty-safe", () => {
    expect(dailyOrder("history", [], 20000)).toEqual([]);
  });
});

describe("buildDailyWedges (lockout + bonus partitioning)", () => {
  it("is deterministic for a fixed (pool, day)", () => {
    const a = buildDailyWedges(pool(), 20000);
    const b = buildDailyWedges(pool(), 20000);
    expect(a).toEqual(b);
  });

  it("serves exactly PER_CATEGORY_MAIN per category, in daily order", () => {
    const w = buildDailyWedges(pool(), 20000);
    for (const c of CATEGORIES) {
      expect(w.served[c]).toHaveLength(PER_CATEGORY_MAIN);
      expect(w.served[c]).toEqual(w.order[c].slice(0, PER_CATEGORY_MAIN));
    }
  });

  it("bonus is the capped never-served slice (no overlap, ≤ cap per category)", () => {
    const w = buildDailyWedges(pool(), 20000);
    const servedSet = new Set<string>();
    for (const c of CATEGORIES) for (const s of w.served[c]) servedSet.add(s.prompt);
    // no bonus question was already served in the main round
    for (const b of w.bonus) expect(servedSet.has(b.prompt)).toBe(false);
    // each category contributes at most PER_CATEGORY_BONUS, drawn straight after
    // its served slice; total bonus is capped, not the whole remainder
    for (const c of CATEGORIES) {
      const expected = w.order[c].slice(
        PER_CATEGORY_MAIN,
        PER_CATEGORY_MAIN + PER_CATEGORY_BONUS,
      );
      const got = w.bonus.filter((b) => b.category === c).map((b) => b.prompt);
      expect(got).toEqual(expected.map((s) => s.prompt));
    }
    expect(w.bonus.length).toBeLessThanOrEqual(CATEGORIES.length * PER_CATEGORY_BONUS);
  });
});

describe("shatterMirror", () => {
  it("is deterministic per day and yields six category shards", () => {
    const a = shatterMirror(20000);
    const b = shatterMirror(20000);
    expect(a).toEqual(b);
    expect(a.map((s) => s.category)).toEqual(CATEGORIES);
  });

  it("cracks along different fault lines on different days", () => {
    expect(shatterMirror(20000)).not.toEqual(shatterMirror(20001));
  });
});

describe("ghostQuip", () => {
  it("is deterministic for the same salt and stays in range", () => {
    expect(ghostQuip("miss-x")).toBe(ghostQuip("miss-x"));
    expect(GHOST_QUIPS).toContain(ghostQuip("anything"));
  });
});

describe("wedgeShareLine / wedgeShareText", () => {
  it("shows a colour square per earned category, in CATEGORIES order", () => {
    const earned = new Set<(typeof CATEGORIES)[number]>(CATEGORIES);
    const line = wedgeShareLine(earned);
    expect([...line]).toHaveLength(6);
    expect(line).not.toContain("❌");
  });

  it("shows ❌ for each missing wedge on an incomplete game", () => {
    const earned = new Set<(typeof CATEGORIES)[number]>(["sports", "music"]);
    const line = wedgeShareLine(earned);
    expect([...line].filter((c) => c === "❌")).toHaveLength(4);
    expect([...line].filter((c) => c !== "❌")).toHaveLength(2);
  });

  it("appends the question count, singular vs plural", () => {
    const earned = new Set<(typeof CATEGORIES)[number]>(CATEGORIES);
    expect(wedgeShareText(earned, 1)).toContain("in 1 question");
    expect(wedgeShareText(earned, 9)).toContain("in 9 questions");
    expect(wedgeShareText(earned, 9)).toContain(wedgeShareLine(earned));
  });
});
