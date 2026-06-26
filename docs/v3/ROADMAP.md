# PARLOR v3 — Roadmap

The spine of v3. Companion docs hold the detail: [`GAMES.md`](GAMES.md),
[`PIPELINE.md`](PIPELINE.md), [`PLATFORM.md`](PLATFORM.md). To **start** a
segment, open [`PHASE_PROMPTS.md`](PHASE_PROMPTS.md). [`IDEAS.md`](IDEAS.md) is
the menu this roadmap was cut from — superseded by this file for what ships.

## Why v3

v2 shipped ten refurbished rooms over a nightly-forged bank, the Secret Order
brand, two server-side daily logic puzzles, and the Mystery hub — single-player,
anonymous, localStorage-only. v3 has four jobs:

1. **Deep-dive every game** — better play, a desktop layout where *everything
   fits one screen* (no scrolling to play), and a social/competitive hook.
2. **Unblock the pipeline** — Séance ("The Séance") and Ladder ("The Climb of
   the Initiate") are dark because the nightly fails at the **dbt transform
   step**. Fix it.
3. **Raise content quality** — multiple-choice distractors are too obviously
   wrong; Deezer music clues leak the answer in the album art. Rework both, and
   grow music trivia.
4. **Build the growth loop** — share cards + emoji result grids off the existing
   day-seeded determinism. **No DB writes, no accounts** (decided — see below).

## Decisions (locked)

- **Social scope = share-cards + local-only.** Per-game OG share images
  (`@vercel/og`) and Wordle-style emoji result grids. The v2 invariant "the
  frontend never writes the DB" **stays intact** in v3. Async leaderboards,
  private rooms, and realtime are explicitly deferred.
- **Legacy rooms retire.** Jukebox, Gallery, Blitz, Connections, and the
  multiplayer Lobby leave the deck + sitemap in v3.0; any unique mechanic folds
  into a keeper (Jukebox audio → the new audio room v3.22; Lobby → nothing,
  social is share-only).
- **serena is not installed.** Semantic code retrieval uses the `Explore` agent
  + `cavecrew-investigator` + Grep/Glob. (To add real serena: `claude mcp add`.)
- **Sequence:** Foundation Freeze (v3.0) → the parallel swarm.

## The conflict firewall (the reason v3 can run 27 sessions at once)

> **Only v3.0 touches shared files. Every other segment touches its own
> component(s) + its own new files only.**

Shared files — the collision surface for parallel work — are: `lib/types.ts`,
`lib/queries.ts`, `lib/rooms.ts`, `app/page.tsx` (`GAMES[]`), `app/globals.css`,
`db/schema.sql`. **v3.0 lands every change to these up front** (new qtypes,
routes, schema columns, shared tokens, the share-card infra, legacy removal).
After v3.0 merges, a game segment editing only `BoardGame.tsx` +
`BoardGame.module.css` and *calling* `lib/share.ts` cannot conflict with any
other segment. Each segment in `PHASE_PROMPTS.md` ships with an explicit
**file-allowlist**; a session that needs to touch a shared file has hit a
foundation gap → it stops and the gap is folded back into a v3.0 follow-up,
never edited in-segment.

**v3.0 is a HARD GATE.** It must be merged to `v3` before *any* v3.1+ session
launches. Run it solo first, then unleash the swarm.

## Version policy

v2.0.0 is the frozen baseline. v3 is `3.x.x`, **one minor per segment**, landing
on the `v3` integration branch via `phase/3.N-<slug>` sub-branches (PR into
`v3`). The PR bumps `frontend/package.json` to the segment version. When all
segments land, `v3 → main`, tag **`3.0.0`**.

```
main ── v3 ──┬── phase/3.0-foundation-freeze   (HARD GATE — merge first)
             ├── phase/3.1-board ┐
             ├── phase/3.2-clock │  parallel swarm,
             ├── …               │  file-isolated
             └── phase/3.26-...  ┘
```

## Segment tree (27 segments)

### Wave A — Foundation (serial, first)

| Seg | Name | Goal | Detail |
|---|---|---|---|
| **3.0** | Foundation Freeze | All shared-file edits: new qtypes/schema/routes, shared desktop tokens + CSS-module convention, `lib/share.ts` + `@vercel/og` endpoint, **legacy retirement** | PLATFORM §3.0 |

### Wave B — Game deep-dives (10 parallel; each owns one component cluster)

Every game segment carries the same three-part mandate: **(a)** gameplay
deep-dive, **(b)** desktop one-screen fit, **(c)** social via `lib/share.ts`.

| Seg | Room (in-world) | Component(s) it owns | Detail |
|---|---|---|---|
| **3.1** | Board (Codex) | `BoardGame.tsx` | GAMES §3.1 |
| **3.2** | Clock (Chronos) | `ClockGame.tsx` | GAMES §3.2 |
| **3.3** | Wedges (Fractures) | `WedgesGame.tsx` | GAMES §3.3 |
| **3.4** | Streak (Ignite) | `StreakGame.tsx` | GAMES §3.4 |
| **3.5** | Map (Atlas Obscura) | `MapGame.tsx`, `WorldMap.tsx` | GAMES §3.5 |
| **3.6** | Thread | `ThreadGame.tsx` | GAMES §3.6 |
| **3.7** | Séance | `SeanceGame.tsx` | GAMES §3.7 (data ← 3.11) |
| **3.8** | Ladder (Climb of the Initiate) | `LadderGame.tsx` | GAMES §3.8 (data ← 3.11) |
| **3.9** | Mystery (Sanctum Mysterii) | `Mystery*.tsx` cluster | GAMES §3.9 |
| **3.10** | Gauntlet | `GauntletGame.tsx` | GAMES §3.10 |

### Wave C — Pipeline & content (parallel; pipeline-only, no frontend files)

| Seg | Name | Goal | Detail |
|---|---|---|---|
| **3.11** | Transform Fix | Debug + fix the dbt transform failure starving Séance + Ladder | PIPELINE §3.11 |
| **3.12** | Distractor Overhaul | Rework forge distractor generation so wrong answers are plausibly close, not obvious | PIPELINE §3.12 |
| **3.13** | Deezer + Music Depth | Kill album-art answer leaks; broaden music qtypes | PIPELINE §3.13 |

### Wave D — IDEAS implementation (parallel where files allow)

| Seg | Name | Goal | Detail |
|---|---|---|---|
| **3.14** | Share-card polish | OG-image system + result-card gallery | PLATFORM §3.14 |
| **3.15** | Wikidata source | Keyless SPARQL source broadening every category | PIPELINE §3.15 |
| **3.16** | Screen starvation fix | Keyless film/TV source (debt #1) | PIPELINE §3.16 |
| **3.17** | Per-source health floor | Per-(source/category) floor in the nightly gate (debt #3) | PIPELINE §3.17 |
| **3.18** | Quality scoring | Ambiguity/quality score in the forge so the board picks good clues | PIPELINE §3.18 |
| **3.19** | Weak-spot practice | Route practice to the player's weakest category (localStorage) | PLATFORM §3.19 |
| **3.20** | Return loop | Streaks + a grimoire-style collection generalized across rooms | PLATFORM §3.20 |
| **3.21** | Themed daily sets | A cross-room motif day ("music night", "1969") | PLATFORM §3.21 |
| **3.22** | Audio room | "Name the intro" room from Deezer 30s previews (absorbs Jukebox) | GAMES §3.22 |
| **3.23** | Hard-mode Mystery | A weekly multi-day cross-room case | GAMES §3.23 |
| **3.24** | Preview deploy + QA gates | Stand up a preview deploy; run the 4 deferred v2 QA gates (debt #2) | PLATFORM §3.24 |
| **3.25** | Edge-cache daily reads | Per-day cache key for Séance/Ladder Neon reads | PLATFORM §3.25 |
| **3.26** | Lighthouse CI gate | Budget gate on PRs | PLATFORM §3.26 |

## Dependencies

- **3.0 blocks everything** (hard gate).
- Within Waves B/C/D, segments are **mutually independent** by construction
  (file-isolated). Suggested order is convenience, not constraint.
- **3.7 + 3.8 consume 3.11's output** — their UI work proceeds in parallel, but
  their END STATE ("daily puzzle renders with real data") only verifies once
  3.11 lands. Sequence 3.11 early in Wave C.
- **3.24 (preview deploy) unblocks live QA gates** that several game segments'
  END STATEs reference (Lighthouse/one-screen verification). Land it early in
  Wave D, parallel to the games.
- **3.22 (audio room)** depends on 3.0 having registered its route + qtype.

## Run schedule — 3 sessions at a time

Cadence is **three simultaneous sessions**. v3.0 runs **alone first** (hard gate),
then eight batches of three (last batch is two). Two scheduling rules keep every
batch conflict-free beyond the shared-file firewall:

- **≤1 pipeline segment per batch.** `question_forge.py` and `selftest.py` are
  shared across pipeline segments (3.12/3.13/3.15/3.16/3.17/3.18 all touch the
  forge and/or selftest), so only one runs at a time. The other two slots are
  always frontend (games / new-file platform), which own disjoint files.
- **3.7 + 3.8 land after 3.11.** Their data needs the transform fix; schedule them
  in a batch after 3.11 has merged.

| Batch | Session 1 | Session 2 | Session 3 | Why grouped |
|---|---|---|---|---|
| **Gate** | **3.0 Foundation** | — | — | hard gate, solo, merge before all |
| **1** | 3.11 Transform Fix | 3.1 Board | 3.2 Clock | clear the data blocker; two games set the per-game template |
| **2** | 3.12 Distractors | 3.3 Wedges | 3.24 Preview deploy | front-load QA infra for later game live-checks |
| **3** | 3.13 Music/Deezer | 3.4 Streak | 3.5 Map | — |
| **4** | 3.16 Screen fix | 3.6 Thread | 3.9 Mystery | — |
| **5** | 3.15 Wikidata | 3.7 Séance | 3.8 Ladder | Séance/Ladder now have data (3.11 merged in b1) |
| **6** | 3.17 Health floor | 3.10 Gauntlet | 3.14 Share polish | — |
| **7** | 3.18 Quality score | 3.19 Weak-spot | 3.20 Return loop | — |
| **8** | 3.21 Themed days | 3.22 Audio room | 3.23 Hard Mystery | new rooms + theming |
| **9** | 3.25 Edge-cache | 3.26 Lighthouse CI | — | two left |

Batches are independent — slip a session and the rest still run. Only ordering
constraints: the gate first, and 3.7/3.8 after 3.11.

## Requirement → segment traceability

| Request | Segment(s) |
|---|---|
| 10 game deep-dives (improve, one-screen desktop, social) | **3.1–3.10** |
| Pipeline failing at transform step (Séance + Ladder dark) | **3.11** |
| MC answers too obvious / distractors too close to review | **3.12** |
| Deezer too easy (album art leaks answer) | **3.13** |
| More music trivia + brainstormed types | **3.13** |
| Socially competitive (share cards, no accounts) | **3.0** infra + per-game **3.1–3.10** + **3.14** |
| Implement v3 IDEAS menu | **3.14–3.26** |
| Legacy rooms decision | **3.0** (retire) |
| Plugin/skill integration in planning | every block in `PHASE_PROMPTS.md` |

## Tooling loop (applies to every segment)

- **Always on:** rtk (git/file ops), caveman + ponytail, `rtk` for shell.
- **Locate code:** `Explore` agent / `cavecrew-investigator` (token-cheap) /
  Grep+Glob. (No serena.)
- **Process skills first:** `superpowers:brainstorming` before any mechanic
  redesign; `superpowers:systematic-debugging` before any bug fix (3.11);
  `superpowers:verification-before-completion` before claiming done.
- **Visual work:** `frontend-design` / `ce-frontend-design` → verify with
  `chrome-devtools` (`lighthouse_audit`, `resize_page` for the one-screen check,
  `performance_*`) + `playwright`.
- **Docs/APIs:** `context7` for Framer Motion / Next.js / `@vercel/og`.
- **Platform:** `vercel:*` skills for deploy/env/QA segments.
