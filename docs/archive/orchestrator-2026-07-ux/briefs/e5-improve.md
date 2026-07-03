# e5-improve — implement chosen per-game improvements (E5.4 build half)

Obey `.orchestrator/briefs/_common.md`. Model: Opus, effort medium. Branch `ux/e5-improve`.
Deps: `.orchestrator/proposals/e5-games.md` ("chosen set" — implement it verbatim) + `.orchestrator/e5-analysis.done.md` + `.orchestrator/e3-tokens.done.md`.

## Task
Implement the proposal's chosen set across game components (`frontend/components/*Game.tsx`, matching `frontend/lib/*.ts` where logic lives). Backlog items: skip.

## Constraints
- Ponytail per item: laziest diff that delivers the improvement. Item ballooning beyond its proposal estimate → skip, log to `.orchestrator/qa/backlog.md`, note in .done.md.
- Determinism: daily/shared setups stay day-seeded (`lib/rng.ts`); free shuffles only in click handlers/effects (SSR rule).
- Per-game tests (`lib/*.test.ts`) stay green; touched non-trivial logic without a test → add ONE smallest check.
- Don't restyle (e3 tokens only where the improvement needs UI); don't touch Séance/Mystery.
- Scores stay in localStorage; no DB writes.
