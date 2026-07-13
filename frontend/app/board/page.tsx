import { roomMetadata } from "@/lib/rooms";
import BoardGame from "@/components/BoardGame";
import RoomShell from "@/components/RoomShell";
import { getQuestionsByType } from "@/lib/queries";
import { biasCluesByTheme, buildBoardColumns, themedPick } from "@/lib/board";
import { daySeed, mulberry32 } from "@/lib/rng";
import { pickTheme } from "@/lib/themes";

// Seed-bank-only room; content rolls once per UTC day via `daySeed`. A 24h
// window matches that cadence and caps ISR reads to ~1/room/day (spec §C4 ISR:
// sub-hour windows only multiply reads for zero content change).
export const revalidate = 86400;

export const metadata = roomMetadata("/board");

export default async function BoardPage() {
  const clues = await getQuestionsByType("clue");
  const day = daySeed();
  const theme = pickTheme(day); // deterministic daily reskin (SSR/client agree)
  const rand = mulberry32(day);
  // Float on-theme clues to the front so the day's theme visibly steers which
  // clues the board picks per tier (biasCluesByTheme is a no-op off-anniversary).
  const themed = biasCluesByTheme(clues, theme.match);
  const pick = themedPick(theme.match, (arr) => arr[Math.floor(rand() * arr.length)]);
  const columns = buildBoardColumns(themed, pick);
  const dailyDouble: [number, number] = [
    Math.floor(rand() * columns.length),
    Math.floor(rand() * 5),
  ];

  return (
    <RoomShell label={`codex · ${theme.name.toLowerCase()}`} accent="history" href="/board">
      <BoardGame columns={columns} dailyDouble={dailyDouble} clues={clues} theme={theme} />
    </RoomShell>
  );
}
