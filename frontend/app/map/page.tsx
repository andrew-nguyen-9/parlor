import { roomMetadata } from "@/lib/rooms";
import MapGame from "@/components/MapGame";
import RoomShell from "@/components/RoomShell";
import { getAtlasPuzzle } from "@/lib/queries";

export const metadata = roomMetadata("/map");

// `?date=YYYY-MM-DD` replays an archived night's sky (that row from the Neon
// archive). The default (today) is the live puzzle. searchParams makes the route
// dynamic, which is correct: with no DB, getAtlasPuzzle generates today's puzzle
// inline from the committed star catalog (see lib/queries.ts) — so this room is
// always playable offline, zero env vars (CLAUDE.md THE MAP rule).
export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const valid = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  const puzzle = await getAtlasPuzzle(valid);

  return (
    <RoomShell label="atlas" accent="geography" href="/map">
      <MapGame puzzle={puzzle} requestedDate={valid ?? null} />
    </RoomShell>
  );
}
