# e2-engine — Mystery deduction engine (E2.2, E2.3, E2.5)

Obey `.orchestrator/briefs/_common.md`. Model: Opus, effort high. Branch `ux/e2-engine`.
Deps: `.orchestrator/proposals/e2-mystery.md` (implement its "chosen set", engine half) + `.orchestrator/e2-analysis.done.md`.

## Files
`frontend/lib/mystery.ts`, `frontend/lib/mystery.test.ts`, `frontend/lib/mysteryScore.ts` (if scoring items chosen), `frontend/lib/rng.ts` (read-only — all randomness through it).

## Tasks (per proposal's chosen set)
1. **E2.2** Rebalance WHERE/WHEN clue mix — room+hour no longer over-determined; `verifySolvable()` stays green.
2. **E2.3** Weapon + motive deducible: new clue types per proposal; extend `verifySolvable()` to assert unique weapon+motive. Expose solution weapon for the verdict UI (e2-ui consumes — name the export in .done.md).
3. **E2.5** Diversity: varied casts/motives/prose/structure per proposal. Deterministic (day-seed), solvable.

## Tests (extend mystery.test.ts — these gate)
- Solvability sweep: ≥100 consecutive seeds → `verifySolvable()` true (incl. weapon+motive uniqueness).
- Determinism: same seed twice → identical case.
- Rebalance: assert WHERE/WHEN not determined by fewer than X clues (per proposal's spec).

## Constraints
- Coupled cluster — you own the whole engine change sequentially; don't split.
- UI untouched (e2-ui owns it) except type exports.
- .done.md: exported types/functions e2-ui needs, clue-type list, any story-structure contract.
