import { roomMetadata } from "@/lib/rooms";
import ClockGame from "@/components/ClockGame";
import RoomShell from "@/components/RoomShell";
import { getChronosPuzzle } from "@/lib/queries";

export const metadata = roomMetadata("/clock");

// `/clock/YYYY-MM-DD` archive-plays a past mechanism; bare `/clock` is today's
// box. The date is a route segment (not `?date=`) so `/clock` renders STATIC +
// daily ISR — one prerender a day, not a function+CPU per pageview. Archive dates
// render on demand and cache. No DB ⇒ getChronosPuzzle generates the box inline
// (same output the nightly archiver writes), so CHRONOS is always playable
// offline with zero env vars and static build == runtime.
export const revalidate = 86400;
export function generateStaticParams() {
  return [{ date: [] as string[] }]; // prerender today (`/clock`); archive dates ISR on demand
}

export default async function ClockPage({
  params,
}: {
  params: Promise<{ date?: string[] }>;
}) {
  const { date } = await params;
  const seg = date?.[0];
  const valid = seg && /^\d{4}-\d{2}-\d{2}$/.test(seg) ? seg : undefined;
  const puzzle = await getChronosPuzzle(valid);
  const skin = puzzle ? puzzle.calendarSkin.name.toLowerCase() : "wound down";

  return (
    <RoomShell label={`chronos · ${skin}`} title="Chronos" accent="music" href="/clock">
      <ClockGame puzzle={puzzle} requestedDate={valid ?? null} />
    </RoomShell>
  );
}
