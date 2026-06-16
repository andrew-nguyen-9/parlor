"use client";

import { HOURS, type MysteryCase } from "@/lib/mystery";

export default function MysteryTimelinePanel({
  mystery,
  cluesRevealed,
}: {
  mystery: MysteryCase;
  cluesRevealed: number;
}) {
  const revealedClues = mystery.clues.slice(0, cluesRevealed);
  const knownHours = new Set(revealedClues.flatMap((c) => c.eliminatesHours));
  const hourConfirmed = revealedClues.some((c) => c.eliminatesHours.length > 0) && knownHours.size === HOURS.length - 1;

  return (
    <div className="gilt-frame rounded-2xl bg-surface/60 p-5">
      <p className="microlabel mb-4 text-gold">timeline</p>
      <div className="ml-3 flex flex-col gap-4 border-l border-line pl-6">
        {HOURS.map((hour, i) => (
          <div key={hour} className="relative">
            <div className="absolute -left-[31px] top-1 flex size-6 items-center justify-center rounded-full border border-gold/60 text-[10px] text-gold">
              {i + 1}
            </div>
            <p className="display text-sm">{hour}</p>
            <p className="text-sm italic text-muted">
              {knownHours.has(i)
                ? "cleared — nothing happened here"
                : hourConfirmed && i === mystery.hourIndex
                  ? "the murder hour"
                  : "???"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
