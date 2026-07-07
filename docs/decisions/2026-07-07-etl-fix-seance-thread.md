# 2026-07-07 — ETL fix + Séance polish + Thread text-answer filter

Medium-tier cycle. Three independent units off `feat/wishlist-etl-seance-thread`.

## 1. ETL pipeline (two failures)

### 1a. `facts_source_check` was out of sync with dbt
CI crashed on `wiki_pkg_ingest.py` with
`psycopg2.errors.CheckViolation ... "facts_source_check"` — source
`wikipedia_pkg` was rejected by the Postgres constraint. The dbt staging test
`accepted_values_stg_facts_source` (`transform/models/staging/schema.yml`)
already accepted `wikipedia_pkg` + `wikidata`, `dbpedia`, `jservice`, `quizapi`,
but the DB `CHECK` predated those ingests. Offline/seed mode never hits the
constraint, so it went unnoticed until a live-DB run.

**Fix:** aligned `db/schema.sql` `facts_source_check` to the full dbt list +
idempotent migration `db/migrations/20260707_wiki_pkg_source.sql`.
**Gotcha for next time:** the DB source constraint and the dbt
`accepted_values` test are two source-of-truth lists that must be kept in
sync. Add a source to one → add it to both.

### 1b. Publish push conflicted on regenerated `seed-questions.json`
`git pull --rebase` in the publish step hit
`CONFLICT (content): Merge conflict in frontend/public/seed-questions.json`.
The seed bank is a **fully regenerated artifact** — a line-level rebase can
never merge two regenerations.

**Fix (both `etl_daily.yml` + `wiki_hard.yml`):**
- `.gitattributes`: `data/raw/*.jsonl merge=union` — bronze is append-only /
  content-hash-compacted, so union merge never conflicts (dupes collapse on
  next export).
- Publish is now **one commit, one push, retried ≤3×**: rebase bronze →
  regenerate seed *from the merged bronze* → gate on `selftest.py` → amend into
  the one commit → push. The generated JSON never sits in a rebase.
- The `bank-writer` concurrency group only serializes bank-writers; a
  human/dependabot push can still land mid-run, which is why the push retries.

**Gotcha:** never stage `seed-questions.json` before a rebase. Regenerate it
*after*. Any new bank-writing workflow must copy this publish shape.

## 2. The Séance (`SeanceGame.tsx` / `.module.css`)
Complaints: empty space, word cutoff, not high-end, wants ghostly motion.
- `.shell` was fully transparent → gave it a real velvet table surface (channel
  tokens, brass hairline, candlelight glow) so empty space reads as a table.
- **Bug found:** the module referenced `var(--brass)` / `var(--line)` — vars
  that don't exist, so it always used a hardcoded bronze fallback (wrong in
  light mode). Real tokens are `rgb(var(--c-brass))` / `rgb(var(--c-line))`.
- Word cutoff: `.valHead` had fixed `height: 5.75rem` + vertical nowrap text →
  clipped long value labels. Changed to `min-height`.
- Empty space: trimmed panel `min-height`, vertically centered + grouped the
  rail+matrix, enlarged cells.
- Motion: kept to the **one looping animation per viewport** design floor —
  replaced the label flicker with a single ambient candlelight breathe on the
  table; everything else is finite/interaction-driven (trace-pulse on
  highlighted columns, spectral glow on bound cells, table entrance).

**Gotcha:** the Séance renders its "veil is closed" dark state when the DB is
connected but has no puzzle row for today. Zero-env offline mode
(`generateSeance`) always produces a puzzle — to QA the table locally with a
DB in `.env`, run dev with `DATABASE_URL=""`.

## 3. The Thread — text-answer filter (`question_forge.py`)
THE THREAD serves typed-answer qtypes (`clue`, `thread`); MC-phrased prompts and
sentence-long answers leaked in. Added `_clean_text_answer(q)` rejecting prompts
matching `\bwhich\b|\bnot\b|\bbelow\b|of the following` (word-boundary so
"notable"/"another" don't false-positive) or answers >2 words. Applied to the
`clue` pool in `forge_all` **before** thread chains are walked from it, so both
qtypes stay clean. Gated by two new `selftest.py` checks; seed bank re-exported.
