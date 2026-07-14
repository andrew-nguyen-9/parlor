import { roomMetadata } from "@/lib/rooms";
import RoomShell from "@/components/RoomShell";
import StreakGame from "@/components/StreakGame";
import { getIgnitePuzzle } from "@/lib/queries";

export const metadata = roomMetadata("/streak");

// `/streak/YYYY-MM-DD` replays an archived night; bare `/streak` is today's live
// inscription. The date is a route segment (not `?date=`) so `/streak` renders
// STATIC + daily ISR — one prerender a day, not a function+CPU per pageview.
// Archive dates render on demand and cache. No DB ⇒ getIgnitePuzzle generates
// today's puzzle inline (same output the nightly archiver writes), so the room is
// always playable offline and static build == runtime.
export const revalidate = 86400;
export function generateStaticParams() {
  return [{ date: [] as string[] }]; // prerender today (`/streak`); archive dates ISR on demand
}

export default async function StreakPage({
  params,
}: {
  params: Promise<{ date?: string[] }>;
}) {
  const { date } = await params;
  const seg = date?.[0];
  const valid = seg && /^\d{4}-\d{2}-\d{2}$/.test(seg) ? seg : undefined;
  const puzzle = await getIgnitePuzzle(valid);

  return (
    <RoomShell label="ignite" accent="screen" href="/streak">
      <StreakGame puzzle={puzzle} requestedDate={valid ?? null} />
    </RoomShell>
  );
}
