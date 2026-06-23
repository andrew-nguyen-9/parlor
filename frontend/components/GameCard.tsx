"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CATEGORY_HEX, type Category } from "@/lib/types";

// One bespoke card per game: a suit (its category), a Secret Order character, an
// emblem (the game's icon), and a rank. The emblem is multiplied into pips by
// rank, like a real playing card.
export type Game = {
  href: string;
  name: string;
  accent: Category;
  character: string;
  emblem: string;
  rank: number; // 1–10; drives the pip count + corner index
  blurb: string;
  feature?: boolean;
};

// Category → card suit, matching RoomShell so a game reads the same everywhere.
const SUIT: Record<Category, string> = {
  history: "♦",
  music: "♥",
  sports: "♣",
  screen: "♠",
  geography: "✦",
  wildcard: "✧",
};

// Canonical pip coordinates (% within the pip field) for ranks 1–10 — the
// standard French-deck layouts, approximated.
const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[50, 12], [50, 88]],
  3: [[50, 12], [50, 50], [50, 88]],
  4: [[28, 14], [72, 14], [28, 86], [72, 86]],
  5: [[28, 14], [72, 14], [50, 50], [28, 86], [72, 86]],
  6: [[28, 12], [72, 12], [28, 50], [72, 50], [28, 88], [72, 88]],
  7: [[28, 12], [72, 12], [50, 31], [28, 50], [72, 50], [28, 88], [72, 88]],
  8: [[28, 12], [72, 12], [50, 31], [28, 50], [72, 50], [50, 69], [28, 88], [72, 88]],
  9: [[28, 10], [72, 10], [28, 37], [72, 37], [50, 50], [28, 63], [72, 63], [28, 90], [72, 90]],
  10: [[28, 10], [72, 10], [50, 28], [28, 37], [72, 37], [28, 63], [72, 63], [50, 72], [28, 90], [72, 90]],
};

const rankLabel = (r: number) => (r === 1 ? "A" : String(r));

const cardVariants = (reduced: boolean): Variants => ({
  // deal-in: cards fly up from a stacked, slightly-rotated origin into the grid.
  hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 44, scale: 0.92, rotateZ: -5 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateZ: 0,
    transition: reduced
      ? { duration: 0.2 }
      : { type: "spring", stiffness: 130, damping: 17 },
  },
});

export default function GameCard({ game }: { game: Game }) {
  const reduced = useReducedMotion() ?? false;
  const hex = CATEGORY_HEX[game.accent];
  const suit = SUIT[game.accent];
  const pips = PIPS[game.rank] ?? PIPS[1];

  const CornerIndex = ({ corner }: { corner: "tl" | "br" }) => (
    <span
      className={`absolute z-[2] flex flex-col items-center leading-none ${
        corner === "tl" ? "left-2 top-2" : "bottom-2 right-2 rotate-180"
      }`}
    >
      <span className="display text-sm" style={{ color: "#43141f" }}>
        {rankLabel(game.rank)}
      </span>
      <span className="text-xs" style={{ color: hex }} aria-hidden>
        {suit}
      </span>
    </span>
  );

  const Cartouche = (
    <div className="deck-cartouche">
      <span className="microlabel block" style={{ color: hex }}>
        {game.character}
      </span>
      <span className="display block text-base leading-tight" style={{ color: "#43141f" }}>
        {game.name}
      </span>
    </div>
  );

  const PipField = (
    <div className="deck-pips" aria-hidden>
      {pips.map(([x, y], i) => (
        <span
          key={i}
          className="deck-pip"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          {game.emblem}
        </span>
      ))}
    </div>
  );

  // Reduced-motion: a single static parchment card — no flip, no perpetual motion.
  if (reduced) {
    return (
      <motion.li variants={cardVariants(true)} layout className="list-none">
        <Link
          href={game.href}
          aria-label={`Enter ${game.name}`}
          className="deck-face deck-front !relative block aspect-[5/7] transition hover:brightness-105"
        >
          <CornerIndex corner="tl" />
          {PipField}
          {Cartouche}
          <span className="relative z-[1] mx-auto mt-1 text-[0.65rem] uppercase tracking-[0.2em]" style={{ color: hex }}>
            enter →
          </span>
          <CornerIndex corner="br" />
        </Link>
      </motion.li>
    );
  }

  return (
    <motion.li
      variants={cardVariants(false)}
      layout
      whileHover={{ y: -10, scale: 1.04, transition: { duration: 0.2 } }}
      className="deck-scene list-none rounded-[0.9rem]"
    >
      <Link
        href={game.href}
        aria-label={`Enter ${game.name}`}
        className="deck-card block rounded-[0.9rem] outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {/* FRONT — parchment face with gold pips and a nameplate cartouche */}
        <div className="deck-face deck-front">
          <CornerIndex corner="tl" />
          {PipField}
          {Cartouche}
          <span
            className="relative z-[1] mx-auto mt-1 text-[0.65rem] uppercase tracking-[0.2em]"
            style={{ color: hex }}
          >
            enter →
          </span>
          <CornerIndex corner="br" />
        </div>

        {/* BACK — the seal on an intricate gold-on-oxblood pattern */}
        <div className="deck-face deck-back-art">
          <span className="deck-back-ring" aria-hidden />
          <img
            src="/logo-256.png"
            alt=""
            aria-hidden
            className="deck-back-seal eye-glow"
          />
        </div>
      </Link>
    </motion.li>
  );
}
