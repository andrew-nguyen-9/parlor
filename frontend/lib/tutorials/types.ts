import type { Category } from "@/lib/types";

/** One animated step: an icon (emoji, always renders, no asset) + a terse phrase. */
export type TutorialStep = { icon: string; text: string };

/**
 * One room's tutorial: what a first-time player sees, and what the help icon
 * replays. Shape is STABLE — game units overwrite only their own
 * `lib/tutorials/<room>.ts`, never this file or the registry (`index.ts`).
 *
 * Content contract (E8): a short tagline, 2–5 STEPS — icon + a few words each,
 * shown one at a time with a Framer Motion stagger reveal (show-don't-tell,
 * 5-year-old legible) — plus exactly ONE worked example (a concrete prompt +
 * how you'd answer it). `rules` (plain sentences, no icon) is the legacy shape
 * still used by rooms E8 doesn't own (e.g. `thread.ts`); TutorialOverlay
 * renders `steps` when present, else falls back to `rules`.
 */
export type Tutorial = {
  /** Room deck href, e.g. "/wedges" — the key RoomShell looks up by. */
  href: string;
  /** Room display name shown as the overlay heading (e.g. "Fractures"). */
  title: string;
  /** Category accent for the overlay ink (text-{accent}, safelisted). */
  accent: Category;
  /** One-line hook under the heading. */
  tagline: string;
  /** Preferred: 2–5 animated icon+phrase steps. */
  steps?: TutorialStep[];
  /** Legacy: 2–5 plain-language rule sentences (used where `steps` is absent). */
  rules?: string[];
  /** Exactly one worked example: a prompt and how you'd play it. */
  example: { prompt: string; walkthrough: string };
};
