// Pure board-arrangement helpers. Kept OUT of lib/queries.ts on purpose: that
// module statically imports the 232 KB seed bank, and BoardGame (a client
// component) calls buildBoardColumns for practice mode — importing it from
// queries dragged the whole seed bank into the /board client bundle (~76 KB).
// This module imports only types, so the client pays nothing for it.
import type { Category, Question } from "./types";

export interface BoardColumn {
  category: Category;
  cells: Question[]; // 5 clues, difficulty 1..5
}

/** True when a clue's text hits one of the day's theme keywords (lib/themes
 *  pickTheme → anniversary `match`). Used to VISIBLY steer board selection. */
export function clueMatchesTheme(clue: Question, match?: string[]): boolean {
  if (!match || match.length === 0) return false;
  const hay = `${clue.prompt} ${clue.correct}`.toLowerCase();
  return match.some((m) => hay.includes(m.toLowerCase()));
}

// Float on-theme clues to the front so the day's theme VISIBLY steers which
// categories the board surfaces (buildBoardColumns takes the first 5 categories
// it meets). A STABLE partition (on-theme keep their order ahead of off-theme)
// layered on the caller's daily rotation — pure, SSR-safe: no clock, no random.
// No keywords (an ordinary, non-anniversary day) ⇒ the pool is returned as-is.
export function biasCluesByTheme(clues: Question[], match?: string[]): Question[] {
  if (!match || match.length === 0) return clues;
  const on: Question[] = [];
  const off: Question[] = [];
  for (const q of clues) (clueMatchesTheme(q, match) ? on : off).push(q);
  return [...on, ...off];
}

/** A tier picker that prefers on-theme clues (falling back to the base picker
 *  over the whole tier when none match), so the day's theme also steers WHICH
 *  clue fills each cell — not just which categories appear. */
export function themedPick(
  match: string[] | undefined,
  base: (arr: Question[]) => Question,
): (arr: Question[]) => Question {
  return (arr) => {
    const on = arr.filter((q) => clueMatchesTheme(q, match));
    return base(on.length ? on : arr);
  };
}

/** Group clues into 5 columns × 5 difficulty rows for THE BOARD. */
export function buildBoardColumns(
  clues: Question[],
  pick: (arr: Question[]) => Question,
): BoardColumn[] {
  const byCat = new Map<Category, Question[]>();
  for (const q of clues) {
    byCat.set(q.category, [...(byCat.get(q.category) ?? []), q]);
  }
  const columns: BoardColumn[] = [];
  for (const [category, rows] of byCat) {
    if (columns.length === 5) break;
    const cells: Question[] = [];
    for (let d = 1; d <= 5; d++) {
      const tier = rows.filter((q) => q.difficulty === d);
      cells.push(pick(tier.length ? tier : rows));
    }
    columns.push({ category, cells });
  }
  return columns;
}
