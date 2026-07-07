-- Archive engine (F6 scaffold): Atlas — constellation/asterism daily archive.
-- Pre-generated, date-keyed puzzles (one per day, identical for everyone).
-- Written ahead by scripts/generate-atlas.ts (pipeline write role); read by
-- the frontend (read-only role). Absent row ⇒ the loader runs generateAtlas
-- inline (offline never dark). Flavor column: sky_region.

create table if not exists atlas_puzzles (
  play_date   date primary key,
  weekday     int  not null,
  sky_region  text not null,
  seed        bigint not null,
  payload     jsonb not null,   -- full AtlasPuzzle (see frontend/lib/atlasPuzzle.ts)
  created_at  timestamptz not null default now()
);

-- harmless on Neon; keeps parity with the rest of the schema (CLAUDE.md)
alter table atlas_puzzles enable row level security;
do $$ begin
  create policy atlas_puzzles_public_read on atlas_puzzles for select using (true);
exception when duplicate_object then null; end $$;
