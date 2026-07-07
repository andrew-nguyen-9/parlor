# File Index

Annotated map of the repository, for fast navigation. Paths are relative to repo
root. Keep this current as v3 segments add/rename files.

## Top level

| Path | Purpose |
|---|---|
| `README.md` | Project overview, rooms table, quick start, pipeline + setup |
| `CLAUDE.md` | Instructions for Claude Code working in this repo |
| `CHANGELOG.md` | Version policy (1.0.0 frozen → 2.x.x → 3.x.x) + history |
| `LICENSE` | MIT license |
| `vercel.json` | Vercel config: cache headers (1y immutable images), security headers |
| `.env.example` | Env template (DATABASE_URL, TMDB_API_KEY, NEXT_PUBLIC_SUPABASE_*) |
| `.logo/` | Brand source assets — "Logo V10 - Secret Order" (svg/png/jpg): engraved gold spade + all-seeing eye + candle + glyph ring on oxblood |
| `.claude/skills/ui-qa/` | `/ui-qa <route>` skill — snapshot + Lighthouse + design-rubric QA loop (reports to gitignored `.orchestrator/qa/`) |
| `frontend/` | Next.js 15 App Router app (the serving path) |
| `pipeline/` | Python ETL scripts (GitHub Actions cron) |
| `transform/` | dbt Core + DuckDB project (bronze → silver → gold) |
| `db/` | Postgres schema + migrations |
| `data/` | Bronze JSONL layer (committed; the database in DB-less mode) |
| `databricks/` | Phase-2 Delta Lake mirror lab (research, NOT the serving path) |
| `supabase/` | Supabase migrations/config (optional live-DB mode) |
| `docs/` | Documentation — v3 active framework, v2 design canon, `archive/` history (see `docs/README.md`) |
| `graphify-out/` | Generated knowledge-graph of the repo (graphify tool cache; regenerable — dates from 2026-06, pre-UX-overhaul) |
| `.github/workflows/` | CI: `etl_daily.yml`, `wiki_hard.yml`, `puzzles_daily.yml`, `lighthouse.yml` |

## `frontend/app/` — routes (Server Component `page.tsx` → client `*Game.tsx`)

| Route | Game | Notes |
|---|---|---|
| `/` | home | card-deck of game rooms (`Deck` + `CardFace`), ticker, footer |
| `/mystery` | Sanctum Mysterii (Ace) | daily deterministic case — WHO/WHERE/WHEN/MOTIVE/WEAPON, `verifySolvable` gated |
| `/board` | Codex | Jeopardy board, daily double, easy/hard (2× stakes), daily themes |
| `/clock` | Chronos | year deduction from bounding clues, rotating calendar systems |
| `/wedges` | Fractures | Trivial-Pursuit wedges, per-category bonus, speed points |
| `/streak` | Ignite | higher/lower comparison chain, witch's candle |
| `/map` | Atlas Obscura | pin on `WorldMap` (offline polygons), daily civilization theming |
| `/gauntlet` | The Gauntlet | five timed trials, escape-time score (`/daily` redirects here) |
| `/thread` | The Thread | linked-clue chain, each answer feeds the next |
| `/seance` | The Séance | logic-grid deduction: clues, hints, undo/redo, whisper scratchpad, weekly grimoire |
| `/ladder` | Climb of the Initiate | rung-by-rung sequence puzzles (pre-generated archive) |
| `/overture` | The Overture (Joker) | name-the-intro audio rounds (Deezer previews) |
| `/profile` | player dashboard | XP, accuracy, streaks, achievements, collection (localStorage) |
| `/about`, `/sitemap` | site pages | about + human-readable room directory |
| `api/og/[room]` | OG images | share-card renders (`@vercel/og`) |
| `layout.tsx` / `globals.css` / `template.tsx` | shell | metadata, fonts, design tokens (light+dark, `--c-*`/`--cat-*`), page transitions |

## `frontend/components/`

