// IGNITE — rune substitution/cipher logic engine (G4).
//
// The Witch inscribes an incantation in runes. Each rune stands for exactly one
// letter (a bijection glyph→letter over the incantation's distinct letters). A
// minimal set of clues — anchors, vowel/consonant marks, alphabet-order and
// neighbour relations — determines the mapping UNIQUELY. Cracking the map lights
// the inscription. Pure + date-seeded; the solution is baked into the payload
// and there is NO solve-time RNG (mirrors generateSeance).
//
// Rune sets are Unicode (Runic / Ogham / Phoenician blocks). Solvability does
// NOT depend on the font rendering a glyph: every clue names each rune by its
// transliteration ("Fehu ᚠ"), so a tofu box never makes a clue ambiguous. That
// is why no SVG glyphs are bundled — the named-rune scheme is offline-robust.
//
// F6 stub: `IgnitePuzzle` / `generateIgnite` NAME + SIGNATURE are STABLE.

import { mulberry32, shuffled } from "./rng";

export type IgniteClueType =
  | "anchor"
  | "vowel"
  | "consonant"
  | "before"
  | "adjacent"
  | "not";

export interface IgniteGlyph {
  rune: string; // the Unicode rune (may tofu on font-poor systems — clues still name it)
  name: string; // transliteration; always legible, referenced by every clue
}

export interface IgniteClue {
  type: IgniteClueType;
  glyphs: number[]; // glyph indices referenced (1 or 2)
  letter?: string; // named letter (anchor / not)
  text: string; // rendered, human-readable clue
}

export interface IgnitePuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  runeSet: string; // flavor (table column: rune_set), e.g. "Elder Futhark"
  incantation: string; // plaintext answer word, e.g. "CINDER"
  letters: string[]; // distinct letters, A→Z sorted — the alphabet in play (length K)
  glyphs: IgniteGlyph[]; // K rune tiles, display order (shuffled)
  cipher: number[]; // incantation spelled as glyph indices (the inscription)
  clues: IgniteClue[]; // minimal, uniquely-solving clue set
  // solution[glyphIndex] = index into `letters`. Baked in so the client can
  // validate offline; cheating a logic puzzle isn't worth a server round-trip.
  solution: number[];
  seed: number;
}

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);
const isVowel = (c: string) => VOWELS.has(c);
const code = (c: string) => c.charCodeAt(0); // A→Z ordering

// ── Rune sets: Unicode-renderable blocks, each glyph paired with its standard
// transliteration so clues stay legible even when a font can't draw the rune. ──
interface RuneSet {
  name: string;
  glyphs: IgniteGlyph[];
}

const RUNE_SETS: RuneSet[] = [
  {
    name: "Elder Futhark",
    glyphs: [
      { rune: "ᚠ", name: "Fehu" },
      { rune: "ᚢ", name: "Uruz" },
      { rune: "ᚦ", name: "Thurisaz" },
      { rune: "ᚨ", name: "Ansuz" },
      { rune: "ᚱ", name: "Raidho" },
      { rune: "ᚲ", name: "Kaunan" },
      { rune: "ᚷ", name: "Gebo" },
      { rune: "ᚹ", name: "Wunjo" },
      { rune: "ᚾ", name: "Nauthiz" },
      { rune: "ᛁ", name: "Isa" },
      { rune: "ᛃ", name: "Jera" },
      { rune: "ᛊ", name: "Sowilo" },
      { rune: "ᛏ", name: "Tiwaz" },
      { rune: "ᛒ", name: "Berkanan" },
    ],
  },
  {
    name: "Anglo-Saxon Futhorc",
    glyphs: [
      { rune: "ᚫ", name: "Aesc" },
      { rune: "ᚩ", name: "Os" },
      { rune: "ᚷ", name: "Gyfu" },
      { rune: "ᚻ", name: "Haegl" },
      { rune: "ᚹ", name: "Wynn" },
      { rune: "ᛒ", name: "Beorc" },
      { rune: "ᛖ", name: "Eh" },
      { rune: "ᛗ", name: "Mann" },
      { rune: "ᛚ", name: "Lagu" },
      { rune: "ᛝ", name: "Ing" },
      { rune: "ᛞ", name: "Daeg" },
      { rune: "ᚳ", name: "Cen" },
      { rune: "ᚱ", name: "Rad" },
      { rune: "ᚦ", name: "Thorn" },
    ],
  },
  {
    name: "Ogham",
    glyphs: [
      { rune: "ᚁ", name: "Beith" },
      { rune: "ᚂ", name: "Luis" },
      { rune: "ᚃ", name: "Fearn" },
      { rune: "ᚄ", name: "Sail" },
      { rune: "ᚅ", name: "Nion" },
      { rune: "ᚆ", name: "Uath" },
      { rune: "ᚇ", name: "Dair" },
      { rune: "ᚈ", name: "Tinne" },
      { rune: "ᚉ", name: "Coll" },
      { rune: "ᚋ", name: "Muin" },
      { rune: "ᚌ", name: "Gort" },
      { rune: "ᚏ", name: "Ruis" },
      { rune: "ᚐ", name: "Ailm" },
      { rune: "ᚑ", name: "Onn" },
    ],
  },
  {
    name: "Phoenician",
    glyphs: [
      { rune: "𐤀", name: "Aleph" },
      { rune: "𐤁", name: "Beth" },
      { rune: "𐤂", name: "Gimel" },
      { rune: "𐤃", name: "Daleth" },
      { rune: "𐤄", name: "He" },
      { rune: "𐤅", name: "Waw" },
      { rune: "𐤆", name: "Zayin" },
      { rune: "𐤈", name: "Teth" },
      { rune: "𐤉", name: "Yodh" },
      { rune: "𐤊", name: "Kaph" },
      { rune: "𐤋", name: "Lamedh" },
      { rune: "𐤌", name: "Mem" },
      { rune: "𐤍", name: "Nun" },
      { rune: "𐤒", name: "Qoph" },
    ],
  },
];

