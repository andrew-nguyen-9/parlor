# DECISIONS — append-only

challenge-by = decision date + one INDEX cadence interval, unless the decider sets
longer. Cadence is `each release` → challenge-by = `next release` (not a duration).
Tags in the decision cell: `wildcard:<FILE>`, `trial`, `defaulted`.

| date | decision | why | challenge-by |
|------|----------|-----|--------------|
| 2026-07-06 | Extract-mode North Star: codify the shipped "haunted Victorian mansion" system as-is; rejected inventing a new look, rejected a from-scratch rebrand | brief F1 = aggregate the existing site, never invent; tokens are frozen (`STYLING.md`) | next release |
| 2026-07-06 | Direction = one, codified from `docs/v2/DESIGN_SYSTEM.md` + `globals.css` + `lib/types.ts`; light theme is a semantic-role remap, not a brand swap | dark and light already ship from one token set; a second direction would contradict shipped code | next release |
| 2026-07-06 | Category is two-tier: `CATEGORY_HEX` FILL (theme-invariant) vs `--cat-*` INK (text-safe, per-theme); text via HEX is a bug | several fills fail AA as text; preserves the shipped `types.ts` contract | next release |
| 2026-07-06 | Full specs for 8 core shells only; game-room components stay one-line `live` rows | 40 full specs exceed UI-KIT's 250-line cap; rooms self-document in code + PATTERNS | next release |
| 2026-07-06 | Floors adopt the shipped project constraints (Q&A legibility over effects; zero-JS/seed-bank frame is the design; ≤1 loop/viewport; one light source; category never color-alone) as hard floors | these are already enforced in `globals.css`/CLAUDE.md; the North Star records them so no future unit regresses them | next release |
| 2026-07-09 | 3D/animation cycle adopts F1's `ThreeStage`/`FluidStage` as the ONLY sanctioned 3D/full-width primitives — kinematic-only (no physics engine), one light source still holds in 3D scenes | keeps the deterministic logic-core invariant + the mansion's one-light-source rule from fragmenting per room (`docs/design/cycle-2026-07-09-3d.md`) | next release |
| 2026-07-09 | `wildcard:INDEX.md` WebGL-less / renderer-error fallback promoted to a hard Floor (accessible static/DOM fallback, never a full-page crash) | E12 QA found `/clock` + `/map` 100% dead without WebGL (backlog 🔴 #2 — no `error.tsx`, unguarded `WebGLRenderer`); Streak's Phaser degrade is proof the pattern works | next release |
| 2026-07-09 | `wildcard:INDEX.md` every room renders exactly one `<h1>` (RoomShell `title` prop) | E12 found 5/15 routes with no page heading (backlog 🟠 #3) | next release |
| 2026-07-09 | `defaulted` touch-target floor (≥44px) explicitly covers in-game grid/chip cells, not chrome-only | E12 found sub-40px cells in seance/ladder/mystery play areas (backlog 🟠 #4, 🟡 #6) — the floor already implied this; the wording gap let it regress | next release |
| 2026-07-09 | `trial` PATTERNS room table corrected: `/map` (Atlas Obscura) is a constellation-deduction puzzle over a Three.js starfield, NOT a `WorldMap` geo pin-drop; the pin-drop-scored-by-km round lives in `/gauntlet` | prior table row mismatched code (`atlasPuzzle.ts` is star/constellation data; `WorldMap` is imported by `GauntletGame.tsx`, not `MapGame.tsx`) — doc-only correction, no code change | next release |

## Drift — shipped code vs system (Extract findings; append resolutions, never rewrite rows)
| where | code says | system says | resolved |
|-------|-----------|-------------|----------|
| `components/CardFace.tsx` | card text uses literal hex (`#43141f`, `#5a2230`) inline | tokens-only, EXCEPT theme-invariant deck/share-card faces | not-drift — sanctioned exemption (FOUNDATIONS §5); documented, no change |
| Button / CTA | no shared component; each room re-does the pill in Tailwind | UI-KIT specs one Button shell | open — extract a shared `Button` (Update unit); until then follow the specced pattern |
| Inputs (text/select) | per-room ad hoc, no shared spec | core-tier component, `planned` | open — spec on first Update that touches a form |
| `lib/games.ts` | still lists `cold-case` (rank 11) | F1 catalogs 11 rooms AFTER cold-case retirement | open — retirement owned by a separate unit; PATTERNS catalog excludes it |
| `frontend/CLAUDE.md` line | not yet added | north-star.md wants a `Design: design/INDEX.md …` findability line in CLAUDE.md | open — F1 owns `design/**` only; flagged for the owner of root docs to add |
| `components/ThreeStage.tsx:115` / `app/error.tsx` | `WebGLRenderer` unguarded, no error boundary exists | INDEX §Floors: WebGL-less/error → accessible fallback, never a crash | open — E12 backlog 🔴 #1/#2; owner E9 (guard) / E13 (fallback visual, this cycle's floor codified, visual not yet specced) |
| `RoomShell.tsx` | no `title`/`<h1>` prop; seance/thread/ladder render none | INDEX §Floors: every room exactly one `<h1>` | open — E12 backlog 🟠 #3; owner E13 (prop spec) — add to UI-KIT RoomShell spec on the Update that ships it |
| seance/ladder/mystery cells | sub-40px in-game touch targets (85/25/13px @320) | PATTERNS §Mobile: floor covers grid/chip cells | open — E12 backlog 🟠 #4; owner E13 (sizing) + E9 (seance rotation) |
