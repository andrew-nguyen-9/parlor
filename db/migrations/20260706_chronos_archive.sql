-- Archive engine (F6 scaffold): Chronos — clockwork/gear logic daily archive.
-- Pre-generated, date-keyed puzzles (one per day, identical for everyone).
-- Written ahead by scripts/generate-chronos.ts (pipeline write role); read by
-- the frontend (read-only role). Absent row ⇒ the loader runs generateChronos
-- inline (offline never dark). Flavor column: mechanism.

create table if not exists chronos_puzzles (
  play_date   date primary key,
  weekday     int  not null,
  mechanism   text not null,
  seed        bigint not null,
  payload     jsonb not null,   -- full ChronosPuzzle (see frontend/lib/chronosPuzzle.ts)
  created_at  timestamptz not null default now()
);

-- harmless on Neon; keeps parity with the rest of the schema (CLAUDE.md)
alter table chronos_puzzles enable row level security;
do $$ begin
  create policy chronos_puzzles_public_read on chronos_puzzles for select using (true);
exception when duplicate_object then null; end $$;
