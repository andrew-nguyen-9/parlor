# PARLOR — Orchestrator Spec (Session A)

Source: user wishlist (6 epics). Normalized into epics with acceptance criteria (AC).
D verifies each AC against merged trunk.

## A-round assumptions (user away during intake — CONFIRM via blockers.md before C)

- **A1 Scope/release:** build all 6 epics; merge each to `main` as it passes review (per-epic, incremental).
- **A2 Model workflow:** design/game-analysis units run on **Fable** (creative), emit proposals to disk; implementation runs on **Opus**. "Fable proposes → Opus builds."
- **A3 Design docs home:** extend `docs/v2/DESIGN_SYSTEM.md` (single canonical source).
- **A4 QA process form:** reusable repo **skill/command** (`/ui-qa`) wrapping design-review + playwright/lighthouse loop.
- **A5 Fable approval:** proceed without per-proposal sign-off (A2 default), EXCEPT E3 design-guidelines proposal — hold for user OK (highest blast radius, sets tone for all visual work).

If the user picks differently, only E3/E5 briefs + C model-routing change; epics themselves stand.

## Stack / DoD

- Frontend: Next.js 14 App Router, Tailwind, Framer Motion. `frontend/` is the work root.
- **DoD gate (per unit):** `cd frontend && npm run build && npm run lint && npm run test` all green.
- Data-gen for games: `frontend/lib/*.ts` (deterministic, day-seeded) + `frontend/scripts/generate-*.ts`.
- SSR rule: no `Math.random()` in render paths — use `lib/rng.ts` (hydration safety).
- Offline: app playable with zero env (seed bank) — must not regress.

## Epics

### E1 — The Séance (polish + UX)
Files: `components/SeanceGame.tsx`, `SeanceGame.module.css`, `lib/seance.ts` (445 LOC), `lib/seanceFlavor.ts`.
AC:
- E1.1 Layout/formatting fixed — grid + clue panel legible, no overflow/misalignment (verify mobile + desktop).
- E1.2 Hint button: highlights the clue(s) that drive the next cell elimination/confirmation.
- E1.3 Undo/redo buttons + Cmd/Ctrl+Z (undo) / Shift+Cmd/Ctrl+Z (redo). State-machine over player marks.
- E1.4 Mark-clue-complete: user flags a clue done; warn "N more eliminations/confirmations possible with this clue" (computed from the deduction engine).
- E1.5 Capitalization normalized for items/people/rooms (consistent title/sentence case).
- E1.6 Category color-coding: each category + its words color-coded (source colors from `lib/types.ts` CATEGORY_HEX; a11y — never color alone, pair glyph/label).
- E1.7 Reword "besides" → "above"/"below" (positional clue phrasing in `lib/seance.ts`).
- E1.8 Full UI/UX pass: apply findings from the E6 QA lens.

### E2 — The Mystery (depth + engine)
Files: `lib/mystery.ts` (372 LOC, deduction engine), `components/MysteryInvestigate.tsx`, `MysteryVerdict.tsx`, `MysteryAccusationForm.tsx`, `MysteryIntro.tsx`, `Mystery.module.css`, `lib/mystery.test.ts`.
AC:
- E2.1 Full-screen dynamic layout — uses full viewport, scales fluidly to large screens (not fixed-width). Responsive at all breakpoints.
- E2.2 Rebalance WHERE/WHEN clues so room + hour are LESS obvious (currently 4/7 clues over-determine them). Keep `verifySolvable()` green.
- E2.3 Add deducible WEAPON + MOTIVE — currently picked as flavor with no clue trail. Add clue types that constrain weapon/motive to a unique answer; extend `verifySolvable()` to check.
- E2.4 Verdict/finish card names the weapon (`MysteryVerdict.tsx`).
- E2.5 Engine diversity — richer, less generic procedural stories (varied casts, motives, prose, structure) so each day feels distinct. Keep determinism + solvability.
- E2.6 More dynamic interactive elements the player manipulates (per Fable analysis).
- E2.7 Fable analysis of Mystery workflow → weak spots + fun/addictiveness/competitive-speed-scoring improvements (proposal to disk; Opus implements chosen items).

### E3 — Design system expansion (FOUNDATION)
Home: extend `docs/v2/DESIGN_SYSTEM.md`; tokens in `frontend/tailwind.config.ts` + `app/globals.css`.
AC:
- E3.1 Fable: better **light-mode** color schemes (current light mode is baseline; make it expert-level).
- E3.2 Fable: expert design guidelines — color schemes, layouts, mobile/desktop, cursors, functionalities — written into DESIGN_SYSTEM.md, deployable/reusable.
- E3.3 Reference-site inspiration distilled (10 sites in wishlist item 3 + existing refs) — take, don't clone.
- E3.4 Opus implements the guidelines as shared tokens/CSS/components other epics inherit.
- E3.5 Site reads as highly-designed/advanced; no AI-slop; a11y + perf preserved (lighthouse-ci gate stays green).
- **Gate:** E3.1–E3.3 proposal held for user OK (A5) before E3.4 implementation.

### E4 — Mobile friendliness (all pages/games)
AC:
- E4.1 Every route (`app/*`) + game component responsive: no horizontal scroll, tap targets ≥44px, readable type, usable controls on phone widths (360–430px).
- E4.2 Verified via playwright mobile snapshots + lighthouse mobile a11y.
- Inherits E3 tokens.

### E5 — Games meta (navigation + numbering + per-game gameplay)
Files: `components/RoomShell.tsx`, `Deck.tsx`, `CardFace.tsx`, all `*Game.tsx`, home `app/page.tsx`.
AC:
- E5.1 Logo top-left on every game page = back-to-home nav (natural).
- E5.2 Playing-card rank top-right on each game page (Mystery=Ace, Codex=2, … ranks already in `Deck`/`page.tsx` GAMES). Renumber/verify consistency.
- E5.3 Jukebox rendered as the Joker, top-right slot.
- E5.4 Fable assessment of EACH remaining game's gameplay → improvements; Opus implements.
- E5.5 Every game passes a UI/UX QA pass (functionality, aesthetics, creativity, web design) — uses E6.

### E6 — UI/UX QA process (tooling for future sessions)
AC:
- E6.1 Reusable skill/command (`/ui-qa` or repo skill) that runs the design-review + playwright/lighthouse loop on a page/game and reports findings (aesthetics, functionality, mobile, a11y, creativity).
- E6.2 Documented so future sessions invoke it; wraps existing gstack design-review/qa skills where sensible (ponytail — don't rebuild).
- E6.3 Used to drive E1.8 / E5.5 / E4.2 in this run (dogfood it).

## Dependency shape (B refines)
- E3 = foundation (all visual epics inherit tokens/guidelines).
- E6 = early tooling (E1/E4/E5 QA passes consume it) — can run parallel to E3.
- E1, E2 = independent game epics (inherit E3).
- E4 = cross-cutting (inherit E3; touches all games — sequence after E1/E2/E5 structural changes or coordinate).
- E5 = games-meta (inherit E3; E5.4 Fable-per-game can parallelize).

## Non-goals / guardrails
- No new tile-server / map deps (offline WorldMap stays).
- No frontend DB writes; reads stay read-only + seed fallback.
- No AI attribution in commits/PRs/branches.
- Determinism + solvability of Séance/Mystery must not regress (their tests gate).
