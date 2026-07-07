-- Archive engine (F6 scaffold): Ignite — rune substitution/cipher daily archive.
-- Pre-generated, date-keyed puzzles (one per day, identical for everyone).
-- Written ahead by scripts/generate-ignite.ts (pipeline write role); read by
-- the frontend (read-only role). Absent row ⇒ the loader runs generateIgnite
-- inline (offline never dark). Flavor column: rune_set.

create table if not exists ignite_puzzles (
  play_date   date primary key,
  weekday     int  not null,
  rune_set    text not null,
  seed        bigint not null,
  payload     jsonb not null,   -- full IgnitePuzzle (see frontend/lib/ignitePuzzle.ts)
  created_at  timestamptz not null default now()
);

-- harmless on Neon; keeps parity with the rest of the schema (CLAUDE.md)
alter table ignite_puzzles enable row level security;
do $$ begin
  create policy ignite_puzzles_public_read on ignite_puzzles for select using (true);
exception when duplicate_object then null; end $$;
