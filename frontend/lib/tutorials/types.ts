import type { Category } from "@/lib/types";

/**
 * One room's tutorial: what a first-time player sees, and what the help icon
 * replays. Shape is STABLE — game units overwrite only their own
 * `lib/tutorials/<room>.ts`, never this file or the registry (`index.ts`).
 *
 * Content contract (per F2 brief): a short tagline, 2–5 plain-language rules,
 * and exactly ONE worked example (a concrete prompt + how you'd answer it).
 * Keep copy legible (VOICE): mysterious framing is fine, but the rules must be
 * unambiguous — this is the one place the game explains itself literally.
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
  /** 2–5 rules, ordered. Each ≥1rem, plain language, no gilt/gradient. */
  rules: string[];
  /** Exactly one worked example: a prompt and how you'd play it. */
  example: { prompt: string; walkthrough: string };
};
