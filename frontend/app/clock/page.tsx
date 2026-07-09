import { roomMetadata } from "@/lib/rooms";
import ClockGame from "@/components/ClockGame";
import RoomShell from "@/components/RoomShell";
import { getChronosPuzzle } from "@/lib/queries";

export const metadata = roomMetadata("/clock");

// `?date=YYYY-MM-DD` archive-plays a past mechanism (reads that row). Default =
// today's box. No DB ⇒ getChronosPuzzle generates the box inline (lib/queries),
// so CHRONOS is always playable offline with zero env vars.
export default async function ClockPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const valid = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  const puzzle = await getChronosPuzzle(valid);
  const skin = puzzle ? puzzle.calendarSkin.name.toLowerCase() : "wound down";

  return (
    <RoomShell label={`chronos · ${skin}`} title="Chronos" accent="music" href="/clock">
      <ClockGame puzzle={puzzle} requestedDate={valid ?? null} />
    </RoomShell>
  );
}
