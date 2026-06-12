# Databricks Mirror — Phase 2 lab (RESEARCH_DATA_PLATFORM.md §1.3)

This folder mirrors the production medallion (bronze JSONL → dbt silver/gold) onto
**Databricks Free Edition** with Delta Lake + PySpark. It is a *learning artifact*,
not a serving path — Supabase remains production. The point is the resume line:

> *"Mirrored a production ELT pipeline into Databricks Delta tables with a medallion
> architecture, PySpark transformations, data-quality checks, and a scheduled
> Workflows job."*

The notebook reproduces, on Spark, exactly what `transform/` does on DuckDB —
same layers, same dedupe rule, same difficulty formula, same tests. Being able to
explain that equivalence (dbt/DuckDB ↔ PySpark/Delta) is the interview move.

## Runbook (≈30 minutes, $0)

1. **Account** — sign up for Databricks **Free Edition** (free, non-expiring;
   serverless compute included): databricks.com/learn/free-edition.
2. **Get bronze data** — it's committed: `git pull` and grab `data/raw/*.jsonl`
   (the nightly job keeps them fresh). Or generate locally with any ingest,
   e.g. `python pipeline/wikipedia_ingest.py`.
3. **Upload** — in the workspace: Catalog → create schema `parlor` → create a
   **Volume** `raw` → upload the `.jsonl` files into it
   (path becomes `/Volumes/workspace/parlor/raw/`).
4. **Import the notebook** — Workspace → Import → `notebooks/medallion_mirror.py`.
5. **Run all** — creates three Delta tables and prints the health report:
   - `parlor.bronze_facts` (raw, append-only, lineage column)
   - `parlor.silver_facts` (typed, deduped on `content_hash`, latest-wins)
   - `parlor.gold_question_bank` (difficulty-scored, fuel flags)
6. **Schedule** — Workflows → Create job → task = this notebook → daily trigger.
   `jobs/daily_mirror.json` is a reference job spec for the Jobs API
   (`POST /api/2.1/jobs/create`); adjust the notebook path to your workspace.
7. **Verify the gates** — the final cell raises (fails the job) if any
   data-quality check fails — the moral equivalent of `dbt test` gating publish.

## What maps to what

| This repo (production) | Databricks mirror |
|---|---|
| `data/raw/*.jsonl` bronze files | `parlor.bronze_facts` Delta table (Auto Loader-ready) |
| `transform/models/staging/stg_facts.sql` | silver cell: cast + window dedupe |
| `transform/models/marts/mart_question_bank.sql` | gold cell: `percent_rank` difficulty + fuel flags |
| `transform/models/marts/mart_category_stats.sql` | health-report cell |
| dbt schema tests | assert cells (job fails on violation) |
| GitHub Actions cron | Databricks Workflows schedule |

## Phase-3 extensions (when ready)

- Convert the bronze load to **Auto Loader** (`cloudFiles`) for incremental ingest.
- Rebuild silver as a **Delta Live Tables / Lakeflow** pipeline with `expectations`
  (the declarative cousin of dbt tests).
- Add an **SCD2 snapshot** of `facts` (mirrors the dbt snapshots item on the roadmap).
