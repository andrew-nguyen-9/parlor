# e3-tokens — implement design system (E3.4–E3.5) [FOUNDATION — all visual units inherit]

Obey `.orchestrator/briefs/_common.md`. Model: Opus, effort high. Branch `ux/e3-tokens`.
**GATED:** dispatch only after user OK on `.orchestrator/proposals/e3-design.md` (A5).

## Input
- `.orchestrator/proposals/e3-design.md` (approved Fable proposal — token table + guideline sections)
- `.orchestrator/e3-proposal.done.md`

## Tasks
1. Merge approved proposal sections into `docs/v2/DESIGN_SYSTEM.md` (extend, single canonical source — A3).
2. Implement token table: `frontend/tailwind.config.ts` + `frontend/app/globals.css` CSS vars, **light + dark**. Respect existing var naming; theme switch mechanism already exists (`ThemeToggle.tsx`, `lib/themes.ts`) — wire into it, don't rebuild.
3. Cursor treatments + shared utility classes from guidelines. Shared component ONLY if ≥2 epics need it (ponytail — else utilities suffice).
4. Verify light-mode WCAG AA per proposal's contrast table (spot-check computed styles).
5. **Do NOT restyle individual games** — dependents (e1-polish, e2-ui, e5-*, e4) inherit and apply.

## AC
- E3.4: tokens/CSS/guidelines implemented, other epics can inherit by class/var name.
- E3.5: home + one game read highly-designed in light AND dark; no AI-slop; a11y + perf preserved (lighthouse-ci workflow stays green — check `.github/workflows`).
- Category jewels stay single-sourced in `lib/types.ts` `CATEGORY_HEX` + tailwind safelist.

## .done.md MUST list (dependents build from this — accuracy critical)
- every new/changed token: tailwind key + css var name
- utility classes added + intended use
- light/dark switching contract (how a component opts in)
