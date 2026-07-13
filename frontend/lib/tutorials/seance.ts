import type { Tutorial } from "./types";

// The Séance — E3: the shipped icon+phrase steps NOW narrate an animated
// board-fill demo (`components/tutorial/SeanceTutorialDemo`). The mechanic is
// unchanged (a logic-grid "zebra" puzzle, not a 20-questions guess); this file
// only enriches the tutorial CONTENT — the stable registry/overlay are untouched.
//
// The steps double as the reduced-motion static fallback and as the narration
// beside the demo, so there is ONE source for what the tutorial teaches.
export const tutorial: Tutorial = {
  href: "/seance",
  title: "The Séance",
  accent: "wildcard",
  tagline: "Read the whispers, bind every soul to its seat — no guessing, only deduction.",
  steps: [
    { icon: "🔮", text: "Every seat hides one value from each category." },
    { icon: "✕", text: "Tap a seat once to snuff it (✕); tap again to bind it (◯)." },
    { icon: "🔗", text: "Bind a seat and its whole row and column auto-snuff — the cascade." },
    { icon: "⏳", text: "Stabilise once every seat is bound. A wrong binding costs 60s." },
  ],
  example: {
    // Fixed evergreen whisper (spec E3) — NEVER the live daily clue (spoiler-free,
    // deterministic, seed-independent).
    prompt: "Whisper: “Mr. Vane and the salt ring mark the same soul.”",
    walkthrough: "Bind Mr. Vane to the salt ring, then snuff that ring from every other seat's row and column.",
  },
};

// ── Animated board-fill demo script (E3) ──────────────────────────────────
// A CANNED, non-interactive playback (spec E3: a "watch" clip, not a live board)
// of the ONE rule newcomers trip on: the three-state cell cycle PLUS the derived
// auto-snuff cascade. A mock 3×3 scrying board — 3 seats (columns) × 3 candidate
// values (rows). Deterministic (no rng / no Math.random → SSR-safe); finite: it
// plays once through its beats (≤1-loop Floor), each beat ≤600ms. The
// reduced-motion variant swaps the motion for a labelled before → after still
// that teaches the same cascade as a designed state, not a degraded one.

/** A single cell's state: 0 blank · 1 snuffed (✕) · 2 bound (◯). */
export type DemoMark = 0 | 1 | 2;
/** Full board, indexed `grid[row = value][col = seat]`. */
export type DemoGrid = DemoMark[][];

export type DemoBeat = {
  /** Full board state at this beat. */
  grid: DemoGrid;
  /** Terse in-world caption narrating this beat. */
  caption: string;
};

const B: DemoMark = 0; // blank
const X: DemoMark = 1; // snuffed
const O: DemoMark = 2; // bound

// The seat/value the demo binds — the center cell, so a symmetric cross ripples.
export const DEMO_TARGET = { row: 1, col: 1 } as const;

const blank: DemoGrid = [
  [B, B, B],
  [B, B, B],
  [B, B, B],
];

const solved: DemoGrid = [
  [B, X, B],
  [X, O, X],
  [B, X, B],
];

/**
 * The finite beat sequence. Each beat is a full board snapshot so the player
 * component is a pure function of `beats[i]` — trivially SSR-safe and testable.
 */
const beats: DemoBeat[] = [
  { grid: blank, caption: "Every seat hides one value — read the whispers." },
  {
    grid: [
      [B, B, B],
      [B, X, B],
      [B, B, B],
    ],
    caption: "Tap a seat once to snuff a value (✕)…",
  },
  {
    grid: [
      [B, B, B],
      [B, O, B],
      [B, B, B],
    ],
    caption: "…tap again to bind the soul (◯).",
  },
  { grid: solved, caption: "Its whole row and column auto-snuff — the cascade." },
  { grid: solved, caption: "Stabilise when every seat is bound. A wrong bind costs 60s." },
];

export const SEANCE_DEMO = {
  /** Board is `size × size`. */
  size: 3,
  /** Milliseconds each beat holds before advancing (≤600ms Floor). */
  beatMs: 600,
  /** The bound seat/value (drives the reused planchette focus). */
  target: DEMO_TARGET,
  /** Finite, played-once beat script. */
  beats,
  /** Reduced-motion fallback: labelled blank → solved still (no motion). */
  still: { before: blank, after: solved },
} as const;
