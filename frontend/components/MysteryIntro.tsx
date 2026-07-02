"use client";

import { useEffect, useState } from "react";
import { pretty, type MysteryCase } from "@/lib/mystery";

function msUntilMidnightUTC(): number {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return next.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function MysteryIntro({
  mystery,
  onBegin,
}: {
  mystery: MysteryCase;
  onBegin: () => void;
}) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(msUntilMidnightUTC()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="microlabel text-brass">Case #{mystery.caseNumber}</p>
      <h1 className="display gilt mt-2 text-5xl sm:text-6xl">{mystery.title}</h1>
      <div className="deco-rule my-6">✦</div>
      <div className="gilt-frame candle-pool rounded-2xl bg-surface/70 p-6 sm:p-8">
        <p className="relative z-10 text-lg leading-relaxed text-ink/90">{mystery.opening}</p>
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 sm:grid-cols-5">
          {["who", "where", "when", "motive", "weapon"].map((axis) => (
            <div key={axis} className="rounded-xl border border-line bg-bg/40 p-3 text-center">
              <p className="microlabel text-gold">{axis}</p>
              <p className="display mt-1 text-xl">???</p>
            </div>
          ))}
        </div>
        <div className="relative z-10 mt-6 flex items-center gap-3 border-t border-line pt-5">
          <span className="text-3xl">{mystery.victim.emoji}</span>
          <div>
            <p className="microlabel text-ember">the victim</p>
            <p className="display text-xl">{pretty(mystery.victim.id)}</p>
            <p className="text-sm text-muted">{mystery.victim.title}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {mystery.suspects.map((s) => (
          <div key={s.id} className="flex min-w-[64px] flex-col items-center gap-1">
            <div className="flex size-12 items-center justify-center rounded-full border-2 border-gold bg-surface text-2xl">
              {s.emoji}
            </div>
            <p className="text-center text-[10px] text-ink/70">{pretty(s.id).split(" ")[0]}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onBegin}
        className="microlabel mt-8 w-full rounded-full border border-gold py-4 text-gold transition hover:bg-gold hover:text-bg"
      >
        begin the investigation
      </button>
      <p className="microlabel mt-4 text-center text-muted">
        a new case is dealt at midnight · {countdown} remaining
      </p>
    </div>
  );
}
