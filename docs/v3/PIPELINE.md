# PARLOR v3 — Pipeline & Content

The nightly forge, the dbt transform, content quality, and new sources. These
segments touch `pipeline/**`, `transform/**`, and `data/raw/*.jsonl` only —
**no frontend files** — so they never conflict with the game swarm.

Conventions carried from v2 (`../../CLAUDE.md`): scrape **facts**, not questions;
only `question_forge.py` makes questions; every ingest appends to `data/raw/*.jsonl`
(bronze, committed); idempotent upserts on `content_hash`; `selftest.py` is the
offline gate — run it before committing.

---

## §3.11 — Transform Fix  *(the blocker — Séance + Ladder are dark)*

**Symptom:** the nightly fails at the **dbt transform step**. `transform/` is the
DuckDB+dbt project: bronze JSONL → `stg_facts` → marts (`mart_question_bank`,
`mart_category_stats`), with schema tests gating publish. A failure here gates the
whole publish. Séance and Ladder are **server-generated and Neon-archived with no
seed fallback** (by design), so when publish is gated they get no data and the
rooms go dark.

**Approach — `superpowers:systematic-debugging` FIRST, do not guess:**
1. Reproduce: from inside `transform/`, run `dbt build --profiles-dir .`. Capture
   the exact failing model or schema test.
2. Map the DAG (`cavecrew-investigator`): `stg_facts.sql` reads bronze; check the
   bronze→staging column contract — a renamed/missing field in `data/raw/*.jsonl`
   or a new fact shape from an ingest is the usual culprit.
3. Root-cause, fix the model **or** the upstream ingest contract (whichever is
   wrong), and add a guard (a dbt test or a `selftest.py` assertion) so the same
   break fails loudly next time.
4. Confirm Séance + Ladder receive data end-to-end.

**Files:** `transform/**`; `pipeline/*.py` only where the bronze contract must
change. **END STATE:** `dbt build` green locally; `selftest` green; root cause +
fix written back into this section; Séance + Ladder get data.

> Fill in the documented root cause here once 3.11 lands. ⟵ (placeholder for the
> implementing session)

---

## §3.12 — Distractor Overhaul  *(MC answers too obvious)*

**Problem:** multiple-choice distractors are too obviously wrong, so the right
answer is guessable without knowing it. Today the forge samples sibling answers
from the same field/category (`question_forge.py` `_clue_distractors` ~L276–306;
the `meta.answer_field` path ~L182–210). Sibling-sampling alone produces clusters
where one option is obviously the odd one out.

**Fix — make distractors *close*:**
- **Same category** (already) **and** same sub-type/entity class.
- **Dates:** distractors within the same decade/era as the answer.
- **Numbers/magnitudes:** same order of magnitude (e.g. all 6-figure populations).
- **Entities:** same role/kind (a rapper's distractors are rappers, not actors).
- Reject sets where one option is trivially separable from the rest.

**Gate:** add a `selftest.py` assertion that flags trivially-distinguishable
distractor sets (a closeness heuristic). **ponytail:** heuristic first; only reach
for an LLM-judge if the heuristic measurably underperforms.

**Files:** `question_forge.py` (distractor fns), `selftest.py`, optional
`pipeline/distractor_quality.py`. **END STATE:** distractors measurably closer
(documented heuristic); selftest gate added + green; seed bank regenerated
(`export_seed.py --from-bronze`).

---

## §3.13 — Deezer + Music Depth  *(album art leaks the answer)*

**Problem:** Deezer `image_guess` music clues show the album cover, which often
contains the artist/album name — the answer is in the image, making them trivial.

**Fix the leak:**
- Stop using answer-revealing covers. Prefer **audio-only** clues (the 30s preview
  already ingested) or **art-stripped** clues. If art is kept, crop/obscure the
  title region or pick covers without text (hard to guarantee — prefer audio).

**Grow music trivia — `superpowers:brainstorming` to pick what's worth building.**
Candidate keyless music qtypes (Deezer + MusicBrainz):
- year-of-release · record label · featured artist · lyric snippet → song ·
  "sampled by / samples" · genre/BPM · chart peak · album → lead single.

Build **≥2** new music qtypes with `selftest` coverage and forge recipes; keep
provenance (`source_url`) on every fact.

**Files:** `music_ingest.py`, the music recipes in `question_forge.py`,
`selftest.py`. **END STATE:** no music clue shows the answer in its image; ≥2 new
music qtypes forged + tested; seed bank regenerated.

---

# New sources & quality (Wave D)

## §3.15 — Wikidata source
Keyless SPARQL — the underused giant. Structured facts (music/film/sports/science/
art) with stable IDs, no key; backfills screen and broadens every category.
**Files:** `pipeline/wikidata_ingest.py` (new), `data/raw/wikidata.jsonl`,
`selftest.py`. Append-only — never edit other ingests. `context7` for SPARQL.

## §3.16 — Screen starvation fix  *(debt #1)*
`screen_ingest.py` is gated on `TMDB_API_KEY`; with no key the screen category
starves at ~2 questions. Replace TMDB with a **keyless** film/TV source (Wikidata
SPARQL or OMDb-free). **Files:** `pipeline/screen_ingest.py`. **END STATE:** screen
populated without a key.

## §3.17 — Per-source health floor  *(debt #3)*
The nightly enforces only a *total* question floor, which one healthy source clears
alone — a dead source decays silently. Add a per-(source/category) floor so the
next starvation pages someone. **Files:** `pipeline/common.py` (helper), the gate
in `export_seed.py`/`selftest.py`. **END STATE:** a starved source fails the gate
in a test.

## §3.18 — Quality scoring
The forge emits typed questions but doesn't rank them. Add an ambiguity/quality
score so the board picks *good* clues, not just difficulty-tiered ones. Heuristic
first (ponytail); LLM-judge only if it measurably wins; the `databricks/` lab is
the natural home for an offline model later. **Files:** `question_forge.py`
(ranking step) or `pipeline/quality_score.py` (new), `selftest.py`.
