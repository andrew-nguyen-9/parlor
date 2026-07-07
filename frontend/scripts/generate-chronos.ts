// CHRONOS — daily puzzle generator / archiver (mirrors generate-seance.ts).
//
// Runs server-side (CI cron). Generates the deterministic puzzle for today + a
// buffer of future days and upserts each into the Neon `chronos_puzzles` archive
// using the WRITE role. The frontend only ever reads. Idempotent.
//
//   DATABASE_URL=...  npx tsx scripts/generate-chronos.ts [daysAhead] [backfill]

import { neon } from "@neondatabase/serverless";
import { daySeed } from "../lib/rng";
import { generateChronos } from "../lib/chronosPuzzle";

const dsn =
  process.env.DATABASE_URL ??
  process.env.NEON_DATABASE_URL ??
  process.env.CONNECTION_STRING;

async function main() {
  if (!dsn) {
    console.error("✗ no DATABASE_URL — cannot write the Chronos archive");
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
    const p = generateChronos(dayIndex, date);

    await sql`
      insert into chronos_puzzles (play_date, weekday, mechanism, seed, payload)
      values (${date}, ${p.weekday}, ${p.mechanism}, ${p.seed}, ${JSON.stringify(p)})
      on conflict (play_date) do update
        set weekday   = excluded.weekday,
            mechanism = excluded.mechanism,
            seed      = excluded.seed,
            payload   = excluded.payload`;
    written++;
    console.log(`✦ ${date}  ${p.mechanism}`);
  }
  console.log(`\nChronos archive: ${written} day(s) written.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
