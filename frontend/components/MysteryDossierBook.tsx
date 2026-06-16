"use client";

import { Fragment } from "react";
import { HOURS, ROOMS, deductionMatrix, pretty, type Mark, type MysteryCase } from "@/lib/mystery";

const MARK_GLYPH: Record<Mark, string> = {
  confirmed: "✓",
  "ruled-out": "✗",
  unknown: "?",
};

export default function MysteryDossierBook({
  mystery,
  cluesRevealed,
}: {
  mystery: MysteryCase;
  cluesRevealed: number;
}) {
  const matrix = deductionMatrix(mystery, cluesRevealed);

  return (
    <div className="gilt-frame grid overflow-hidden rounded-3xl bg-surface/60 md:grid-cols-2">
      <div className="border-b border-line p-6 md:border-b-0 md:border-r">
        <p className="microlabel mb-4 text-gold">suspects &amp; relationships</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {mystery.suspects.map((s) => {
            const tie = mystery.dossiers[s.id].relationships[0];
            return (
              <div key={s.id} className="rounded-xl border border-line p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.emoji}</span>
                  <div className="min-w-0">
                    <p className="display truncate text-xs leading-tight">{pretty(s.id)}</p>
                    <p className="text-[10px] italic text-muted">{s.trait}</p>
                  </div>
                </div>
                {tie && (
                  <p className="microlabel mt-2 rounded-full border border-line px-2 py-0.5 text-center text-muted">
                    {tie.kind}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs italic text-muted">
          Cross-reference relationships before submitting the verdict.
        </p>
      </div>
      <div className="p-6">
        <p className="microlabel mb-4 text-gold">clues &amp; deductions</p>
        <div className="space-y-2">
          {mystery.clues.slice(0, cluesRevealed).map((clue) => (
            <div key={clue.stage} className="rounded-xl border border-line p-3 text-xs italic text-ink/85">
              {clue.text}
            </div>
          ))}
        </div>
        <p className="microlabel mb-3 mt-5 text-gold">deduction matrix</p>
        <div
          className="grid gap-1 text-center text-[10px] uppercase tracking-[0.15em] text-muted"
          style={{ gridTemplateColumns: `auto repeat(${HOURS.length}, minmax(0,1fr))` }}
        >
          <div />
          {HOURS.map((h) => (
            <div key={h}>{h.replace(":00", "")}</div>
          ))}
          {ROOMS.map((room, r) => (
            <Fragment key={room}>
              <div className="text-left normal-case italic text-ink/70">{room.replace("the ", "")}</div>
              {HOURS.map((_, h) => (
                <div
                  key={`${room}-${h}`}
                  className="flex h-8 items-center justify-center rounded-md border border-line"
                >
                  {MARK_GLYPH[matrix[r][h]]}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
