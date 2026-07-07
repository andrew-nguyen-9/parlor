// ATLAS — constellation/asterism LOGIC puzzle (G5, wishlist #8). Replaces the
// GeoGuessr loop with a "read the omens" deduction over drawn star patterns.
//
// The player sees six constellations rendered as star-and-line figures and a
// short list of clues. EVERY clue is a purely STRUCTURAL, countable fact about
// the drawing — how many stars, whether the lines close into a loop, where the
// single brightest star sits — NEVER a fact of astronomy. Exactly one of the
// six patterns satisfies all the clues; that is the answer. No sky knowledge is
// required or rewarded: a player who has never heard of Orion solves it by
// counting and reasoning, exactly like The Séance.
//
// Offline/zero-env, per CLAUDE.md's THE MAP rule: the star catalog is committed
// JSON (`public/star-catalog.json`, the polygon-equivalent local fallback), and
// the generator is pure + date-seeded with the solution baked into the payload
// — no live API, no network, ever, at generate- or play-time.

import { mulberry32 } from "./rng";
import rawCatalog from "../public/star-catalog.json";

// ── Catalog shape (committed JSON) ──
interface CatalogStar {
  id: string;
  name: string;
  ra: number; // degrees 0..360 (J2000)
  dec: number; // degrees -90..90
  mag: number; // apparent magnitude, smaller = brighter
}
interface CatalogConstellation {
  id: string;
  name: string;
  hemisphere: string;
  stars: CatalogStar[];
  lines: [string, string][];
}
interface StarCatalog {
  source: string;
  license: string;
  constellations: CatalogConstellation[];
}

const CATALOG = rawCatalog as unknown as StarCatalog;

/** The committed catalog, exposed so tests can assert it loads offline. */
export function loadCatalog(): StarCatalog {
  return CATALOG;
}

// ── Puzzle payload (baked into the archive row / inline fallback) ──
export interface AtlasStar {
  id: string;
  /** Normalized position within this candidate's own frame (0..1). */
  x: number;
  y: number;
  mag: number;
}
export interface AtlasCandidate {
  /** Constellation id — also the answer token when this is the solution. */
  id: string;
  /** Flavor name, revealed only after the puzzle is solved. */
  name: string;
  stars: AtlasStar[];
  lines: [string, string][];
}
export type ClueKind = "count" | "parity" | "lines" | "loop" | "hub" | "split" | "bright";
export interface AtlasClue {
  id: string;
  kind: ClueKind;
  /** Encoded so the solver/UI can re-evaluate the clue against any candidate. */
  arg: number | boolean | string;
  /** Plain-language, astronomy-free statement shown to the player. */
  text: string;
}
export interface AtlasPuzzle {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  skyRegion: string; // flavor (table column: sky_region)
  seed: number;
  candidates: AtlasCandidate[];
  clues: AtlasClue[];
  /** Candidate id that uniquely satisfies every clue. */
  solution: string;
}

// ── Structural analysis (the ONLY thing clues ever read — no astronomy) ──
interface Analysis {
  starCount: number;
  lineCount: number;
  hasLoop: boolean;
  hasHub: boolean; // some star with 3+ lines
  components: number; // connected pieces
  brightDeg: number; // # lines touching the single brightest star
}

/** Pure structural fingerprint of a candidate — derived from stars+lines only. */
export function analyze(c: AtlasCandidate): Analysis {
  const ids = c.stars.map((s) => s.id);
  const deg: Record<string, number> = Object.fromEntries(ids.map((i) => [i, 0]));
  const parent: Record<string, string> = Object.fromEntries(ids.map((i) => [i, i]));
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  let hasLoop = false;
  for (const [a, b] of c.lines) {
    deg[a] = (deg[a] ?? 0) + 1;
    deg[b] = (deg[b] ?? 0) + 1;
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) hasLoop = true;
    else parent[ra] = rb;
  }
  const roots = new Set(ids.map(find));
  const brightest = c.stars.reduce((m, s) => (s.mag < m.mag ? s : m), c.stars[0]);
  const maxDeg = ids.reduce((m, i) => Math.max(m, deg[i]), 0);
  return {
    starCount: ids.length,
    lineCount: c.lines.length,
    hasLoop,
    hasHub: maxDeg >= 3,
    components: roots.size,
    brightDeg: deg[brightest.id] ?? 0,
  };
}