// ── Incantation pool, bucketed by distinct-letter count K (fire/rune themed).
// The distinct letters ARE the alphabet the player must map. Every word carries
// at least one vowel and one consonant so property clues are meaningful. ──
const INCANTATIONS: Record<number, string[]> = {
  4: ["PYRE", "COAL", "BURN", "GLOW", "CHAR", "EMBER"],
  5: ["FLAME", "SPARK", "BLAZE", "TORCH", "ASHEN", "SINGE"],
  6: ["CINDER", "KINDLE", "CANDLE", "MOLTEN", "BRAZIER"],
  7: ["FURNACE", "SMOLDER", "WILDFIRE", "PHOENIX", "CRUCIBLE"],
};

// Distinct-letter count K per weekday (0=Sun..6=Sat): weekends run hotter.
const WEEKDAY_K = [7, 4, 4, 5, 5, 6, 6];

const distinctSorted = (w: string): string[] =>
  [...new Set(w.split(""))].sort((a, b) => code(a) - code(b));

// Evaluate a single clue against a full glyph→letter assignment.
function checkClue(clue: IgniteClue, assign: number[], letters: string[]): boolean {
  const g = clue.glyphs;
  switch (clue.type) {
    case "anchor":
      return letters[assign[g[0]]] === clue.letter;
    case "not":
      return letters[assign[g[0]]] !== clue.letter;
    case "vowel":
      return isVowel(letters[assign[g[0]]]);
    case "consonant":
      return !isVowel(letters[assign[g[0]]]);
    case "before":
      return code(letters[assign[g[0]]]) < code(letters[assign[g[1]]]);
    case "adjacent":
      return code(letters[assign[g[1]]]) - code(letters[assign[g[0]]]) === 1;
  }
}

// Count solutions consistent with the clue set, short-circuiting at 2 (all we
// need to test uniqueness). Backtracking over glyph→letter bijections, checking
// each clue as soon as all its referenced glyphs are assigned.
function countSolutions(clues: IgniteClue[], letters: string[]): number {
  const K = letters.length;
  // clues grouped by the highest glyph index they reference → checked at that depth.
  const atDepth: IgniteClue[][] = Array.from({ length: K }, () => []);
  for (const c of clues) atDepth[Math.max(...c.glyphs)].push(c);

  const assign = new Array(K).fill(-1);
  const usedLetter = new Array(K).fill(false);
  let count = 0;

  const recurse = (g: number): boolean => {
    if (g === K) {
      count++;
      return count >= 2; // signal "stop" once we know it isn't unique
    }
    for (let l = 0; l < K; l++) {
      if (usedLetter[l]) continue;
      assign[g] = l;
      usedLetter[l] = true;
      const ok = atDepth[g].every((c) => checkClue(c, assign, letters));
      if (ok && recurse(g + 1)) return true;
      usedLetter[l] = false;
      assign[g] = -1;
    }
    return false;
  };
  recurse(0);
  return count;
}

