-- §6.x answer tags — additive, file-only (apply manually; nightly does NOT run this).
-- Adds the tag reference column the forge now writes on every question (domain/
-- type/era), plus a reserved column on facts for a future fact-level tagger.
-- text[] (not jsonb): tags are a flat list — array ops + GIN index beat jsonb here.

alter table questions add column if not exists tags text[];
alter table facts     add column if not exists tags text[];

-- tag-aware distractor / filter lookups (e.g. "questions sharing type:country").
create index if not exists questions_tags_idx on questions using gin (tags);

-- RLS already on + public-read for both tables (see db/schema.sql); a new column
-- inherits the table policy, so no extra policy is needed.
