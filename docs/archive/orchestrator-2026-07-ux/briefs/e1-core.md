# e1-core — Séance engine features (E1.2–E1.4)

Obey `.orchestrator/briefs/_common.md`. Model: Opus, effort high. Branch `ux/e1-core`. No deps.

## Files
`frontend/lib/seance.ts` (deduction engine, 445 LOC), `frontend/lib/seance.test.ts`, `frontend/components/SeanceGame.tsx`, `SeanceGame.module.css`, `frontend/lib/seanceFlavor.ts`.

## Tasks
1. **E1.2 Hint button** — engine computes the next available elimination/confirmation AND which clue(s) drive it; UI highlights those clue(s) (scroll into view + visual emphasis). Hint reveals the *clue*, not the answer.
2. **E1.3 Undo/redo** — state machine over player marks (history stack of mark states; simplest: array of snapshots — grids are small, ponytail). Buttons + `Cmd/Ctrl+Z` undo, `Shift+Cmd/Ctrl+Z` redo. Keydown listener: ignore when focus in input/textarea; `e.metaKey||e.ctrlKey`; preventDefault.
3. **E1.4 Mark-clue-complete** — player flags a clue done. Before flagging, engine computes remaining possible eliminations/confirmations that clue still yields vs current marks; if N>0 warn "N more eliminations possible with this clue" (confirm-to-flag). Flagged clue visually dimmed, reversible.

## Tests (extend `seance.test.ts`)
- hint: for a known seed, hint's clue actually yields a valid deduction.
- undo/redo: apply k marks, undo k → initial; redo → restored; new mark after undo clears redo stack.
- mark-complete count: N matches engine's actual remaining deductions for that clue.

## Constraints
- Determinism: same day-seed → same puzzle (existing tests gate). Engine additions pure functions.
- Don't restyle (e1-polish owns visuals; you may add minimal classes/buttons).
- Gotcha for .done.md: note where hint/undo state lives so e1-polish avoids conflicts.
