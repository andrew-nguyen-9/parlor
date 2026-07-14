import { roomMetadata } from "@/lib/rooms";
import MapGame from "@/components/MapGame";
import RoomShell from "@/components/RoomShell";
import { getAtlasPuzzle } from "@/lib/queries";

export const metadata = roomMetadata("/map");

// `/map/YYYY-MM-DD` replays an archived night's sky; bare `/map` is the live
// puzzle. The date is a route segment (not `?date=`) so `/map` renders STATIC +
// daily ISR — one prerender a day, not a function+CPU per pageview. Archive dates
// render on demand and cache. No DB ⇒ getAtlasPuzzle generates today's puzzle
// inline from the committed star catalog (CLAUDE.md THE MAP rule) — the same
// output the nightly archiver writes — so the room is always playable offline,
// zero env vars, and static build == runtime.
export const revalidate = 86400;
export function generateStaticParams() {
  return [{ date: [] as string[] }]; // prerender today (`/map`); archive dates ISR on demand
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ date?: string[] }>;
}) {
  const { date } = await params;
  const seg = date?.[0];
  const valid = seg && /^\d{4}-\d{2}-\d{2}$/.test(seg) ? seg : undefined;
  const puzzle = await getAtlasPuzzle(valid);

  return (
    <RoomShell label="atlas" accent="geography" href="/map">
      <MapGame puzzle={puzzle} requestedDate={valid ?? null} />
    </RoomShell>
  );
}
