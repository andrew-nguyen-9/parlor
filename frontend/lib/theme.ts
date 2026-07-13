// theme.ts — PER-GAME SKIN SEAM (f-design foundation).
//
// PARLOR's look is "per-game skins over locked shared floors": a room may declare
// its OWN palette / materials / layout-grid / motion / type / bg / mood without
// editing any global file, by opting into a `data-skin="<game>"` block whose CSS
// custom properties live in `app/skins.css`. The ~13 §Floors in design/INDEX.md
// stay enforced regardless of skin (contrast AA, ≥44px targets, WebGL degrade,
// reduced-motion, one <h1>, focus ring, Q&A legibility, offline/seed completeness,
// category triple-encode, SSR safety).
//
// MECHANISM (single path — CSS-var scope, NOT a JS-runtime theming layer):
//   1. import { applySkin } from "@/lib/theme"   // pulls in skins.css as a side effect
//   2. <main {...applySkin("board")}>            // sets data-skin on the room root
//   3. that subtree now resolves the [data-skin="board"] overrides from skins.css.
// A room that never calls applySkin looks IDENTICAL to today (no attribute set).
//
// This module is deliberately value-free: skin VALUES live in CSS (skins.css), the
// single source of truth. theme.ts only types the skin names + seam vocabulary and
// hands rooms the attribute to set. Do not add a JS theming/runtime-style layer.

// Load the scoped skin stylesheet wherever a room uses the helper. Inert until a
// room sets data-skin, so importing it globally is a no-op on unskinned routes.
import "../app/skins.css";

/** The canonical skin ids — one per game route (mirrors lib/games.ts hrefs). */
export const SKIN_NAMES = [
  "mystery",
  "board",
  "clock",
  "wedges",
  "streak",
  "map",
  "gauntlet",
  "thread",
  "seance",
  "ladder",
  "overture",
] as const;

export type SkinName = (typeof SKIN_NAMES)[number];

/**
 * The seam vocabulary: the CSS custom properties a `[data-skin]` block MAY set.
 * These are documentation + a type surface — the actual defaults + per-game values
 * live in skins.css. A skin may ALSO override any non-floor global var inside its
 * own scope (e.g. `--c-bg`, `--cat-*`, `--d-gutter`) to repaint its whole subtree;
 * these named `--skin-*` seams cover materials/motion/mood that have no global token.
 *
 * Color seams are RGB-channel triplets (so `rgb(var(--skin-x) / <alpha>)` +
 * Tailwind `bg-skin-*` alpha modifiers work); the rest are full CSS values.
 */
export const SKIN_SEAMS = {
  // palette (RGB channels; default → the active global token)
  "--skin-bg": "surface-base tint",
  "--skin-surface": "raised panel tint",
  "--skin-accent": "primary accent (interactive border / highlight)",
  "--skin-ink": "primary text tone",
  "--skin-muted": "secondary text tone",
  // materials / background (full values)
  "--skin-bg-image": "room background material or gradient (default none)",
  "--skin-radius": "action-plate corner radius (default 4px)",
  // type (full value)
  "--skin-font-display": "display/nameplate face (default var(--font-display))",
  // motion (full values)
  "--skin-motion-duration": "signature-transition duration (default 300ms)",
  "--skin-motion-ease": "signature easing curve (default entrance cubic-bezier)",
  // layout grid (full values; default → the shared --d-* tokens)
  "--skin-gutter": "page side padding (default var(--d-gutter))",
  "--skin-maxw": "room content max width (default var(--d-maxw))",
} as const;

export type SkinSeam = keyof typeof SKIN_SEAMS;

/** What `applySkin` spreads onto an element. Omitted when no skin is chosen. */
export type SkinAttrs = { "data-skin": SkinName } | Record<string, never>;

/**
 * Opt a room into its skin. Spread the result onto the room's root element:
 *   <main {...applySkin("clock")}>…</main>
 * Passing no skin (or undefined) returns {} — the room stays on the global look.
 */
export function applySkin(skin?: SkinName): SkinAttrs {
  return skin ? { "data-skin": skin } : {};
}
