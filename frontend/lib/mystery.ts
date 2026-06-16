// ─────────────────────────────────────────────────────────────────────────────
// THE PARLOR CASE — a daily social-deduction mystery.
//
// Design ethos (à la CluesBySam): every day must FEEL handcrafted, but under the
// hood it is a pure function of the date. No LLM, no API, no tokens — the whole
// case (cast, victim, culprits, relationships, alibis, clues, prose) is derived
// deterministically from `seedFromDate(date)`. The same date yields the same
// "Case #N" for every player, forever, and regenerates from nothing but the date.
//
// Solvability: this is a real WHO + WHERE + WHEN logic puzzle.
// - WHO: innocents' claimed location at the murder hour is always the truth
//   (never the scene); culprits' claim is a lie (their true location at that
//   hour is the scene). `deduceCulprits()` reads this off `Dossier.trueLocation`
//   vs `Dossier.claimed` directly — no relationship-graph guessing involved.
// - WHERE / WHEN: four of the seven clues each rule out a set of rooms or hours
//   entirely (`Clue.eliminatesRooms` / `eliminatesHours`). Together they're
//   constructed to eliminate every room but the true scene and every hour but
//   the true murder hour. `deductionMatrix()` renders the running state of that
//   elimination as a room×hour grid; the one cell that survives both an
//   un-eliminated row and an un-eliminated column is `"confirmed"`.
// `verifySolvable()` (used by the room + lib/mystery.test.ts) checks all three.
// ─────────────────────────────────────────────────────────────────────────────

import { mulberry32 } from "./rng";

export interface Character {
  id: string;
  emoji: string;
  title: string;
  trait: string; // one-line personality
  quirk: string; // the signature tell used for physical-evidence clues
}

// 20-strong house roster. The cast of any given night is 8 of these.
export const ROSTER: Character[] = [
  { id: "luna-lockhart", emoji: "👩‍🎤", title: "The Indie Songwriter", trait: "Charismatic and emotional, forever chasing meaning.", quirk: "a pocket synthesizer" },
  { id: "finn-bellamy", emoji: "🧑‍🍳", title: "The Experimental Chef", trait: "Bold, dramatic, incapable of following a recipe.", quirk: "a five-star rating card" },
  { id: "dexter-vale", emoji: "🧑‍💻", title: "The Startup Founder", trait: "Relentlessly optimistic; every problem is an 'opportunity'.", quirk: "a printed spreadsheet" },
  { id: "professor-marlow", emoji: "👨‍🏫", title: "The Trivia Historian", trait: "Brilliant but exhausting; corrects everyone.", quirk: "a margin-noted almanac" },
  { id: "astrid-moon", emoji: "🧙", title: "The Urban Mystic", trait: "Intuitive and mysterious; reads the coffee grounds.", quirk: "an identical silk scarf" },
  { id: "dr-violet-chen", emoji: "👩‍🔬", title: "The Data Scientist", trait: "Rational to a fault; distrusts intuition.", quirk: "a probability notebook" },
  { id: "silas-crowe", emoji: "🧔", title: "The Conspiracy Blogger", trait: "Deeply skeptical; every coincidence matters.", quirk: "a red string of yarn" },
  { id: "grandma-pearl", emoji: "👵", title: "The Neighborhood Legend", trait: "Sweet but ruthlessly competitive; knows every secret.", quirk: "a tin of butterscotch" },
  { id: "romeo-riggs", emoji: "👨‍🎨", title: "The Street Artist", trait: "Creative and unpredictable; sketches everyone.", quirk: "a smudge of gold spray paint" },
  { id: "judge-junie", emoji: "👩‍⚖️", title: "The Mediator", trait: "Calm and persuasive; speaks in closing arguments.", quirk: "a ceremonial gavel" },
  { id: "whiskers", emoji: "🐱", title: "The Cafe Cat", trait: "Looks innocent, knows everything.", quirk: "a tuft of grey fur" },
  { id: "biscuit", emoji: "🐶", title: "The Golden Retriever", trait: "Friendly to everyone; trips over the truth.", quirk: "a chewed tennis ball" },
  { id: "sly-fletcher", emoji: "🦊", title: "The Urban Fox", trait: "Clever and evasive; never answers directly.", quirk: "a brass shortcut key" },
  { id: "chirpy-jones", emoji: "🐦", title: "The Gossip Bird", trait: "Social and observant; repeats everything overheard.", quirk: "a torn ticket stub" },
  { id: "hazel-hopps", emoji: "🐰", title: "The Emergency Planner", trait: "Prepared for everything; overthinks it all.", quirk: "a contingency binder" },
  { id: "rummage", emoji: "🦝", title: "The Dumpster Detective", trait: "Resourceful and curious; finds clues in the trash.", quirk: "a salvaged trinket" },
  { id: "rio-feathers", emoji: "🦜", title: "The Influencer", trait: "Attention-loving; narrates life as content.", quirk: "a ring light filter" },
  { id: "shelby-slowe", emoji: "🐢", title: "The Patient Observer", trait: "Quiet and perceptive; remembers everything.", quirk: "a worn pocket watch" },
  { id: "noctis", emoji: "🦉", title: "The Night Owl", trait: "Cryptic and nocturnal; leaves mysterious notes.", quirk: "a midnight-ink note" },
  { id: "octavia-ink", emoji: "🐙", title: "The Collector", trait: "Fascinated by people; acquires impossible objects.", quirk: "an inkstained glove" },
];

