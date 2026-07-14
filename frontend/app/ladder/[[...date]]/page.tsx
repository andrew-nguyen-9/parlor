import { roomMetadata } from "@/lib/rooms";
import RoomShell from "@/components/RoomShell";
import LadderGame from "@/components/LadderGame";
import { getLadderPuzzle } from "@/lib/queries";

export const metadata = roomMetadata("/ladder");

// `/ladder/YYYY-MM-DD` plays an archived past ascent; bare `/ladder` is today's
// live climb. The date is a route segment (not `?date=`) so `/ladder` renders
// STATIC + daily ISR — one prerender a day, not a function+CPU per pageview.
// Archive dates render on demand and cache. No DB ⇒ getLadderPuzzle generates
// today's climb inline (same output the nightly archiver writes), so the room is
// always playable offline and static build == runtime.
export const revalidate = 86400;
export function generateStaticParams() {
  return [{ date: [] as string[] }]; // prerender today (`/ladder`); archive dates ISR on demand
}

export default async function LadderPage({
  params,
}: {
  params: Promise<{ date?: string[] }>;
}) {
  const { date } = await params;
  const seg = date?.[0];
  const valid = seg && /^\d{4}-\d{2}-\d{2}$/.test(seg) ? seg : undefined;
  const puzzle = await getLadderPuzzle(valid);

  return (
    <RoomShell label="climb of the initiate" title="Climb of the Initiate" accent="history" href="/ladder">
      <LadderGame puzzle={puzzle} requestedDate={valid ?? null} />
    </RoomShell>
  );
}
