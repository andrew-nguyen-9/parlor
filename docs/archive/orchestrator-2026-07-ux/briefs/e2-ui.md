# e2-ui — Mystery UI (E2.1, E2.4, E2.6)

Obey `.orchestrator/briefs/_common.md`. Model: Opus, effort medium. Branch `ux/e2-ui`.
Deps: `.orchestrator/e2-engine.done.md` (weapon export, new clue types) + `.orchestrator/e3-tokens.done.md` (tokens) + `.orchestrator/proposals/e2-mystery.md` (chosen set, UI half).

## Files
`frontend/components/MysteryInvestigate.tsx`, `MysteryVerdict.tsx`, `MysteryAccusationForm.tsx`, `MysteryIntro.tsx`, `MysteryGame.tsx`, `Mystery.module.css`.

## Tasks
1. **E2.1 Full-screen dynamic layout** — full viewport, fluid scaling to large screens (no fixed-width column), responsive at all breakpoints (360/768/1440+). Use e3 tokens/utilities.
2. **E2.4 Verdict names the weapon** — `MysteryVerdict.tsx` displays solution weapon (consume e2-engine's export). Accusation form: include weapon/motive selection if proposal's chosen set says accusations cover them.
3. **E2.6 Dynamic interactive elements** — implement the proposal's chosen UI items (e.g. suspect board / timeline pinning / notes). Player-manipulable state stays client-side (localStorage if persistent).

## Constraints
- New clue types from e2-engine must render correctly in investigate view.
- SSR-safe: seeded data server-side, interaction client-side; no hydration mismatch.
- Framer Motion for choreography, reduced-motion path required.