export const ROOMS = [
  "the Velvet Library",
  "the Conservatory",
  "the Wine Cellar",
  "the Smoking Lounge",
  "the Grand Ballroom",
  "the Observatory",
] as const;

export const HOURS = ["6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"] as const;

const REL_KINDS = ["rival", "debtor", "secret-keeper", "old flame", "business partner"] as const;
const MOTIVES = [
  "Financial Revenge",
  "A Buried Secret",
  "Stolen Credit",
  "A Jealous Heart",
  "Inheritance",
  "Silencing a Witness",
] as const;

export interface Relationship { from: string; to: string; kind: string }
export interface Dossier {
  id: string;
  claimed: string[];      // claimed location per HOURS slot — what they SAY
  trueLocation: string[]; // ground truth per HOURS slot; differs from claimed
                           // only for a culprit at the murder hour (the lie)
  relationships: Relationship[];
}
export interface Clue {
  stage: number;
  kind: string;
  title: string;
  text: string;
  eliminatesRooms: number[]; // indices into ROOMS this clue rules out entirely
  eliminatesHours: number[]; // indices into HOURS this clue rules out entirely
}

export type Mark = "confirmed" | "ruled-out" | "unknown";

export interface MysteryCase {
  date: string; // ISO yyyy-mm-dd
  caseNumber: number;
  title: string;
  opening: string;
  victim: Character;
  suspects: Character[]; // the 7 living suspects
  dossiers: Record<string, Dossier>;
  clues: Clue[]; // 7 staged clues
  // solution
  culprits: string[]; // ids, length 1..3 (first is the ringleader)
  motive: string;
  scene: string; // room of the murder
  hourIndex: number; // HOURS index of the murder
}

