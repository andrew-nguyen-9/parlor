import GauntletGame from "@/components/GauntletGame";
import RoomShell from "@/components/RoomShell";
import { getQuestionsByType } from "@/lib/queries";
import { daySeed, pickRotating } from "@/lib/rng";
import { roomMetadata } from "@/lib/rooms";
import type { Question } from "@/lib/types";

// Seed-bank-only room; the gauntlet number/content rolls once per UTC day. 24h
// matches that cadence and caps ISR reads to ~1/room/day (spec §C4 ISR).
export const revalidate = 86400;

export const metadata = roomMetadata("/gauntlet");

// PARLOR GAUNTLET #1 = launch day
const EPOCH = Date.UTC(2026, 5, 12) / 86400000;

export default async function GauntletPage() {
  const [mc, yr, hl, wh] = await Promise.all([
    getQuestionsByType("multiple_choice"),
    getQuestionsByType("year_guess"),
    getQuestionsByType("higher_lower"),
    getQuestionsByType("where"),
  ]);

  // date-seeded, no-repeat rotation → the same temple for everyone today, a fresh
  // one tomorrow. Per-pool offsets keep these trials from echoing the standalone
  // rooms' picks for the day.
  const day = daySeed();
  const mcs = pickRotating(mc, 2, day + 404);
  const rounds = [
    mcs[0],
    mcs[1],
    pickRotating(yr, 1, day + 101)[0],
    pickRotating(hl, 1, day + 202)[0],
    pickRotating(wh, 1, day + 303)[0],
  ].filter(Boolean) as Question[];
  const gauntletNumber = day - EPOCH + 1;

  return (
    <RoomShell label="the gauntlet" accent="wildcard" href="/gauntlet">
      <GauntletGame rounds={rounds} gauntletNumber={gauntletNumber} />
    </RoomShell>
  );
}
