-- Allow the wider set of fact sources already accepted by dbt on the live DB.
-- wiki_pkg_ingest.py emits source='wikipedia_pkg' (distinct from the primary
-- REST-API 'wikipedia' source), and the dbt staging test
-- accepted_values_stg_facts_source (transform/models/staging/schema.yml)
-- already accepts wikipedia_pkg, wikidata, dbpedia, jservice, quizapi — but
-- the older facts_source_check predated these ingests, so any DB write of one
-- of these sources failed with facts_source_check (offline/seed mode never
-- hits the constraint, which is why it went unnoticed until CI ran wikipedia_pkg
-- through a live DB write).
-- Idempotent: safe to re-run.
alter table facts drop constraint if exists facts_source_check;
alter table facts add constraint facts_source_check
  check (source in ('wikipedia','wikipedia_pkg','wikidata','dbpedia','deezer','sleeper','espn','tmdb','restcountries','opentdb','jservice','quizapi','curated','manual'));
