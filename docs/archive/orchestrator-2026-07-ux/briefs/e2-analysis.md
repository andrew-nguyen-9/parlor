# e2-analysis — Fable Mystery workflow analysis (E2.7, feeds E2.2/E2.3/E2.5/E2.6)

Obey `.orchestrator/briefs/_common.md`. **Model: Fable** (game-design judgment). **No code changes** — proposal to disk; no branch; DoD n/a.

## Read
`frontend/lib/mystery.ts` (deduction engine, 372 LOC), `lib/mystery.test.ts`, `lib/mysteryScore.ts`, `components/MysteryIntro.tsx`, `MysteryInvestigate.tsx`, `MysteryAccusationForm.tsx`, `MysteryVerdict.tsx`, `Mystery.module.css`. Play the flow mentally end-to-end (intro → investigate → accuse → verdict).

## Deliverable → `.orchestrator/proposals/e2-mystery.md`
1. **E2.7 Workflow critique** — weak spots; concrete improvements for fun, addictiveness, competitive speed-scoring (mysteryScore.ts exists — critique it).
2. **E2.2 Rebalance design** — room + hour currently over-determined (4/7 clues). Propose clue-mix that keeps puzzles solvable (`verifySolvable()`) but WHERE/WHEN non-obvious.
3. **E2.3 Weapon+motive clue trails** — new clue TYPE designs constraining weapon and motive to unique answers. Specify: clue templates, generation constraints, how `verifySolvable()` extends.
4. **E2.5 Engine diversity** — plan for varied casts/motives/prose/structure so each day feels distinct. Must stay deterministic (day-seeded via `lib/rng.ts`) + solvable. Think: template pools, structural variants, prose banks — with rough counts.
5. **E2.6 Dynamic interactive elements** — player-manipulable UI ideas (e.g., suspect board, timeline pinning, notes). Rank by impact/effort.

## Format
Rank ALL items impact × effort. Mark a **"chosen set"** sized for two build units (e2-engine ≈ engine work, e2-ui ≈ UI work) — they implement the chosen set verbatim, rest goes to backlog. Precise enough that Opus builds without re-deriving intent.
