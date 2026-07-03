# e1-core.done.md

shipped: E1.2 hint, E1.3 undo/redo, E1.4 mark-clue-complete (Seance engine + UI)
files: frontend/lib/seance.ts (engine + History<T> + Mark/Board/emptyBoard exports), lib/seance.test.ts, components/SeanceGame.tsx, SeanceGame.module.css
decided: propagation-only stalls on solvable puzzles -> nextHint 3-tier (single-clue -> grid-logic -> deep search via countSolutions on the unique solution). Mark/Board/emptyBoard now live in seance.ts (was dup in .tsx). Undo/redo = generic snapshot stack; whisper scratchpad NOT in history (own clear).
gotchas for e1-polish: hint state = `hint` + `activeClue`(first driver); history = `hist` (board = histState(hist), no useState board); flagged = `flagged` Set. New CSS: .clueRow/.flagBtn/.clueFlagged/.clueHint. Clue is now a div (avoid button-in-button). mark-spent uses window.confirm.
DoD: build EXIT=0 (Next's own ESLint pass clean), 117/117 tests green, tsc clean for my files. `npm run lint` (=next lint) FAILS repo-wide: NO eslint config/dep committed on integration -> interactive scaffold prompt. Pre-existing, affects all units, not introduced here.
branch: ux/e1-core
