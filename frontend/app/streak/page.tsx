import { roomMetadata } from "@/lib/rooms";
import RoomShell from "@/components/RoomShell";
import StreakGame from "@/components/StreakGame";
import { getIgnitePuzzle } from "@/lib/queries";

export const metadata = roomMetadata("/streak");

// `?date=YYYY-MM-DD` replays an archived night (reads that row from the Neon
// archive); the default (today) is the live inscription. searchParams makes the
// route dynamic, which is correct: no DB ⇒ getIgnitePuzzle generates today's
// puzzle inline (see lib/queries.ts), so this room is always playable offline.
export default async function StreakPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const valid = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  const puzzle = await getIgnitePuzzle(valid);

  return (
    <RoomShell label="ignite" accent="screen" href="/streak">
      <StreakGame puzzle={puzzle} requestedDate={valid ?? null} />
    </RoomShell>
  );
}
