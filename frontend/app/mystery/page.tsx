import { roomMetadata } from "@/lib/rooms";
import RoomShell from "@/components/RoomShell";
import MysteryGame from "@/components/MysteryGame";
import { getMysteryPuzzle } from "@/lib/queries";

// One deduction case per night — archived to Neon, or generated inline offline
// (zero env vars, seed-bank-style). Revalidate daily so "today's case" rolls over.
export const revalidate = 86400;

export const metadata = roomMetadata("/mystery");

export default async function MysteryPage() {
  const puzzle = await getMysteryPuzzle();

  return (
    <RoomShell label="sanctum mysterii" accent="history" href="/mystery">
      {puzzle ? (
        <MysteryGame puzzle={puzzle} />
      ) : (
        <p className="mx-auto max-w-md py-16 text-center text-muted">
          The archive is dark just now — tonight&apos;s case could not be reached. Try again shortly.
        </p>
      )}
    </RoomShell>
  );
}
