# e3-proposal — Fable design proposal (E3.1–E3.3) [FOUNDATION INPUT — highest blast radius]

Obey `.orchestrator/briefs/_common.md`. **Model: Fable** (creative/design judgment). **No code changes** — proposal to disk only; no branch needed; DoD gate n/a (docs only).

## Context
PARLOR = "haunted Victorian mansion" trivia parlor. Six+ game rooms, card-deck home. Current system: dark-first (oxblood `#6e1f2b`, gold `#c9a86a`, candle `#f5c542`, parchment `#efe8c0`), Cinzel display font, category jewels in `frontend/lib/types.ts` `CATEGORY_HEX`. Read:
- `docs/v2/DESIGN_SYSTEM.md` (canonical; you are extending it)
- `frontend/app/globals.css` (22.8K — current tokens/vars), `frontend/tailwind.config.ts`
- Skim 2–3 game components for feel (`components/SeanceGame.tsx`, `Deck.tsx`, `app/page.tsx`)

## Deliverable → `.orchestrator/proposals/e3-design.md`
Written as **ready-to-merge DESIGN_SYSTEM.md sections** + a machine-implementable token table, so the implementation unit (Opus) works mechanically from it.

1. **E3.1 Expert light mode** — "a daylit tour of the mansion." Full semantic-role remap (not brand swap): surfaces, ink, accents, category jewels adjusted for light bg. **WCAG AA contrast table required** (each token pair: fg/bg → ratio). Current light mode is baseline; yours must be expert-level.
2. **E3.2 Expert guidelines** — deployable/reusable rules: color roles + usage, layout grids + rhythm, mobile vs desktop patterns, cursor treatments (cursor-reactive motion where it earns its place), interactive functionalities, motion restraint rules. Concrete enough that any future unit applies them without asking.
3. **E3.3 Reference distillation** — 7 refs already in DESIGN_SYSTEM.md §"Reference-site learnings" (trionn, everswap, aorum, fanalis, andreigorskikh, coveomusic, wearedaima). Original 10-link wishlist lost at intake — pick ~3 more award-tier refs you know, distill "take, don't clone" cues. Common thread stays: restraint + intentional motion; nothing templated, **no AI-slop**.
4. **Token table** — `name | role | dark hex | light hex | tailwind key | css var` for every token touched/added.

## Constraints
- a11y floor: never category-by-color-alone (pair glyph/label); reduced-motion path for every motion rule; contrast AA.
- Perf: lighthouse-ci gate must stay satisfiable (no heavy imagery/blur mandates).
- Ponytail: extend, don't rebuild — existing brand (oxblood/gold/Cinzel) stays the identity.

## Gate
This proposal is **held for user sign-off (A5)** before e3-tokens implements. Make it easy to approve: lead with a 10-line summary of what changes.

Return JSON per _common (branch null).
