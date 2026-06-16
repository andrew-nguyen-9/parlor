"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfxCorrect, sfxWrong, sfxGlassClink, sfxPianoChord } from "@/lib/sound";
import { haptic } from "@/lib/haptics";
import { HOURS, pretty, type MysteryCase } from "@/lib/mystery";

type Stored = { guess: string[]; correct: boolean; at: number };

function loadAttempt(date: string): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`parlor:mystery:${date}`);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

export default function MysteryGame({ mystery }: { mystery: MysteryCase }) {
  const [stage, setStage] = useState<"intro" | "investigate" | "results">("intro");
  const [revealed, setRevealed] = useState(1); // clues shown (1..4)
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null); // expanded dossier
  const [result, setResult] = useState<Stored | null>(null);

  // Already played today? jump to the verdict.
  useEffect(() => {
    const prior = loadAttempt(mystery.date);
    if (prior) {
      setResult(prior);
      setSelected(prior.guess);
      setStage("results");
    }
  }, [mystery.date]);

  const culpritSet = useMemo(() => new Set(mystery.culprits), [mystery.culprits]);

  function toggle(id: string) {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 3 ? cur : [...cur, id],
    );
    sfxGlassClink();
  }

  function revealNext() {
    setRevealed((r) => Math.min(4, r + 1));
    sfxPianoChord();
  }

  function accuse() {
    if (selected.length === 0) return;
    const correct =
      selected.length === culpritSet.size && selected.every((id) => culpritSet.has(id));
    const stored: Stored = { guess: selected, correct, at: Date.now() };
    try {
      localStorage.setItem(`parlor:mystery:${mystery.date}`, JSON.stringify(stored));
    } catch {
      /* private mode — keep playing in-memory */
    }
    setResult(stored);
    setStage("results");
    if (correct) {
      sfxCorrect();
      haptic.win();
    } else {
      sfxWrong();
      haptic.wrong();
    }
  }

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="microlabel text-brass">Case #{mystery.caseNumber}</p>
        <h1 className="display gilt mt-2 text-5xl sm:text-6xl">{mystery.title}</h1>
        <div className="deco-rule my-6">✦</div>
        <div className="gilt-frame candle-pool rounded-2xl bg-surface/70 p-6 sm:p-8">
          <p className="relative z-10 text-lg leading-relaxed text-ink/90">{mystery.opening}</p>
          <div className="relative z-10 mt-6 flex items-center gap-3 border-t border-line pt-5">
            <span className="text-3xl">{mystery.victim.emoji}</span>
            <div>
              <p className="microlabel text-ember">the victim</p>
              <p className="display text-xl">{pretty(mystery.victim.id)}</p>
              <p className="text-sm text-muted">{mystery.victim.title}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setStage("investigate");
            sfxGlassClink();
          }}
          className="microlabel mt-8 w-full rounded-full border border-gold py-4 text-gold transition hover:bg-gold hover:text-bg"
        >
          begin the investigation
        </button>
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  if (stage === "results" && result) {
    const gotRing = result.guess.includes(mystery.culprits[0]);
    return (
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="candle-pool"
        >
          <p className="microlabel text-brass">the verdict · case #{mystery.caseNumber}</p>
          <h1 className={`display mt-2 text-6xl ${result.correct ? "gilt" : "text-ember"}`}>
            {result.correct ? "Case Closed" : "Cold Case"}
          </h1>
        </motion.div>
        <p className="mt-4 text-muted">
          {result.correct
            ? "You named the culprit ring exactly. The Order is impressed."
            : gotRing
              ? "You fingered the ringleader — but missed an accomplice."
              : "The true culprit slipped into the night."}
        </p>

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
            <div><p className="microlabel text-muted">motive</p><p className="text-ink">{mystery.motive}</p></div>
            <div><p className="microlabel text-muted">scene</p><p className="text-ink">{mystery.scene}</p></div>
            <div><p className="microlabel text-muted">hour</p><p className="text-ink">{HOURS[mystery.hourIndex]}</p></div>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted">A new case is dealt at midnight. Come back tomorrow.</p>
      </div>
    );
  }

  // ── INVESTIGATE ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-baseline justify-between">
        <h2 className="display gilt text-3xl">{mystery.title}</h2>
        <span className="microlabel text-brass">case #{mystery.caseNumber}</span>
      </div>

      {/* Clue track */}
      <p className="microlabel mt-6 text-gold">the clues · {revealed}/4 revealed</p>
      <div className="mt-3 space-y-3">
        <AnimatePresence>
          {mystery.clues.slice(0, revealed).map((clue) => (
            <motion.div
              key={clue.stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="gilt-frame rounded-xl bg-surface/60 p-4"
            >
              <p className="microlabel text-ember">{clue.kind}</p>
              <p className="display mt-1 text-lg">{clue.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/85">{clue.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {revealed < 4 && (
        <button
          onClick={revealNext}
          className="microlabel mt-3 rounded-full border border-line px-5 py-2 text-muted transition hover:border-gold hover:text-gold"
        >
          ✦ reveal next clue
        </button>
      )}

      {/* Suspects */}
      <p className="microlabel mt-10 text-gold">the suspects · select up to three</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {mystery.suspects.map((s) => {
          const picked = selected.includes(s.id);
          const d = mystery.dossiers[s.id];
          const isOpen = open === s.id;
          return (
            <div
              key={s.id}
              className={`rounded-xl border bg-surface/50 p-4 transition ${
                picked ? "border-gold shadow-[0_0_20px_rgba(201,162,74,0.25)]" : "border-line"
              }`}
            >
              <div className="flex items-center gap-3">
                <button onClick={() => toggle(s.id)} className="text-3xl" aria-label={`accuse ${pretty(s.id)}`}>
                  {s.emoji}
                </button>
                <button onClick={() => toggle(s.id)} className="flex-1 text-left">
                  <p className="display text-base leading-tight">{pretty(s.id)}</p>
                  <p className="text-xs text-muted">{s.title}</p>
                </button>
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="microlabel text-muted transition hover:text-gold"
                >
                  {isOpen ? "hide" : "dossier"}
                </button>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-xs italic text-ink/70">{s.trait}</p>
                    <p className="microlabel mt-3 text-brass">claimed whereabouts</p>
                    <ul className="mt-1 space-y-0.5 text-xs text-muted">
                      {d.claimed.map((loc, i) => (
                        <li key={i}>
                          <span className="text-ink/60">{HOURS[i]}</span> — {loc}
                        </li>
                      ))}
                    </ul>
                    {d.relationships.length > 0 && (
                      <>
                        <p className="microlabel mt-3 text-brass">known ties</p>
                        <ul className="mt-1 space-y-0.5 text-xs text-muted">
                          {d.relationships.map((r, i) => (
                            <li key={i}>
                              {r.kind} of <span className="text-ink/80">{pretty(r.to)}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <button
        onClick={accuse}
        disabled={selected.length === 0}
        className="microlabel mt-8 w-full rounded-full border border-ember py-4 text-ember transition enabled:hover:bg-ember enabled:hover:text-ink disabled:opacity-40"
      >
        {selected.length === 0
          ? "select at least one suspect"
          : `make the accusation (${selected.length})`}
      </button>
    </div>
  );
}
