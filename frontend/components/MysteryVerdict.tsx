"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HOURS, pretty, type MysteryCase } from "@/lib/mystery";
import { shareText, type MysteryAttempt, type MysteryScoreResult } from "@/lib/mysteryScore";

export default function MysteryVerdict({
  mystery,
  attempt,
  result,
}: {
  mystery: MysteryCase;
  attempt: MysteryAttempt;
  result: MysteryScoreResult;
}) {
  const [copied, setCopied] = useState(false);
  const gotRing = attempt.whoGuess.includes(mystery.culprits[0]);

  async function share() {
    const text = shareText(mystery, attempt, result);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="candle-pool"
      >
        <p className="microlabel text-brass">the verdict · case #{mystery.caseNumber}</p>
        <h1 className={`display mt-2 text-6xl ${result.won ? "gilt" : "text-ember"}`}>
          {result.won ? "Case Closed" : "Cold Case"}
        </h1>
      </motion.div>
      <p className="mt-4 text-muted">
        {result.won
          ? "You named the culprit ring, the scene, and the hour exactly. The Order is impressed."
          : gotRing
            ? "You fingered the ringleader — but missed the room, the hour, or an accomplice."
            : "The true culprit slipped into the night."}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-line bg-surface/60 p-3">
          <p className="microlabel text-muted">score</p>
          <p className="display tabular mt-1 text-2xl">{result.total}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface/60 p-3">
          <p className="microlabel text-muted">clues used</p>
          <p className="display tabular mt-1 text-2xl">
            {attempt.cluesRevealed}/{mystery.clues.length}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface/60 p-3">
          <p className="microlabel text-muted">time</p>
          <p className="display tabular mt-1 text-2xl">
            {Math.floor(attempt.elapsedSeconds / 60)}:
            {(attempt.elapsedSeconds % 60).toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="gilt-frame mt-8 rounded-2xl bg-surface/70 p-6 text-left">
        <p className="microlabel text-gold">the truth</p>
        <div className="mt-3 space-y-2">
          {mystery.culprits.map((id, i) => {
            const c = mystery.suspects.find((s) => s.id === id)!;
            return (
              <div key={id} className="flex items-center gap-3">
                <span className="text-2xl">{c.emoji}</span>
                <span className="display text-lg">{pretty(id)}</span>
                <span className="microlabel text-muted">{i === 0 ? "ringleader" : "accomplice"}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
          <div>
            <p className="microlabel text-muted">motive</p>
            <p className="text-ink">{mystery.motive}</p>
          </div>
          <div>
            <p className="microlabel text-muted">scene</p>
            <p className="text-ink">{mystery.scene}</p>
          </div>
          <div>
            <p className="microlabel text-muted">hour</p>
            <p className="text-ink">{HOURS[mystery.hourIndex]}</p>
          </div>
        </div>
      </div>

      <button
        onClick={share}
        className="microlabel mt-6 w-full rounded-full border border-gold py-3 text-gold transition hover:bg-gold hover:text-bg"
      >
        {copied ? "copied to clipboard ✓" : "share result"}
      </button>
      <p className="mt-6 text-xs text-muted">A new case is dealt at midnight. Come back tomorrow.</p>
    </div>
  );
}
