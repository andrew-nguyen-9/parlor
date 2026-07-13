import { roomMetadata } from "@/lib/rooms";
import RoomShell from "@/components/RoomShell";
import WedgesGame from "@/components/WedgesGame";
import { getQuestionsByType } from "@/lib/queries";
import { daySeed } from "@/lib/rng";

// Seed-bank-only room; the shared daily order rolls once per UTC day via
// `daySeed`. 24h matches that cadence and caps ISR reads to ~1/room/day
// (spec §C4 ISR: sub-hour windows only multiply reads for zero content change).
export const revalidate = 86400;

export const metadata = roomMetadata("/wedges");

export default async function WedgesPage() {
  const pool = await getQuestionsByType("multiple_choice");
  // Seed the shared daily order on the server so SSR and client agree and every
  // player on this date faces the same questions per category in the same order.
  const day = daySeed();

  return (
    <RoomShell label="fractures" accent="sports" href="/wedges">
      <WedgesGame pool={pool} day={day} />
    </RoomShell>
  );
}
