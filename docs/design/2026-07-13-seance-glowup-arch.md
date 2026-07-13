# Séance Glow-Up — Cycle Architecture (2026-07-13)

Durable design record for the Séance glow-up big cycle. Cycle-scoped trackers (briefs, prd, depmap,
progress) live in `.orchestrator/` and die at cleaning; this file is the design rationale that survives.

## Shape
Deep-clean + premium UI overhaul of The Séance, a site-wide settings system, deeper audio, delivery/mobile
optimization, and a reusable game-glow-up template. Flow: **Session B authored the 600-MCQ intake + all briefs →
USER confirms the intake (the ONE blocker) → Session C implements → Session D lands.** The intake's recommended
`[x]` picks ARE the assumed spec; the gated units build against them.

## Units (7) + wave order
1. **e0-settings-foundation** (W1, foundation) — global SettingsHub in RoomShell; DEFINES the settings API
   (theme/text-size/volume/mute/calm-mode/quality) every visual+audio unit consumes. Highest blast radius.
2. **e5-delivery** (W1, independent) — Vercel meter audit + config-level perf + report. Answer-independent.
3. **e4-audio-infra** (W2, dep e0) — cue engine on `lib/sound.ts` routed through global volume/mute.
4. **e2-seance-ui** (W2, dep e0, E1-gated) — the 13 UI issues + full-bleed immersion + Ouija amplification +
   Apple-fy + `applySkin("seance")` + **mobile** (E5-mobile folded here). The big unit.
5. **e3-tutorial** (W3, dep e0+e2, E1-gated) — animated board-fill walkthrough; matches e2's shipped look.
6. **e4-audio-content** (W3, dep e4-infra+e2, E1-gated) — Séance cues + event wiring atop the overhauled board.
7. **e6-playbook** (W4, dep content) — reusable game-glow-up playbook + lessons.

## Key seam decisions
- **Foundation-first.** E0 is genuinely shared (site-wide settings via RoomShell); its `.done.md` carries the
  settings API so e2/e3/e4 don't re-derive it. Map: all-visual → e0.
- **E5-mobile folded into e2.** Mobile responsiveness and the 13 desktop issues edit the SAME `SeanceGame.tsx` /
  `.module.css`; splitting them means two units on one file (unmergeable in parallel) AND worse craft — a layout
  is overhauled responsively in one pass, not desktop-then-mobile. Spec keeps them conceptually distinct (separate
  QA: `/ui-qa /seance` + `/ui-qa /seance mobile`); implementation is one unit.
- **SeanceGame.tsx hot-file sequencing.** e2 (visual, W2) → e4-audio-content (cue calls, W3) edit it in SEPARATE
  waves; e4-content branches off the integration that already has e2's version. No parallel conflict. e2 adds NO
  audio calls; e4-content adds NO visual changes.
- **Audio split.** Infra (answer-independent, W2) vs content (answer-gated, W3): the engine + gating can build
  before the intake is confirmed; the assets + event mapping wait on the picks.
- **e3 new files isolated** under `frontend/components/tutorial/` (fresh subdir) so its created-file dir-prefix
  can't collide with `SeanceGame.tsx` or `components/seance/*` in the conflict scan.
- **Gate.** e2/e3/e4-content wait on the E1 blocker tick (`blockers.md`, user-attested). e0/e5-delivery/
  e4-infra/e6 are non-gated. All of wave 1 is non-gated → wave 1 always runs.

## Intake structure (E1 — the reusable template)
- **CORE** (`docs/planning/design-intake/_core.md`, ~280 Qs, 6 sections) — game-agnostic (settings/motion/audio/
  perf/mobile/premium); reused verbatim by the next ~11 games.
- **Séance** (`docs/planning/design-intake/seance.md`, ~272 Qs, 6 sections) — game-specific; replaces + expands
  the 44-Q seed, preserving its picks and adding rationale lines.
- Authoring contract + doctrine + Floors: `docs/planning/design-intake/AUTHORING.md`. Doctrine = bold, v4-led,
  Apple-fy (restraint + depth), rich-but-disciplined (CSS/GPU-cheap, ≤1-loop, zero new Vercel cost), accessible
  by construction, self-consistent.

## Invariants held (from CLAUDE.md + design/INDEX §Floors)
Zero-env build/test/play (seed-bank); frontend never writes DB; **Séance logic frozen**; no new tile/CDN/image-opt/
function cost; date-seeded `lib/rng.ts` (no `Math.random` in SSR); every animation reduced-motion-safe (≤1 loop);
≥44px targets; contrast AA both themes; category = color+glyph+label; skins change only non-Floor `--skin-*` seams.