// ── deterministic helpers ────────────────────────────────────────────────────
export function seedFromDate(date: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < date.length; i++) {
    h ^= date.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Days since the parlor opened — gives every case a stable, incrementing number. */
export function caseNumberFor(date: string): number {
  const epoch = Date.UTC(2024, 0, 1);
  const d = new Date(date + "T00:00:00Z").getTime();
  return Math.max(1, Math.round((d - epoch) / 86400000));
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const pick = <T>(arr: readonly T[], rnd: () => number): T => arr[Math.floor(rnd() * arr.length)];

function fmtList(items: string[]): string {
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

export function todayISO(now = new Date()): string {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return d.toISOString().slice(0, 10);
}

// ── the generator ────────────────────────────────────────────────────────────
export function generateCase(date: string): MysteryCase {
  const rnd = mulberry32(seedFromDate(date));

  const cast = shuffle(ROSTER, rnd).slice(0, 8);
  const victim = cast[0];
  const suspects = cast.slice(1); // 7 living suspects

  // culprit count: 60% one, 30% two, 10% three
  const r = rnd();
  const culpritCount = r < 0.6 ? 1 : r < 0.9 ? 2 : 3;
  const culprits = shuffle(suspects, rnd).slice(0, culpritCount).map((s) => s.id);

  const scene = pick(ROOMS, rnd);
  const hourIndex = 1 + Math.floor(rnd() * (HOURS.length - 2)); // crime at 7,8, or 9 PM
  const motive = pick(MOTIVES, rnd);

  // Alibis: everyone claims a location each hour. Innocents' claim at the murder
  // hour is the TRUTH (they were elsewhere). Culprits CLAIM elsewhere but were
  // truly in `scene` — `trueLocation` records that ground truth separately from
  // `claimed`, so deduceCulprits() can read off the lie directly.
  const dossiers: Record<string, Dossier> = {};
  for (const s of suspects) {
    const claimed: string[] = [];
    for (let h = 0; h < HOURS.length; h++) claimed.push(pick(ROOMS, rnd));
    const isCulprit = culprits.includes(s.id);
    if (!isCulprit && claimed[hourIndex] === scene) {
      // keep innocents away from the scene at the murder hour
      claimed[hourIndex] = ROOMS[(ROOMS.indexOf(claimed[hourIndex] as (typeof ROOMS)[number]) + 1) % ROOMS.length];
    }
    if (isCulprit && claimed[hourIndex] === scene) {
      // a culprit must CLAIM somewhere other than the scene (the lie)
      claimed[hourIndex] = ROOMS[(ROOMS.indexOf(scene as (typeof ROOMS)[number]) + 2) % ROOMS.length];
    }
    const trueLocation = [...claimed];
    trueLocation[hourIndex] = isCulprit ? scene : claimed[hourIndex];
    dossiers[s.id] = { id: s.id, claimed, trueLocation, relationships: [] };
  }

  // Relationship graph: 2–4 edges per suspect; every culprit gets a tie to the
  // victim (the motive thread). Accomplices are tied to the ringleader. This is
  // dossier flavor/context only — WHO is deduced from trueLocation, not ties.
  const addRel = (from: string, to: string, kind: string) => {
    if (from === to) return;
    const d = dossiers[from];
    if (d.relationships.some((e) => e.to === to)) return;
    d.relationships.push({ from, to, kind });
  };
  for (const s of suspects) {
    const n = 2 + Math.floor(rnd() * 3);
    const others = shuffle(suspects.filter((o) => o.id !== s.id), rnd);
    for (let i = 0; i < n && i < others.length; i++) addRel(s.id, others[i].id, pick(REL_KINDS, rnd));
  }
  const ringleader = culprits[0];
  addRel(ringleader, victim.id, "rival"); // ringleader ↔ victim motive thread
  for (let i = 1; i < culprits.length; i++) addRel(culprits[i], ringleader, "business partner");

  // ── WHERE/WHEN elimination clues ────────────────────────────────────────────
  // Partition the non-scene rooms and non-murder hours so that, once all four
  // elimination clues are revealed, exactly the true scene and true hour have
  // not been ruled out — deterministic, not generate-and-check.
  const sceneIdx = ROOMS.indexOf(scene as (typeof ROOMS)[number]);
  const nonSceneRooms = shuffle(ROOMS.map((_, i) => i).filter((i) => i !== sceneIdx), rnd);
  const roomsRound1 = nonSceneRooms.slice(0, 2);
  const roomsRound2 = nonSceneRooms.slice(2);

  const nonMurderHours = shuffle(HOURS.map((_, i) => i).filter((i) => i !== hourIndex), rnd);
  const hoursRound1 = nonMurderHours.slice(0, 2);
  const hoursRound2 = nonMurderHours.slice(2);

  // ── prose (templated, no LLM) ───────────────────────────────────────────────
  // Deliberately never names `scene` or `HOURS[hourIndex]` — the old opening
  // stated both directly, which leaked the WHERE/WHEN answer before the
  // investigation even began.
  const caseNumber = caseNumberFor(date);
  const niceDate = new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });
  const title = `The ${niceDate.replace(/, \d{4}$/, "")} Case`;
  const opening =
    `Candlelight gutters somewhere in the house. ${victim.title}, ${victim.emoji} ${pretty(victim.id)}, ` +
    `was found dead this evening — ${victim.trait.toLowerCase()} ` +
    `Seven guests remain in the mansion, each with a story, and at least one with a lie. ` +
    `The Order convenes. The reckoning is ${motive.toLowerCase()}.`;

  const ring = ROSTER.find((c) => c.id === ringleader)!;
  const clues: Clue[] = [
    {
      stage: 1, kind: "Witness Statement",
      title: "What the clock did not see",
      text: `Two members of staff swear nothing happened at ${fmtList(hoursRound1.map((i) => HOURS[i]))} — whatever befell ${pretty(victim.id)}, it was not then.`,
      eliminatesRooms: [], eliminatesHours: hoursRound1,
    },
    {
      stage: 2, kind: "Witness Statement",
      title: "Rooms cleared",
      text: `The household confirms ${fmtList(roomsRound1.map((i) => ROOMS[i]))} stood empty the entire evening. Cross those off the list.`,
      eliminatesRooms: roomsRound1, eliminatesHours: [],
    },
    {
      stage: 3, kind: "Witness Statement",
      title: "The narrowing hour",
      text: `A second sweep of the house clears ${fmtList(hoursRound2.map((i) => HOURS[i]))} as well. Only one hour now remains unaccounted for.`,
      eliminatesRooms: [], eliminatesHours: hoursRound2,
    },
    {
      stage: 4, kind: "Witness Statement",
      title: "The last room standing",
      text: `The staff account for ${fmtList(roomsRound2.map((i) => ROOMS[i]))} too — each was occupied by guests who never left each other's sight. Only one room is left unexplained.`,
      eliminatesRooms: roomsRound2, eliminatesHours: [],
    },
    {
      stage: 5, kind: "Physical Evidence",
      title: "Left behind",
      text: `Investigators recover ${ring.quirk} from the room the timeline now points to. Only one guest in this house is ever seen with such a thing.`,
      eliminatesRooms: [], eliminatesHours: [],
    },
    {
      stage: 6, kind: "Timeline Discovery",
      title: "A broken alibi",
      text: `Cross-examined, ${pretty(ringleader)} insists they spent ${HOURS[hourIndex]} in ${dossiers[ringleader].claimed[hourIndex]}. Three guests place them nowhere near it. The alibi is a lie.`,
      eliminatesRooms: [], eliminatesHours: [],
    },
    {
      stage: 7, kind: "Secret Relationship",
      title: "The motive",
      text: culprits.length > 1
        ? `The Order uncovers a pact: ${pretty(ringleader)} did not act alone. A ${relTo(dossiers, culprits)} tie binds them to ${culprits.length === 2 ? "an accomplice" : "two accomplices"}, and the victim's exposure of a secret made it ${motive.toLowerCase()}.`
        : `At last the thread is pulled: the victim had exposed a secret, and ${pretty(ringleader)} alone stood to gain. The motive is ${motive.toLowerCase()}.`,
      eliminatesRooms: [], eliminatesHours: [],
    },
  ];

  return { date, caseNumber, title, opening, victim, suspects, dossiers, clues, culprits, motive, scene, hourIndex };
}

function relTo(dossiers: Record<string, Dossier>, culprits: string[]): string {
  const lead = dossiers[culprits[0]];
  const e = lead.relationships.find((r) => culprits.includes(r.to));
  return e ? e.kind : "business partner";
}

export function pretty(id: string): string {
  return id.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");
}

/**
 * The room×hour elimination matrix, as of `cluesRevealed` clues being shown.
 * A cell is "ruled-out" if its room or its hour has been entirely eliminated
 * by a revealed clue's `eliminatesRooms`/`eliminatesHours`. Once eliminations
 * leave exactly one un-eliminated room AND exactly one un-eliminated hour,
 * that single surviving cell becomes "confirmed" — never hardcoded to
 * `scene`/`hourIndex` directly, always derived from the clues themselves.
 */
export function deductionMatrix(c: MysteryCase, cluesRevealed: number): Mark[][] {
  const eliminatedRooms = new Set<number>();
  const eliminatedHours = new Set<number>();
  for (const clue of c.clues.slice(0, cluesRevealed)) {
    clue.eliminatesRooms.forEach((i) => eliminatedRooms.add(i));
    clue.eliminatesHours.forEach((i) => eliminatedHours.add(i));
  }
  const survivingRooms = ROOMS.filter((_, i) => !eliminatedRooms.has(i)).length;
  const survivingHours = HOURS.filter((_, i) => !eliminatedHours.has(i)).length;
  const allConfirmed = survivingRooms === 1 && survivingHours === 1;

  return ROOMS.map((_, r) =>
    HOURS.map((_, h) => {
      if (eliminatedRooms.has(r) || eliminatedHours.has(h)) return "ruled-out";
      return allConfirmed ? "confirmed" : "unknown";
    }),
  );
}

/**
 * WHO: culprits are exactly the suspects whose claimed location at the murder
 * hour differs from their true location at that hour (the lie). Innocents'
 * claim is always the truth, by construction in generateCase().
 */
export function deduceCulprits(c: MysteryCase): string[] {
  return c.suspects
    .filter((s) => c.dossiers[s.id].trueLocation[c.hourIndex] !== c.dossiers[s.id].claimed[c.hourIndex])
    .map((s) => s.id);
}

/** Checks all three legs of the puzzle are uniquely solvable: WHO, WHERE, WHEN. */
export function verifySolvable(c: MysteryCase): boolean {
  const deduced = new Set(deduceCulprits(c));
  if (deduced.size !== c.culprits.length) return false;
  if (!c.culprits.every((id) => deduced.has(id))) return false;

  const matrix = deductionMatrix(c, c.clues.length);
  let confirmedCount = 0;
  for (const row of matrix) for (const cell of row) if (cell === "confirmed") confirmedCount++;
  if (confirmedCount !== 1) return false;

  const sceneIdx = ROOMS.indexOf(c.scene as (typeof ROOMS)[number]);
  return matrix[sceneIdx][c.hourIndex] === "confirmed";
}

/** Stable hash of the solution, for the optional daily_cases table. */
export function solutionHash(c: MysteryCase): string {
  const payload = [...c.culprits].sort().join(",") + "|" + c.motive + "|" + c.scene + "|" + c.hourIndex;
  let h = 5381;
  for (let i = 0; i < payload.length; i++) h = (Math.imul(h, 33) ^ payload.charCodeAt(i)) >>> 0;
  return h.toString(16);
}
