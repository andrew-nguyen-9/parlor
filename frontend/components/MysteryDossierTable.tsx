"use client";

import { HOURS, pretty, type MysteryCase } from "@/lib/mystery";
import MysteryStatusPill, { type SuspectTag } from "./MysteryStatusPill";

export default function MysteryDossierTable({
  mystery,
  cluesRevealed,
  tags,
  onCycleTag,
}: {
  mystery: MysteryCase;
  cluesRevealed: number;
  tags: Record<string, SuspectTag>;
  onCycleTag: (id: string) => void;
}) {
  const motiveRevealed = cluesRevealed >= mystery.clues.length;
  const clearedCount = mystery.suspects.filter((s) => tags[s.id] === "cleared").length;
  const taggedCount = mystery.suspects.filter((s) => tags[s.id]).length;
  const confidence = Math.round((taggedCount / mystery.suspects.length) * 100);

  return (
    <div className="gilt-frame overflow-hidden rounded-2xl bg-surface/60">
      <div className="grid grid-cols-7 gap-2 border-b border-line bg-bg/60 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-gold">
        <div className="col-span-2">suspect</div>
        <div>motive</div>
        <div>scene</div>
        <div>hour</div>
        <div>tie</div>
        <div>status</div>
      </div>
      <div className="divide-y divide-line">
        {mystery.suspects.map((s) => {
          const d = mystery.dossiers[s.id];
          const tie = d.relationships[0];
          return (
            <div key={s.id} className="grid grid-cols-7 items-center gap-2 px-4 py-3 text-sm">
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span>
                <span className="display text-sm leading-tight">{pretty(s.id)}</span>
              </div>
              <div className="italic text-muted">{motiveRevealed ? mystery.motive : "???"}</div>
              <div className="italic text-ink/80">{d.claimed[mystery.hourIndex]}</div>
              <div className="text-ink/80">{HOURS[mystery.hourIndex]}</div>
              <div className="microlabel text-muted">{tie ? tie.kind : "—"}</div>
              <div>
                <MysteryStatusPill tag={tags[s.id]} onCycle={() => onCycleTag(s.id)} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-6 border-t border-line bg-bg/60 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-gold">
        <span>cleared: {clearedCount}</span>
        <span>
          clues found: {cluesRevealed}/{mystery.clues.length}
        </span>
        <span>confidence: {confidence}%</span>
      </div>
    </div>
  );
}
