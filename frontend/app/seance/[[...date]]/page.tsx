import { roomMetadata } from "@/lib/rooms";
import RoomShell from "@/components/RoomShell";
import SeanceGame from "@/components/SeanceGame";
import { getSeancePuzzle } from "@/lib/queries";

export const metadata = roomMetadata("/seance");

// `/seance/YYYY-MM-DD` archive-plays a past night (reads that row from the Neon
// archive); the bare `/seance` is tonight's live séance. The date lives in the
// route segment (not `?date=`) so `/seance` renders STATIC + daily ISR — one
// prerender a day instead of a function+CPU per pageview. Archive dates render
// on-demand and cache (dynamicParams). No DB ⇒ getSeancePuzzle generates the
// puzzle inline — the same pure output the nightly archiver would have written —
// so the room is always playable offline and static build == runtime.
export const revalidate = 86400;
export function generateStaticParams() {
  return [{ date: [] as string[] }]; // prerender tonight (`/seance`); archive dates ISR on demand
}

export default async function SeancePage({
  params,
}: {
  params: Promise<{ date?: string[] }>;
}) {
  const { date } = await params;
  const seg = date?.[0];
  const valid = seg && /^\d{4}-\d{2}-\d{2}$/.test(seg) ? seg : undefined;
  const puzzle = await getSeancePuzzle(valid);

  return (
    <RoomShell label="the séance" title="The Séance" accent="wildcard" href="/seance">
      <SeanceGame puzzle={puzzle} requestedDate={valid ?? null} />
    </RoomShell>
  );
}
