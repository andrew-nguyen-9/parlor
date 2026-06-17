"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HOURS, pretty, type MysteryCase } from "@/lib/mystery";
import {
  shareText,
  type MysteryAttempt,
  type MysteryScoreResult,
} from "@/lib/mysteryScore";

function verdictSummary(
  mystery: MysteryCase,
  attempt: MysteryAttempt,
  result: MysteryScoreResult
): string {
  const culpritSet = new Set(mystery.culprits);
  const guessSet = new Set(attempt.whoGuess);
  const whoCorrect =
    guessSet.size === culpritSet.size &&
    [...guessSet].every((id) => culpritSet.has(id));
  const whereCorrect = attempt.whereGuess === mystery.scene;
  const whenCorrect = attempt.whenGuess === mystery.hourIndex;
  const gotRingleader = attempt.whoGuess.includes(mystery.culprits[0]);
  const gotAccomplice =
    mystery.culprits.length > 1 &&
    attempt.whoGuess.some(
      (id) => mystery.culprits.includes(id) && id !== mystery.culprits[0]
    );

  const ring = pretty(mystery.culprits[0]);
  const trueHour = HOURS[mystery.hourIndex];
  const guessedHour =
    attempt.whenGuess !== null ? HOURS[attempt.whenGuess] : "an unknown hour";
  const trueScene = mystery.scene;

  if (result.won) {
    return "Flawless. You named every culprit, the exact room, and the precise hour. The Order is satisfied.";
  }
  if (whoCorrect && whereCorrect && !whenCorrect) {
    return `You knew who and where — but the hour eluded you. The crime happened at ${trueHour}, not ${guessedHour}.`;
  }
  if (whoCorrect && !whereCorrect && whenCorrect) {
    return `You had the right suspects and the right hour, but the wrong room. It happened in ${trueScene}.`;
  }
  if (whoCorrect && !whereCorrect && !whenCorrect) {
    return "You named the right culprit, but the room and hour were both wrong.";
  }
  if (gotRingleader && !whoCorrect) {
    const missed = mystery.culprits
      .filter((id) => !guessSet.has(id))
      .map((id) => pretty(id));
    return `You found the ringleader (${ring}), but ${missed.join(", ")} walked free.`;
  }
  if (!gotRingleader && gotAccomplice) {
    return `You caught an accomplice but the ringleader (${ring}) slipped away.`;
  }
  return `${ring} was the ringleader. They were in ${trueScene} at ${trueHour}.`;
}

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

  async function share() {
    const text = shareText(mystery, attempt, result);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="candle-pool"
      >
        <p className="microlabel text-brass">
          the verdict · case #{mystery.caseNumber}
        </p>
        <h1 className={`display mt-2 text-6xl ${result.won ? "gilt" : "text-ember"}`}>
          {result.won ? "Case Closed" : "Cold Case"}
        </h1>
      </motion.div>
      <p className="mt-4 text-muted">{verdictSummary(mystery, attempt, result)}</p>

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
                <span className="microlabel text-muted">
                  {i === 0 ? "ringleader" : "accomplice"}
                </span>
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
      <p className="mt-6 text-xs text-muted">
        A new case is dealt at midnight. Come back tomorrow.
      </p>
    </div>
  );
}