| File | Purpose |
|---|---|
| `RoomShell.tsx` | Frame around every game: logo→home (top-left), `RankBadge` (top-right), nameplate |
| `Deck.tsx`, `CardFace.tsx` | Home-page playing-card deck; ranks/suits/joker from `lib/games.ts` |
| `Marquee.tsx` | Infinite scrolling fact ticker |
| `SiteFooter.tsx`, `ThemeToggle.tsx`, `SoundToggle.tsx` | Chrome: footer credits, light/dark flip, mute |
| `WorldMap.tsx` | Offline SVG world map (lazy `world-atlas` topojson) — REQUIRED fallback, zero network |
| `GoogleMap.tsx` | Env-gated raster alternative for the Map room |
| `LeaderboardPanel.tsx` | Score submit + top-10 (Supabase or localStorage fallback) |
| `AchievementToast.tsx`, `Confetti.tsx` | Unlock toasts, canvas particle burst |
| `PracticeBar.tsx`, `RoomFilters.tsx` | Practice mode + deck/difficulty filters |
| `ProfileDashboard.tsx` | Activity heatmap, XP, per-room/category stats, collection |
| `ShareCardGallery.tsx`, `NotFoundCards.tsx` | Share-card showcase, 404 page deck |
| `BoardGame` `ClockGame` `WedgesGame` `StreakGame` `MapGame` `GauntletGame` `ThreadGame` `SeanceGame` `LadderGame` `AudioRoomGame` | Game clients (one per room; `AudioRoomGame` = Overture) |
| `MysteryGame` + `Mystery{Intro,Investigate,Verdict,StatusPill}` | Mystery room (accusation inlined in `MysteryInvestigate`) |
| `*.module.css` | Per-room scoped styles |

## `frontend/lib/`

| File | Purpose |
|---|---|
| `queries.ts` | ALL data access; Neon (`db.ts`) first, silent seed-bank fallback; re-renders archived Séance clue prose |
| `types.ts` | `Category`, `QType`, `Question`, `CATEGORY_HEX` fills + `CATEGORY_INK` text tier + glyphs (single source) |
| `db.ts` / `supabase.ts` | Neon serverless + Supabase anon clients (read-only, null-safe) |
| `rng.ts` | Date-seeded PRNG (`mulberry32`, `daySeed`, `shuffled`) — SSR/client consistency |
| `games.ts` | THE deck registry: rank/suit/joker per room (Ace=Mystery … Joker=Overture); feeds `Deck`/`CardFace`/`RankBadge` |
| `rooms.ts` | Room metadata (labels, accents, hrefs) for site pages |
| `profile.ts` | Player progression (localStorage): `ROOMS` keys, XP, levels, streaks, achievements |
| `collection.ts` | Cross-room card collection + completed-days calendar (derived from profile) |
| `leaderboard.ts` | Global leaderboard (Supabase table or local fallback) |
| `seance.ts` (+`seanceFlavor.ts`, `grimoire.ts`) | Séance engine: puzzle gen, deduction/propagation, 4-tier `nextHint` (wrong-mark → single-clue → grid → deep search), undo/redo `History`, `refreshClueText` |
| `mystery.ts` (+`mysteryProse.ts`, `mysteryScore.ts`) | Mystery engine: 5-axis case gen (`deduceMotive`/`deduceWeapon`), bracket WHEN clues, prose banks (2nd rng stream), `verifySolvable`; scoring + share |
| `board.ts`, `boardSettings.ts`, `themes.ts` | Board arrangement (client-safe, no seed-bank import), settings, daily column themes |
| `clockLogic.ts`, `calendars.ts` | Clock clue-bounded deduction + rotating calendar systems |
| `wedges.ts`, `streak.ts`, `ladder.ts` (+`ladderFlavor.ts`), `overture.ts`, `civilizations.ts` | Per-room pure logic |
| `dailyMotif.ts` | Cross-room subject-of-the-day (shared accent/glyph/blurb) |
| `weakspot.ts` | Points player at the room drilling their worst category (§3.19) |
| `share.ts` | Canonical share-card seam: emoji grid + OG URL |
| `geo.ts`, `fuzzy.ts`, `sound.ts`, `haptics.ts`, `decks.ts`, `usePractice.ts` | Map geometry, fuzzy answers, Web-Audio synth, vibration, question decks, practice hook |
| `*.test.ts` | Vitest suites (15 files / 124 tests) — Séance/Mystery determinism + solvability gate CI |

