import { describe, expect, it } from "vitest";
// relative import: vitest does not resolve the @/ alias used in app code.
import { titleFromSource, trackTitle, titledRows, buildChoices, DECOY_TITLES } from "./overture";
import { pickBankMelody } from "./synthBank";
import { mulberry32 } from "./rng";
import type { Question } from "./types";

const q = (source_url: string | null): Question => ({
  qtype: "audio_guess",
  category: "music",
  difficulty: 1,
  prompt: "x",
  correct: "1824",
  source_url,
});

describe("titleFromSource", () => {
  it("decodes a wiki slug into a title", () => {
    expect(titleFromSource("https://en.wikipedia.org/wiki/Ode_to_Joy")).toBe("Ode to Joy");
    expect(titleFromSource("https://en.wikipedia.org/wiki/Jingle_Bells")).toBe("Jingle Bells");
  });
  it("handles apostrophes and percent-escapes", () => {
    expect(titleFromSource("https://en.wikipedia.org/wiki/Beethoven's_Fifth_Symphony")).toBe(
      "Beethoven's Fifth Symphony",
    );
    expect(titleFromSource("https://en.wikipedia.org/wiki/F%C3%BCr_Elise")).toBe("Für Elise");
  });
  it("returns null when no title is derivable", () => {
    expect(titleFromSource(null)).toBeNull();
    expect(titleFromSource("")).toBeNull();
    expect(titleFromSource("https://www.deezer.com/track/12345")).toBeNull();
    expect(titleFromSource("https://en.wikipedia.org/wiki/")).toBeNull();
  });
});

describe("trackTitle", () => {
  it("prefers subject_a on a Deezer-preview row (real clip, unsluggable URL)", () => {
    const row: Question = {
      ...q("https://www.deezer.com/artist/42"),
      audio_url: "https://cdns-preview.dzcdn.net/stream/x.mp3",
      subject_a: "Billie Jean",
    };
    expect(trackTitle(row)).toBe("Billie Jean");
  });
  it("falls back to the wiki slug for a melody row (no audio_url)", () => {
    expect(trackTitle(q("https://en.wikipedia.org/wiki/Ode_to_Joy"))).toBe("Ode to Joy");
  });
  it("returns null for a Deezer row missing its title", () => {
    const row: Question = {
      ...q("https://www.deezer.com/artist/42"),
      audio_url: "https://cdns-preview.dzcdn.net/stream/x.mp3",
    };
    expect(trackTitle(row)).toBeNull();
  });
});

describe("titledRows", () => {
  it("keeps only rows with a derivable title (slug or preview subject_a)", () => {
    const preview: Question = {
      ...q("https://www.deezer.com/artist/9"),
      audio_url: "https://cdns-preview.dzcdn.net/stream/y.mp3",
      subject_a: "Billie Jean",
    };
    const rows = titledRows([
      q("https://en.wikipedia.org/wiki/Ode_to_Joy"),
      preview,
      q("https://www.deezer.com/track/1"), // deezer URL, no subject_a → dropped
      q(null),
    ]);
    expect(rows.map((r) => r.title).sort()).toEqual(["Billie Jean", "Ode to Joy"]);
  });
});

describe("pickBankMelody (offline synth fallback)", () => {
  it("selects a valid, non-empty melody from the committed bank", () => {
    const m = pickBankMelody(20260709); // a date-seed-shaped input
    expect(m.melody.length).toBeGreaterThan(0);
    expect(typeof m.title).toBe("string");
  });
  it("is deterministic — same seed picks the same melody every time", () => {
    expect(pickBankMelody(42)).toEqual(pickBankMelody(42));
  });
});

describe("DECOY_TITLES", () => {
  it("offers a broad, de-duplicated famous-song pool", () => {
    expect(DECOY_TITLES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(DECOY_TITLES).size).toBe(DECOY_TITLES.length);
  });
});

describe("buildChoices", () => {
  const rand = mulberry32(42);
  it("always includes the correct title", () => {
    const c = buildChoices("Ode to Joy", ["Jingle Bells", "Für Elise", "Happy Birthday"], rand);
    expect(c).toContain("Ode to Joy");
  });
  it("never duplicates a choice and respects the cap", () => {
    const c = buildChoices("A", ["B", "B", "C", "D", "E", "F"], rand, 4);
    expect(c).toHaveLength(4);
    expect(new Set(c).size).toBe(c.length);
  });
  it("degrades gracefully with a tiny pool", () => {
    const c = buildChoices("A", ["B"], rand, 4);
    expect(c).toHaveLength(2);
    expect(c).toContain("A");
    expect(c).toContain("B");
  });
  it("never leaks the correct title in as a distractor", () => {
    const c = buildChoices("A", ["A", "A", "B"], rand, 4);
    expect(c.filter((x) => x === "A")).toHaveLength(1);
  });
});