const brightCat = (d: number): "tip" | "mid" | "junction" =>
  d <= 1 ? "tip" : d === 2 ? "mid" : "junction";

/** True iff `candidate` satisfies `clue` — pure, re-derivable (used by the solver + UI). */
export function clueHolds(clue: AtlasClue, c: AtlasCandidate): boolean {
  const a = analyze(c);
  switch (clue.kind) {
    case "count":
      return a.starCount === clue.arg;
    case "parity":
      return a.starCount % 2 === clue.arg;
    case "lines":
      return a.lineCount === clue.arg;
    case "loop":
      return a.hasLoop === clue.arg;
    case "hub":
      return a.hasHub === clue.arg;
    case "split":
      return a.components > 1 === clue.arg;
    case "bright":
      return brightCat(a.brightDeg) === clue.arg;
  }
}

/** Ids of every candidate that matches ALL clues. A valid puzzle ⇒ exactly the solution. */
export function candidatesSatisfying(p: AtlasPuzzle): string[] {
  return p.candidates.filter((c) => p.clues.every((cl) => clueHolds(cl, c))).map((c) => c.id);
}

// ── Clue text (astronomy-free, one phrasing per kind/arg) ──
const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const numWord = (n: number) => NUM[n] ?? String(n);

function clueText(kind: ClueKind, arg: number | boolean | string): string {
  switch (kind) {
    case "count":
      return `It is drawn from exactly ${numWord(arg as number)} stars.`;
    case "parity":
      return `It is drawn from an ${arg === 1 ? "odd" : "even"} number of stars.`;
    case "lines":
      return `Exactly ${numWord(arg as number)} lines connect its stars.`;
    case "loop":
      return arg
        ? "Somewhere its lines close back on themselves into a loop."
        : "Not one of its lines ever closes into a loop.";
    case "hub":
      return arg
        ? "At least one star gathers three or more lines to itself."
        : "No single star gathers more than two lines.";
    case "split":
      return arg
        ? "Its stars fall into two separate strokes that never touch."
        : "All of its stars hang together in one unbroken figure.";
    case "bright":
      return arg === "tip"
        ? "Its single brightest star sits at a tip, touched by just one line."
        : arg === "mid"
          ? "Its single brightest star lies mid-figure, with exactly two lines through it."
          : "Its single brightest star sits where three or more lines meet.";
  }
}

// Full slate of candidate clues that are TRUE for the target. If a decoy's
// fingerprint differs from the target's on ANY dimension, at least one of these
// clues is FALSE for it — so this slate always suffices to isolate the target.
function targetClues(a: Analysis): { kind: ClueKind; arg: number | boolean | string }[] {
  return [
    { kind: "count", arg: a.starCount },
    { kind: "lines", arg: a.lineCount },
    { kind: "loop", arg: a.hasLoop },
    { kind: "hub", arg: a.hasHub },
    { kind: "split", arg: a.components > 1 },
    { kind: "bright", arg: brightCat(a.brightDeg) },
    { kind: "parity", arg: a.starCount % 2 },
  ];
}

// Two candidates that agree on all of these can't be separated by any clue.
const fingerprint = (a: Analysis) =>
  [a.starCount, a.lineCount, a.hasLoop, a.hasHub, a.components > 1, brightCat(a.brightDeg)].join("|");

// ── Projection: constellation → normalized frame (unwraps the 0h/24h RA seam) ──
function toCandidate(con: CatalogConstellation): AtlasCandidate {
  const ref = con.stars[0].ra;
  const pts = con.stars.map((s) => {
    let ra = s.ra;
    if (ra - ref > 180) ra -= 360;
    else if (ra - ref < -180) ra += 360;
    // Sky convention: RA increases to the east (left), Dec up. Flip x so the
    // figure reads the familiar way; exact orientation is irrelevant to the logic.
    return { id: s.id, mag: s.mag, px: -ra, py: s.dec };
  });
  const xs = pts.map((p) => p.px);
  const ys = pts.map((p) => p.py);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY, 1e-6);
  // Center within a unit box with 12% padding, preserving aspect ratio.
  const pad = 0.12;
  const scale = (1 - 2 * pad) / span;
  const offX = pad + (1 - 2 * pad - (maxX - minX) * scale) / 2;
  const offY = pad + (1 - 2 * pad - (maxY - minY) * scale) / 2;
  return {
    id: con.id,
    name: con.name,
    stars: pts.map((p) => ({
      id: p.id,
      mag: p.mag,
      x: offX + (p.px - minX) * scale,
      // SVG y grows downward; higher Dec should sit higher ⇒ invert.
      y: 1 - (offY + (p.py - minY) * scale),
    })),
    lines: con.lines,
  };
}