## `frontend/public/`

| File | Purpose |
|---|---|
| `seed-questions.json` | Committed offline question bank (the default serving layer) |
| `logo-*.png` `icon.png` `apple-touch-icon.png` | Logo/icon renders |
| `mansion-map.jpg` | Overhead mansion layout for the Mystery room |

## `frontend/scripts/`

`generate-seance.ts`, `generate-ladder.ts` — pre-generate daily puzzle archives
(run by `puzzles_daily.yml`).

## `frontend/` config

`package.json` (Next 15.5, framer-motion, tailwind 3.4, world-atlas, topojson,
supabase-js; scripts: dev/build/analyze/start/lint/test) · `next.config.mjs`
(remote image patterns: wikimedia, dzcdn, tmdb, espn, flagcdn) ·
`tailwind.config.ts` (token-backed palette: `text-/bg-/border-{cat}` →
`rgb(var(--cat-*))`, safelist) · `tsconfig.json` · `vitest.config.ts`.

## `pipeline/`

| File | Purpose | External API / auth |
|---|---|---|
| `common.py` | Shared infra: rate-limited session, `get_json` (tenacity, 8 retries), bronze `dump_raw`/`compact_jsonl`, `get_db` (psycopg2, null-safe), `upsert_*` | — |
| `question_forge.py` | THE core: facts → typed-question recipes + deterministic daily board | — |
| `selftest.py` | Offline CI gate (`--core-only` pre-ingest, full at publish) | — |
| `export_seed.py` | Export freshest bank → `frontend/public/seed-questions.json` (safety gates) | — |
| `wikipedia_ingest.py` | On-This-Day + random + hard sweeps | Wikipedia REST/MediaWiki/Wikidata/DBpedia (no auth) |
| `music_ingest.py` | Charts + albums → music facts | Deezer (no auth) |
| `sports_ingest.py` | Trending players + NFL teams | Sleeper + ESPN (no auth) |
| `geo_ingest.py` | Countries → geography + map pins | restcountries GitHub mirror (no auth, ETag-cached) |
| `screen_ingest.py` | Movies → screen facts | TMDB (`TMDB_API_KEY`; skipped if unset) |
| `requirements.txt` | requests, psycopg2-binary, tenacity, rich, dotenv, slugify, dbt-core, dbt-duckdb | — |

## `transform/` (dbt + DuckDB)

`dbt_project.yml`, `profiles.yml` (committed, no secrets) ·
`models/staging/stg_facts.sql` (silver: read bronze JSONL, type, dedupe by
content_hash) + `schema.yml` (tests) · `models/marts/mart_question_bank.sql` (gold:
difficulty pre-scored) · `mart_category_stats.sql` (health) + `schema.yml`. Tests
gate the publish.

## `db/`

`schema.sql` — tables `facts`, `questions`, `daily_sets`, `scores`; enums `source`,
`category` (6), `qtype` (10), `mode` (6); RLS public-read. `migrations/` —
timestamp-prefixed.

## `data/`

`raw/*.jsonl` — bronze layer, committed, compacted by `content_hash`. `cache/` —
ingest caches (gitignored; e.g. Sleeper player dict).

## `docs/`

`README.md` (start here) · `v3/` active framework (§3.x segments) · `v2/` shipped
baseline + canonical `DESIGN_SYSTEM.md` · `archive/` — v1 docs,
`orchestrator-2026-07-ux/` (six-epic UX run: spec, proposals, QA reports,
backlog), `superpowers/` (music-depth plan/spec).

## `.github/workflows/`

`etl_daily.yml` — nightly DAG extract → transform/test → publish (cron 09:20 UTC).
`wiki_hard.yml` — 6-hourly hard-question sweep; both push to `main`.
`puzzles_daily.yml` — pre-generates Séance + Ladder archives → Neon.
`lighthouse.yml` — performance/quality budget gate on PRs (§3.24/§3.26).
