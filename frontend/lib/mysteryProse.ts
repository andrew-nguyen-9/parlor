// ─────────────────────────────────────────────────────────────────────────────
// PARLOR CASE — prose banks (E2.5 diversity).
//
// Every title / opening / clue flourish is drawn from a SECOND rng stream
// (`mulberry32(seedFromDate(date) ^ PROSE_SALT)`), kept strictly separate from
// the logic stream in `generateCase`. Growing these banks never shifts a single
// puzzle's cast, culprits or solution — only its wording. All banks are pure
// atmosphere: they never name a room, hour, motive or weapon, so the opening can
// never leak a solution axis (guarded by mystery.test.ts).
// ─────────────────────────────────────────────────────────────────────────────

// XOR salt that forks the prose stream off the daily logic seed.
export const PROSE_SALT = 0x9e3779b9;

const pick = <T>(arr: readonly T[], rnd: () => number): T => arr[Math.floor(rnd() * arr.length)];

// ── titles ───────────────────────────────────────────────────────────────────
const TITLE_TEMPLATES = [
  "The Affair of the {noun}",
  "A Death in the {noun}",
  "The {noun} Reckoning",
  "The Case of the {noun}",
  "The {noun} Affair",
  "A Matter of the {noun}",
  "The Riddle of the {noun}",
  "Under the {noun}",
] as const;

const TITLE_NOUNS = [
  "Gilded Hour", "Velvet Envelope", "Seventh Guest", "Cold Sherry",
  "Silent Gramophone", "Broken Locket", "Midnight Toast", "Painted Fan",
  "Last Candle", "Empty Chair", "Faded Portrait", "Whispered Oath",
  "Locked Study", "Hollow Laugh", "Unsigned Card", "Guttered Flame",
] as const;

/** A varied, date-stable title. Never references a solution axis. */
export function pickTitle(rnd: () => number): string {
  return pick(TITLE_TEMPLATES, rnd).replace("{noun}", pick(TITLE_NOUNS, rnd));
}

// ── openings ─────────────────────────────────────────────────────────────────
const ATMOSPHERE = [
  "Candlelight gutters somewhere in the house.",
  "Rain needles the tall windows of the parlor.",
  "A hush has fallen over the mansion.",
  "The grandfather clock has stopped, its pendulum still.",
  "Wine glasses sit abandoned on the mantel.",
  "Somewhere below, a door latches shut.",
  "The fire has burned down to embers.",
  "A cold draft moves through the darkened halls.",
] as const;

const STAKES = [
  "Seven guests remain in the mansion, each with a story, and at least one with a lie.",
  "Seven remain under this roof — seven alibis, and not all of them true.",
  "Seven guests linger, every one of them a story, one of them a liar.",
  "Of the party, seven survive to be questioned; one of them killed.",
] as const;

const CLOSING = [
  "The Order convenes. Where, when, why, by what hand — and whose.",
  "The Order gathers to name the guilty. Where, when, why, by what hand.",
  "Now the deduction begins: where, when, why, by what hand — and whose.",
  "The parlor doors are sealed. Nobody leaves until the truth is drawn out.",
] as const;

/** A varied opening built from atmosphere banks + victim flavor. Leaks nothing. */
export function buildOpening(
  rnd: () => number,
  v: { title: string; emoji: string; name: string; trait: string },
): string {
  return (
    `${pick(ATMOSPHERE, rnd)} ${v.title}, ${v.emoji} ${v.name}, ` +
    `was found dead this evening — ${v.trait.toLowerCase()} ` +
    `${pick(STAKES, rnd)} ${pick(CLOSING, rnd)}`
  );
}

// ── clue flourishes ──────────────────────────────────────────────────────────
// Openers for the two WHEN bracket clues and the WHO corroboration clue. Chosen
// with the prose stream so wording rotates day to day; the eliminations they
// carry are fixed by the logic stream.
const ALIVE_OPENERS = [
  "was still pouring drinks",
  "was heard laughing with the victim",
  "shared a last toast with the victim",
  "swears the victim was still alive",
] as const;

const FOUND_OPENERS = [
  "raised the alarm",
  // Clue 3's template already says "the coroner puts the body already cold" —
  // keep these openers clear of that phrase or the sentence repeats itself.
  "discovered the body",
  "stumbled upon the scene",
  "screamed from the landing",
] as const;

export function pickAliveOpener(rnd: () => number): string {
  return pick(ALIVE_OPENERS, rnd);
}
export function pickFoundOpener(rnd: () => number): string {
  return pick(FOUND_OPENERS, rnd);
}