// Removal preference: attempt to drop cheap/blunt clues first so the surviving
// minimal set favours relational reasoning over give-away anchors.
const REMOVE_ORDER: Record<IgniteClueType, number> = {
  anchor: 0,
  not: 1,
  before: 2,
  adjacent: 3,
  consonant: 4,
  vowel: 5,
};
// Display preference: lead with the firmest clues for readability.
const DISPLAY_ORDER: Record<IgniteClueType, number> = {
  anchor: 0,
  vowel: 1,
  consonant: 2,
  adjacent: 3,
  before: 4,
  not: 5,
};

const named = (glyphs: IgniteGlyph[], i: number) => `${glyphs[i].name} ${glyphs[i].rune}`;

function clueText(c: IgniteClue, glyphs: IgniteGlyph[]): string {
  const a = named(glyphs, c.glyphs[0]);
  switch (c.type) {
    case "anchor":
      return `${a} inscribes the letter ${c.letter}.`;
    case "not":
      return `${a} is not the letter ${c.letter}.`;
    case "vowel":
      return `${a} marks a vowel.`;
    case "consonant":
      return `${a} marks a consonant.`;
    case "before":
      return `${a} comes before ${named(glyphs, c.glyphs[1])} in the alphabet.`;
    case "adjacent":
      return `${a} and ${named(glyphs, c.glyphs[1])} are neighbours in the alphabet (${glyphs[c.glyphs[0]].name} the earlier).`;
  }
}

export function generateIgnite(dayIndex: number, date: string): IgnitePuzzle {
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();
  const seed = (dayIndex ^ 0x19ee) >>> 0;
  const rand = mulberry32(seed);

  const K = WEEKDAY_K[weekday];
  const incantation = shuffled(INCANTATIONS[K], rand)[0];
  const letters = distinctSorted(incantation); // length K

  const set = RUNE_SETS[Math.floor(dayIndex / 3) % RUNE_SETS.length];
  const glyphs = shuffled(set.glyphs, rand).slice(0, K);

  // solution[g] = letter index. A seeded bijection glyph→letter.
  const perm = shuffled(
    Array.from({ length: K }, (_, i) => i),
    rand,
  );
  const solution = perm.slice();

  // letter → glyph index (inverse of solution), used to spell the inscription.
  const glyphOfLetter = new Array(K);
  for (let g = 0; g < K; g++) glyphOfLetter[solution[g]] = g;
  const cipher = incantation
    .split("")
    .map((ch) => glyphOfLetter[letters.indexOf(ch)]);

  // ── Candidate clue pool. Includes every anchor, so the full pool is trivially
  // unique; subtraction then pares it to a minimal, still-unique set. ──
  const letterOf = (g: number) => letters[solution[g]];
  const candidates: IgniteClue[] = [];
  for (let g = 0; g < K; g++) {
    candidates.push({ type: "anchor", glyphs: [g], letter: letterOf(g), text: "" });
    candidates.push({
      type: isVowel(letterOf(g)) ? "vowel" : "consonant",
      glyphs: [g],
      text: "",
    });
  }
  for (let a = 0; a < K; a++) {
    for (let b = 0; b < K; b++) {
      if (a === b) continue;
      if (code(letterOf(a)) < code(letterOf(b))) {
        candidates.push({ type: "before", glyphs: [a, b], text: "" });
        if (code(letterOf(b)) - code(letterOf(a)) === 1) {
          candidates.push({ type: "adjacent", glyphs: [a, b], text: "" });
        }
      }
    }
  }
  // a few elimination clues
  for (let g = 0; g < K; g++) {
    const others = letters.filter((l) => l !== letterOf(g));
    if (others.length) {
      candidates.push({
        type: "not",
        glyphs: [g],
        letter: shuffled(others, rand)[0],
        text: "",
      });
    }
  }

  // Subtraction Method: seeded shuffle, order removals cheap-first, drop any clue
  // whose absence still leaves exactly one solution.
  const ordered = shuffled(candidates, rand).sort(
    (x, y) => REMOVE_ORDER[x.type] - REMOVE_ORDER[y.type],
  );
  let clues = ordered;
  for (const cand of ordered) {
    const trial = clues.filter((c) => c !== cand);
    if (countSolutions(trial, letters) === 1) clues = trial;
  }

  // Final display order + rendered text.
  clues = [...clues]
    .sort((x, y) => DISPLAY_ORDER[x.type] - DISPLAY_ORDER[y.type])
    .map((c) => ({ ...c, text: clueText(c, glyphs) }));

  return {
    date,
    weekday,
    runeSet: set.name,
    incantation,
    letters,
    glyphs,
    cipher,
    clues,
    solution,
    seed,
  };
}
