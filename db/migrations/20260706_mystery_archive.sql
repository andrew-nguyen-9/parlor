-- Archive engine (F6 scaffold): Mystery — deduction-grid daily archive.
-- Pre-generated, date-keyed puzzles (one per day, identical for everyone).
-- Written ahead by scripts/generate-mystery.ts (pipeline write role); read by
-- the frontend (read-only role). Absent row ⇒ the loader runs generateMystery
-- inline (offline never dark). Flavor column: case_name.

create table if not exists mystery_puzzles (
  play_date   date primary key,
  weekday     int  not null,
  case_name   text not null,
  seed        bigint not null,
  payload     jsonb not null,   -- full MysteryPuzzle (see frontend/lib/mysteryPuzzle.ts)
  created_at  timestamptz not null default now()
);

-- harmless on Neon; keeps parity with the rest of the schema (CLAUDE.md)
alter table mystery_puzzles enable row level security;
do $$ begin
  create policy mystery_puzzles_public_read on mystery_puzzles for select using (true);
exception when duplicate_object then null; end $$;
