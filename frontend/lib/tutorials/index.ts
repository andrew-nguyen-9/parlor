// Tutorial registry — the single stable map from room href → tutorial content.
// STABLE FILE: game units edit ONLY their own `lib/tutorials/<room>.ts`
// (each exports `tutorial`); they never touch this file. Adding a room = one new
// content file + one line here. RoomShell mounts the overlay via `tutorialByHref`.
import type { Tutorial } from "./types";

import { tutorial as mystery } from "./mystery";
import { tutorial as board } from "./board";
import { tutorial as clock } from "./clock";
import { tutorial as wedges } from "./wedges";
import { tutorial as streak } from "./streak";
import { tutorial as map } from "./map";
import { tutorial as gauntlet } from "./gauntlet";
import { tutorial as thread } from "./thread";
import { tutorial as seance } from "./seance";
import { tutorial as ladder } from "./ladder";
import { tutorial as overture } from "./overture";

/** Every playable room (COLLECTION minus the retired cold-case) keyed by href. */
export const TUTORIALS: Record<string, Tutorial> = {
  [mystery.href]: mystery,
  [board.href]: board,
  [clock.href]: clock,
  [wedges.href]: wedges,
  [streak.href]: streak,
  [map.href]: map,
  [gauntlet.href]: gauntlet,
  [thread.href]: thread,
  [seance.href]: seance,
  [ladder.href]: ladder,
  [overture.href]: overture,
};

/** Look up a room's tutorial by its deck href; undefined for non-game rooms. */
export function tutorialByHref(href: string): Tutorial | undefined {
  return TUTORIALS[href];
}

export type { Tutorial } from "./types";
