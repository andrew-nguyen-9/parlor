# e1-polish — Séance visual/text polish (E1.1, E1.5–E1.7)

Obey `.orchestrator/briefs/_common.md`. Model: Opus, effort medium. Branch `ux/e1-polish`.
Deps: read `.orchestrator/e3-tokens.done.md` (inherit tokens) + `.orchestrator/e1-core.done.md` (same files — respect its state/UI additions).

## Files
`frontend/components/SeanceGame.tsx`, `SeanceGame.module.css`, `frontend/lib/seance.ts`, `frontend/lib/seanceFlavor.ts`, `frontend/lib/types.ts` (CATEGORY_HEX, read-only).

## Tasks
1. **E1.1 Layout/formatting** — grid + clue panel legible, no overflow/misalignment. Verify 360px, 768px, 1440px (playwright or browser snapshot). Use e3 tokens/utilities.
2. **E1.5 Capitalization** — items/people/rooms consistent Title Case. Fix at data source (`seanceFlavor.ts`) or one render-side helper — not scattered per-render tweaks.
3. **E1.6 Category color-coding** — each category + its words colored from `CATEGORY_HEX`. **Never color alone** — pair glyph or label (a11y). Tailwind safelist covers dynamic classes — verify.
4. **E1.7 Reword "besides"** — positional clues in `lib/seance.ts` use "besides"; replace with "above"/"below" (or "directly above/below") matching the ACTUAL spatial semantics of the clue — read the generator to confirm direction before rewording. Update any test fixtures matching clue text.

## Constraints
- E1.8 (full QA pass) is qa-sweep's job — don't chase perfection here.
- Determinism tests green; clue-text changes must not break parsing/matching logic if any.