const N_CANDIDATES = 6;

const SKY_REGIONS = [
  "the northern vault",
  "the river of the ecliptic",
  "the southern deep",
  "the zenith crown",
  "the winter gate",
  "the summer meridian",
  "the wandering marches",
  "the polar wheel",
];

export function generateAtlas(dayIndex: number, date: string): AtlasPuzzle {
  const seed = (dayIndex ^ 0xa715) >>> 0;
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();

  const cons = CATALOG.constellations;
  const analyses = new Map(cons.map((c) => [c.id, analyze(toCandidate(c))]));

  // Deterministic order of the whole pool for this day.
  const rand = mulberry32(seed);
  const order = cons
    .map((c) => ({ c, k: rand() }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.c);

  // Target = first in the shuffled order. Decoys = the next constellations whose
  // structural fingerprint differs from the target's (so the clue slate can
  // always isolate the target — guaranteeing a unique solution).
  const target = order[0];
  const tFp = fingerprint(analyses.get(target.id)!);
  const decoys: CatalogConstellation[] = [];
  for (let i = 1; i < order.length && decoys.length < N_CANDIDATES - 1; i++) {
    if (fingerprint(analyses.get(order[i].id)!) !== tFp) decoys.push(order[i]);
  }

  const chosen = [target, ...decoys];
  // Present the candidates in a day-shuffled order so the answer isn't always first.
  const candidates = chosen
    .map((c) => ({ con: c, k: rand() }))
    .sort((a, b) => a.k - b.k)
    .map((o) => toCandidate(o.con));

  // Build the clue slate that isolates the target, then greedily trim to the
  // smallest subset that still leaves exactly one match (the target).
  const tAnalysis = analyses.get(target.id)!;
  const pool: AtlasClue[] = targetClues(tAnalysis).map((c, i) => ({
    id: `c${i}`,
    kind: c.kind,
    arg: c.arg,
    text: clueText(c.kind, c.arg),
  }));

  // Greedy minimal cover: repeatedly add the clue that eliminates the most
  // still-surviving decoys, until only the target remains.
  const targetCand = candidates.find((c) => c.id === target.id)!;
  let survivors = candidates.map((c) => c.id);
  const picked: AtlasClue[] = [];
  const remaining = [...pool];
  while (survivors.length > 1 && remaining.length > 0) {
    let bestIdx = 0;
    let bestElim = -1;
    for (let i = 0; i < remaining.length; i++) {
      const cl = remaining[i];
      const after = survivors.filter((id) => clueHolds(cl, candidates.find((c) => c.id === id)!));
      const elim = survivors.length - after.length;
      if (elim > bestElim) {
        bestElim = elim;
        bestIdx = i;
      }
    }
    const cl = remaining.splice(bestIdx, 1)[0];
    picked.push(cl);
    survivors = survivors.filter((id) => clueHolds(cl, candidates.find((c) => c.id === id)!));
  }

  // Texture: keep at least three clues (Séance-level). Pad with unused clues
  // that hold for the target — they can only further confirm the unique answer.
  for (const cl of remaining) {
    if (picked.length >= 3) break;
    if (clueHolds(cl, targetCand)) picked.push(cl);
  }
  // Stable re-id for display.
  const clues = picked.map((cl, i) => ({ ...cl, id: `clue-${i + 1}` }));

  const skyRegion = SKY_REGIONS[Math.abs(seed) % SKY_REGIONS.length];

  return {
    date,
    weekday,
    skyRegion,
    seed,
    candidates,
    clues,
    solution: target.id,
  };
}
