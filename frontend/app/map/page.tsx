import { roomMetadata } from "@/lib/rooms";
import MapGame from "@/components/MapGame";
import RoomShell from "@/components/RoomShell";
import { getQuestionsByType } from "@/lib/queries";
import { daySeed, pickRotating } from "@/lib/rng";
import { civRounds, pickCivilization } from "@/lib/civilizations";
import { motifOfDay, feedByMotif } from "@/lib/dailyMotif";

export const revalidate = 86400;

export const metadata = roomMetadata("/map");

export default async function MapPage() {
  const pool = await getQuestionsByType("where");

  // The day's ancient civilization opens the expedition: a "place this
  // civilization" pin-drop plus themed rounds (near history + far pop culture),
  // then a rotating tail of pinnable `where` facts. Deterministic by date so
  // SSR/client agree and everyone plays the same board (lib/rng.ts).
  const civ = pickCivilization(daySeed());
  // Cross-room motif of the day (§3.21) biases the rotating tail toward
  // on-subject `where` facts — pull a wider rotating window than we need,
  // float on-motif items to the front (feedByMotif), then take the top 3
  // (was 2): "more theme-specific questions" without breaking the day-seeded
  // rotation everyone else sees (feedByMotif is a stable partition).
  const motif = motifOfDay();
  const window = pickRotating(pool, Math.min(pool.length, 8));
  const themed = feedByMotif(window, motif, (q) => ({
    category: q.category,
    year: q.year ?? null,
    text: `${q.prompt} ${q.correct}`,
  }));
  const rounds = [...civRounds(civ), ...themed.slice(0, 3)];

  return (
    <RoomShell label="room 05 — atlas obscura" accent="geography" href="/map">
      <MapGame rounds={rounds} pool={pool} civ={civ} />
    </RoomShell>
  );
}
