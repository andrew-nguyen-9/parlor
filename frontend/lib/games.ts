import type { Game } from "@/components/CardFace";

/**
 * The poker deck — single source of truth for rank + card identity. The home
 * page's Deck reads this to render the browsable deck; RoomShell reads it (by
 * href) to badge each game page with its rank in the top-right corner.
 *
 * Suit = category; each card carries exactly one Secret Order character (canon
 * owned by 2.11, GAMES.md). Ranks run 1 (Ace, the feature card) through 11;
 * the Overture is the deck's one Joker — a wildcard, no rank.
 */
export const GAMES: Game[] = [
  {
    href: "/mystery",
    name: "Sanctum Mysterii",
    accent: "history",
    character: "the Order",
    emblem: "◉", // the all-seeing eye
    rank: 1, // the Ace
    blurb:
      "A new case every night. Read the dossiers, follow the clues, and name the culprit before the candle gutters out.",
  },
  {
    href: "/board",
    name: "Codex",
    accent: "history",
    character: "the Host",
    emblem: "⌘", // the open codex / page of categories
    rank: 2,
    blurb:
      "Five categories, five values, one daily double. The same board for everyone, every day.",
  },
  {
    href: "/clock",
    name: "Chronos",
    accent: "music",
    character: "the Clockkeeper",
    emblem: "⧗", // a clock face
    rank: 3,
    blurb:
      "When did it happen? Drag the year — closer guesses, bigger points. Five rounds against the century.",
  },
  {
    href: "/wedges",
    name: "Fractures",
    accent: "sports",
    character: "the Ghost",
    emblem: "⬡", // the shattered mirror's shard
    rank: 4,
    blurb:
      "Six wedges, twenty questions. Fill the ring before the deck runs out — quickfire across every category.",
  },
  {
    href: "/streak",
    name: "Ignite",
    accent: "screen",
    character: "the Witch",
    emblem: "✦", // the witch's kindling flame
    rank: 5,
    blurb:
      "Higher or lower? Populations, box offices, fan counts. One wrong call ends the run.",
  },
  {
    href: "/map",
    name: "Atlas Obscura",
    accent: "geography",
    character: "the Cartographer",
    emblem: "⌖", // drop a pin
    rank: 6,
    blurb:
      "Drop a pin where it happened. Scored by the kilometer — no tile servers, no mercy.",
  },
  {
    href: "/gauntlet",
    name: "The Gauntlet",
    accent: "wildcard",
    character: "the Adventurer",
    emblem: "⧈", // the day's run
    rank: 7,
    blurb:
      "One round from every room, once a day, the same gauntlet for everyone. Share your line of squares.",
  },
  {
    href: "/thread",
    name: "Thread of Fate",
    accent: "history",
    character: "the Weaver",
    emblem: "⌇", // a stitch of thread
    rank: 8,
    blurb:
      "Follow the chain of clues. Each answer links to the next — unravel the thread before it tangles.",
  },
  {
    href: "/seance",
    name: "The Séance",
    accent: "wildcard",
    character: "the Medium",
    emblem: "☍", // the spirit's moon
    rank: 9,
    blurb:
      "Who or what am I? Each clue costs a point. The earliest correct answer earns the most.",
  },
  {
    href: "/ladder",
    name: "Climb of the Initiate",
    accent: "music",
    character: "the Trickster",
    emblem: "☰", // the rungs
    rank: 10,
    blurb:
      "Pick the closest match. Hints reveal shared attributes — category, region, magnitude. Climb the ladder.",
  },
  {
    href: "/cold-case",
    name: "The Cold Case",
    accent: "history",
    character: "the Inspector",
    emblem: "⌕", // the magnifying glass
    rank: 11,
    blurb:
      "One unsolved case, opened across a week. Follow clues from every room of the Order to name the culprit.",
  },
  {
    href: "/overture",
    name: "The Overture",
    accent: "music",
    character: "the Maestro",
    emblem: "♪", // the opening note
    rank: 12, // unranked — the Joker; see `joker` below
    joker: true,
    blurb:
      "Name the track before the needle lifts. The house band strikes up an intro — a music room for the sharp-eared.",
  },
];

export function gameByHref(href: string): Game | undefined {
  return GAMES.find((g) => g.href === href);
}
