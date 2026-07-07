import { describe, expect, it } from "vitest";
import { ANNIVERSARIES, anniversaryOfDay, mdOfDay } from "./anniversaries";
import { biasCluesByTheme, clueMatchesTheme, themedPick } from "./board";
import { pickTheme, themeByKey } from "./themes";
import type { Question } from "./types";

const clue = (prompt: string, correct: string): Question =>
  ({ qtype: "clue", category: "history", difficulty: 3, prompt, correct } as Question);

describe("anniversary pool", () => {
  it("is a large, well-formed pool", () => {
    expect(ANNIVERSARIES.length).toBeGreaterThanOrEqual(40);
    for (const a of ANNIVERSARIES) {
      expect(a.md).toMatch(/^\d{2}-\d{2}$/);
      expect(a.name).toBeTruthy();
      expect(a.blurb).toBeTruthy();
      expect(a.match.length).toBeGreaterThan(0);
    }
  });

  it("every anniversary names a real board skin (theme contract)", () => {
    for (const a of ANNIVERSARIES) expect(themeByKey(a.boardThemeKey)).toBeDefined();
  });
});

describe("mdOfDay / anniversaryOfDay", () => {
  it("is deterministic and derives the UTC calendar date", () => {
    // 1969-07-20 (moon landing) — day index for that UTC date
    const idx = Math.floor(Date.UTC(1969, 6, 20) / 86_400_000);
    expect(mdOfDay(idx)).toBe("07-20");
    const a = anniversaryOfDay(idx);
    expect(a?.name).toBe("Moon Landing");
    expect(anniversaryOfDay(idx)).toBe(a); // stable
  });

  it("returns undefined on an ordinary day", () => {
    // 08-12 has no bundled anniversary
    const idx = Math.floor(Date.UTC(2026, 7, 12) / 86_400_000);
    expect(anniversaryOfDay(idx)).toBeUndefined();
  });
});

describe("pickTheme with anniversaries", () => {
  it("borrows the skin but shows the anniversary name + blurb", () => {
    const idx = Math.floor(Date.UTC(1969, 6, 20) / 86_400_000);
    const t = pickTheme(idx);
    const skin = themeByKey("cosmos")!;
    expect(t.name).toBe("Moon Landing");
    expect(t.blurb).toBeTruthy();
    expect(t.glyph).toBe(skin.glyph); // visual skin preserved
    expect(t.match?.length).toBeGreaterThan(0);
  });

  it("falls back to a motif skin (no blurb) on ordinary days", () => {
    const idx = Math.floor(Date.UTC(2026, 7, 12) / 86_400_000);
    const t = pickTheme(idx);
    expect(t.blurb).toBeUndefined();
    expect(t.match).toBeUndefined();
  });
});

describe("theme-biased clue selection", () => {
  const clues = [
    clue("An off-theme empire clue.", "Rome"),
    clue("A rocket left the pad for the moon.", "Apollo"),
    clue("Another ordinary clue.", "Cairo"),
  ];

  it("clueMatchesTheme hits prompt/answer keywords, case-insensitively", () => {
    expect(clueMatchesTheme(clues[1], ["MOON"])).toBe(true);
    expect(clueMatchesTheme(clues[0], ["moon"])).toBe(false);
    expect(clueMatchesTheme(clues[0], undefined)).toBe(false);
  });

  it("biasCluesByTheme floats on-theme clues, no-op without keywords", () => {
    expect(biasCluesByTheme(clues, ["moon"])[0]).toBe(clues[1]);
    expect(biasCluesByTheme(clues, undefined)).toBe(clues);
  });

  it("themedPick prefers an on-theme clue, else the base pick", () => {
    const pick = themedPick(["moon"], (arr) => arr[0]);
    expect(pick(clues)).toBe(clues[1]); // on-theme preferred over the array head
    expect(pick([clues[0], clues[2]])).toBe(clues[0]); // none on-theme → base
  });
});
