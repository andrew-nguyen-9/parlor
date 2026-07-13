# PARLOR documentation

The active framework (`3.x.x` segments; code comments cite its `§3.x` numbers).
Superseded versions (v1, v2) live in git history — `git log` the file. The
canonical **design system** is the root [`design/`](../design/) North Star
(`INDEX.md`, `FOUNDATIONS.md`, `UI-KIT.md`, …), codified from shipped code.

## Framework

| Doc | Read it for |
|---|---|
| [`ROADMAP.md`](ROADMAP.md) | The spine: every `§3.x` segment, versioning (one minor per segment), conflict firewall, schedule |
| [`GAMES.md`](GAMES.md) | Per-game segment specs |
| [`PIPELINE.md`](PIPELINE.md) | Data/pipeline segments (`question_forge` etc.) |
| [`PLATFORM.md`](PLATFORM.md) | Platform segments (SEO, perf, a11y, share, db seam) |
| [`PHASE_PROMPTS.md`](PHASE_PROMPTS.md) / [`RUN_PROMPTS.md`](RUN_PROMPTS.md) | Copy-paste initiation prompts to start a segment |

## Folders

| Path | Contents |
|---|---|
| [`decisions/`](decisions/) | Dated decision logs (`YYYY-MM-DD-topic.md`), incl. harvested cycle records |
| [`design/`](design/) | Cycle design working notes + engine contracts (root `design/` is the canonical system) |
| [`research/`](research/) | Spikes — animations, free-audio sources |
| [`planning/design-intake/`](planning/design-intake/) | Per-game + per-tech design-intake specs (authoritative engine design source) |
| [`v4/`](v4/) | Long-form game "bibles" — the design canon the intake specs are grounded in |
| [`qa/`](qa/) | Reusable preview-QA harness (`gates.mjs`) + run records |

Version policy + history: [`../CHANGELOG.md`](../CHANGELOG.md).
