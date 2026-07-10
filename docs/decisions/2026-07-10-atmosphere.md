# 2026-07-10 — Atmosphere skins + F1 sensory primitives

Orchestrator cycle: F1 foundation (audio / fx / text) + per-room premium atmosphere skins
(E1a seance-fn, E1b seance-atmo, E2 mystery, E3 chronos, E4 fractures, E5 ignite, E6 atlas,
E7 thread). Landed `main` @ `5321f00`. Harvested from `.orchestrator/` at cleaning.

## Decisions (decided:)

- **F1 audio**: imperative singleton, no React context/provider. Ambient = procedural detuned
  drone per room (seamless by construction), silent under mute OR reduced-motion, remembers
  intent so unmute resumes. `setMuted()` is single authority (muting tears down the bed).
  Optional `/audio/ambient-<room>.mp3` + `/audio/stinger.mp3` UPGRADE synth when present
  (cached-miss → never refetch). Rooms call `startAmbient` on mount / `stopAmbient` on unmount.
- **F1 fx**: shared `useReducedMotion` hook — every animating primitive freezes to a designed
  still frame (RAF dropped) under `prefers-reduced-motion`. Palette resolves RGB-channel tokens
  at runtime (`rgb(var(--x))`) so it re-tints with theme. **≤1 animating LOOP per viewport** —
  each primitive exposes `animate` (defaults: ParticleField true, others false); a room composing
  several leaves `animate` on at most ONE.
- **F1 text**: scale via root font-size (not per-token clamp / tailwind override) — single-source,
  `--text-scale` multiplies everything incl. the clamp. Desktop base stays 16px (pixel-identical
  tuned desktop); only phones shrink. No tailwind/types token retune needed.
- **Per-room atmosphere skins** each honor the ≤1-loop floor by picking ONE lifetime loop and
  leaving all other F1 primitives static (`animate=false`): seance=planchette, chronos=dust,
  fractures=mote field, ignite=ember field (progress-driven), atlas=in-canvas WebGL twinkle,
  thread=woven-SVG sheen. Atmosphere sits at `zIndex:0` behind Q&A text; reduced-motion → 0 loops.
- **E1a seance-fn**: derived-overlay auto-elim (store manual marks only, recompute display) over
  a 4th mark state — "release unless still forced" falls out free, solve-validation can't regress.
  New export `withAutoElim`. NEVER persist auto-X (solve-check reads manual confirms only).
- **E2 mystery**: did NOT change case generation (`mysteryPuzzle.ts` untouched) — improve via
  layered reasoning, not raw suspect count; keeps invariant + existing tests. Pipeline untouched.

## Gotchas (durable)

- `AmbientGlow` `vignette` prop is a **color string, not a boolean** — pass a color or omit
  (defaults on).
- Seance E1a class hooks that E1b skins (do NOT break): `.shell/.hud/.main/.hintRail/.clue*/
  .matrixWrap/.matrix/.catAxis/.valHead/.seatHead/.corner/.cellTd/.cell/.wisp/.colHi/.groupStart/
  .nav`. Invariants: transposed grid (seats=cols), `table-layout:fixed;width:100%` (no h-scroll),
  2.75rem cell floors. At n=7@320px cell WIDTH shrinks under 44px to honor no-h-scroll (that
  invariant wins); height stays ≥44px. Tall grids still scroll vertically (unavoidable at floor).
- Pre-existing `react-hooks/exhaustive-deps` warning on `WedgesGame` countdown effect remains
  (not introduced this cycle; lint exit 0).

## Pending (soft blockers — assumed defaults shipped, real assets UPGRADE later)

- Real audio assets (CC0/licensed, offline-bundled, no CDN per CSP) → `frontend/public/audio/`.
  Shipped on Web Audio synth + procedural + graceful silence; committed assets only upgrade.
- Ghost/texture imagery (photoreal sprites / wood / brass / parchment) → `frontend/public/`.
  Shipped procedural (SVG/CSS/canvas silhouettes + textures).

## Process

- 4 units hit maxTurns truncation mid-work (e4-fractures, e2-mystery, e1a-seance-fn — 0 commits,
  uncommitted worktree edits) → SendMessage-resumed to finish + DoD + commit. All resolved.
