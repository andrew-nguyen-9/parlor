# PARLOR documentation

Start here. **v3 is the active framework** (`3.x.x` segments, code comments cite
its `§3.x` numbers). v2 is the shipped baseline whose `DESIGN_SYSTEM.md` remains
the live design canon. v1 docs and finished-run artifacts live in `archive/`.

## Active (v3)

| Doc | Read it for |
|---|---|
| [`v3/ROADMAP.md`](v3/ROADMAP.md) | The spine: every `§3.x` segment, versioning (`3.x.x`, one minor per segment), conflict firewall, schedule |
| [`v3/GAMES.md`](v3/GAMES.md) | Per-game segment specs |
| [`v3/PIPELINE.md`](v3/PIPELINE.md) | Data/pipeline segments |
| [`v3/PLATFORM.md`](v3/PLATFORM.md) | Platform segments (SEO, perf, a11y, share) |
| [`v3/PHASE_PROMPTS.md`](v3/PHASE_PROMPTS.md) / [`v3/RUN_PROMPTS.md`](v3/RUN_PROMPTS.md) | Copy-paste initiation prompts to start a segment |
| [`v3/IDEAS.md`](v3/IDEAS.md) | The idea menu the roadmap was cut from (superseded for what ships) |
| [`v3/qa/`](v3/qa/) | Reusable preview-QA harness (`gates.mjs`) + run records |

## Design canon (v2, still live)

| Doc | Read it for |
|---|---|
| [`v2/DESIGN_SYSTEM.md`](v2/DESIGN_SYSTEM.md) | **Canonical visual language** — tokens (light+dark, WCAG-AA, jewel-ink tier), card-deck system, reference-site learnings. E3 (2026-07) merged here |
| [`v2/ROADMAP.md`](v2/ROADMAP.md), [`v2/GAMES.md`](v2/GAMES.md), [`v2/PLATFORM.md`](v2/PLATFORM.md) | The shipped v2 baseline (frozen at v2.0.0) |
| [`v2/CANON.md`](v2/CANON.md) | Secret Order world-building canon |

## Repo map

[`FILE_INDEX.md`](FILE_INDEX.md) — annotated map of every directory and file.

## History

| | |
|---|---|
| [`../CHANGELOG.md`](../CHANGELOG.md) | Version policy (1.0.0 frozen → 2.x.x → 3.x.x) + history |
| [`archive/`](archive/) | v1.0.0 docs (`UI_SPEC.md`, `ARCHITECTURE.md`, …) |
| [`archive/orchestrator-2026-07-ux/`](archive/orchestrator-2026-07-ux/) | 2026-07 six-epic UX overhaul: spec, proposals (design rationale), per-room QA reports, deferred-findings backlog |
| [`archive/superpowers/`](archive/superpowers/) | 2026-06 brainstorm plans + design specs (mystery rework/redesign, music depth §3.13) — all shipped |
