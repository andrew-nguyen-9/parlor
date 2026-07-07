// ATLAS — daily puzzle generator / archiver (mirrors generate-seance.ts).
//
// Runs server-side (CI cron). Generates the deterministic puzzle for today + a
// buffer of future days and upserts each into the Neon `atlas_puzzles` archive
// using the WRITE role. The frontend only ever reads. Idempotent.
//
//   DATABASE_URL=...  npx tsx scripts/generate-atlas.ts [daysAhead] [backfill]

import { neon } from "@neondatabase/serverless";
import { daySeed } from "../lib/rng";
import { generateAtlas } from "../lib/atlasPuzzle";

const dsn =
  process.env.DATABASE_URL ??
  process.env.NEON_DATABASE_URL ??
  process.env.CONNECTION_STRING;

async function main() {
  if (!dsn) {
    console.error("✗ no DATABASE_URL — cannot write the Atlas archive");
    process.exit(1);
  }
  const sql = neon(dsn);
  const daysAhead = Number(process.argv[2] ?? 14);
  const backfill = Number(process.argv[3] ?? 0);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let written = 0;
  for (let off = -backfill; off <= daysAhead; off++) {
    const d = new Date(today.getTime() + off * 86400000);
    const date = d.toISOString().slice(0, 10);
    const dayIndex = daySeed(d);
    const p = generateAtlas(dayIndex, date);

    await sql`
      insert into atlas_puzzles (play_date, weekday, sky_region, seed, payload)
      values (${date}, ${p.weekday}, ${p.skyRegion}, ${p.seed}, ${JSON.stringify(p)})
      on conflict (play_date) do update
        set weekday    = excluded.weekday,
            sky_region = excluded.sky_region,
            seed       = excluded.seed,
            payload    = excluded.payload`;
    written++;
    console.log(`✦ ${date}  ${p.skyRegion}`);
  }
  console.log(`\nAtlas archive: ${written} day(s) written.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
