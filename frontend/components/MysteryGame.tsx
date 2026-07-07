"use client";

// SANCTUM MYSTERII — the deduction room (G1 rebuild). Pure elimination: read the
// evidence in the Case File, cycle each suspect / room / hour through
// Potential → Prime → Cleared to track your reasoning, then accuse the one triple
// you have PRIMED. No click-to-reveal — the answer is deduced. 375px-clean via
// CollapsiblePanel rails; the pills sit in their own aligned column (Mystery.module.css).

import { useEffect, useMemo, useState } from "react";
import type { MysteryPuzzle } from "@/lib/mysteryPuzzle";
import { CATEGORY_HEX } from "@/lib/types";
import CollapsiblePanel from "./CollapsiblePanel";
import MysteryStatusPill, { nextTag, prevTag, type SuspectTag } from "./MysteryStatusPill";
import styles from "./Mystery.module.css";

type Axis = "suspects" | "locations" | "times";
type Tags = Record<Axis, SuspectTag[]>;
type Accusation = { suspect: number; location: number; time: number };

interface Saved {
  tags: Tags;
  accusation: Accusation | null;
  won: boolean;
}

const HEX = CATEGORY_HEX.history;

const emptyTags = (p: MysteryPuzzle): Tags => ({
  suspects: Array<SuspectTag>(p.suspects.length).fill(undefined),
  locations: Array<SuspectTag>(p.locations.length).fill(undefined),
  times: Array<SuspectTag>(p.times.length).fill(undefined),
});

function loadSaved(date: string): Saved | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`parlor:mystery:${date}`);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function persist(date: string, s: Saved): void {
  try {
    localStorage.setItem(`parlor:mystery:${date}`, JSON.stringify(s));
  } catch {
    /* private mode — keep playing in-memory */
  }
}

function buildShare(p: MysteryPuzzle, acc: Accusation, won: boolean): string {
  const mark = (ok: boolean) => (ok ? "🟩" : "🟥");
  const head = won ? "CASE CLOSED 🔓" : "COLD CASE ❄️";
  return [
    "🔎 PARLOR · Sanctum Mysterii",
    p.caseName,
    head,
    `Culprit ${mark(acc.suspect === p.solution.suspect)} Scene ${mark(
      acc.location === p.solution.location,
    )} Hour ${mark(acc.time === p.solution.time)}`,
    `${p.clues.length} clues on the table`,
  ].join("\n");
}

export default function MysteryGame({ puzzle }: { puzzle: MysteryPuzzle }) {
  const [tags, setTags] = useState<Tags>(() => emptyTags(puzzle));
  const [accusation, setAccusation] = useState<Accusation | null>(null);
  const [won, setWon] = useState(false);
  const [copied, setCopied] = useState(false);

  // restore prior notes / a locked verdict after mount (client-only, no SSR skew)
  useEffect(() => {
    const prior = loadSaved(puzzle.date);
    if (!prior) return;
    if (prior.tags) setTags(prior.tags);
    if (prior.accusation) {
      setAccusation(prior.accusation);
      setWon(prior.won);
    }
  }, [puzzle.date]);

  const solved = accusation !== null;

  const primeOf = (axis: Axis) => tags[axis].indexOf("prime");
  const canAccuse =
    primeOf("suspects") >= 0 && primeOf("locations") >= 0 && primeOf("times") >= 0;

  function cycle(axis: Axis, i: number, dir: "fwd" | "back") {
    if (solved) return; // verdict is locked in for the day
    setTags((prev) => {
      const arr = prev[axis].slice();
      const t = dir === "fwd" ? nextTag(arr[i]) : prevTag(arr[i]);
      arr[i] = t;
      // one Prime per axis — priming a value demotes any other prime to potential
      if (t === "prime")
        for (let j = 0; j < arr.length; j++) if (j !== i && arr[j] === "prime") arr[j] = "potential";
      const next = { ...prev, [axis]: arr };
      persist(puzzle.date, { tags: next, accusation: null, won: false });
      return next;
    });
  }

  function accuse() {
    if (!canAccuse || solved) return;
    const acc: Accusation = {
      suspect: primeOf("suspects"),
      location: primeOf("locations"),
      time: primeOf("times"),
    };
    const w =
      acc.suspect === puzzle.solution.suspect &&
      acc.location === puzzle.solution.location &&
      acc.time === puzzle.solution.time;
    setAccusation(acc);
    setWon(w);
    persist(puzzle.date, { tags, accusation: acc, won: w });
  }

  async function share() {
    if (!accusation) return;
    const text = buildShare(puzzle, accusation, won);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  const axes: { axis: Axis; label: string; values: string[]; truth: number }[] = useMemo(
    () => [
      { axis: "suspects", label: "The Suspects", values: puzzle.suspects, truth: puzzle.solution.suspect },
      { axis: "locations", label: "The Scene", values: puzzle.locations, truth: puzzle.solution.location },
      { axis: "times", label: "The Hour", values: puzzle.times, truth: puzzle.solution.time },
    ],
    [puzzle],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_minmax(0,16rem)] lg:items-start">
      {/* ── LEFT: the Case File (evidence to reason from) ── */}
      <div className="lg:sticky lg:top-4">
        <CollapsiblePanel side="left" title="Case File" accent={HEX} storageKey="parlor:mystery:casefile">
          <p className="mb-3 text-sm leading-relaxed text-muted">
            The Order convenes over <span className="text-ink">{puzzle.caseName}</span>. A guest lies
            dead. From the evidence below, deduce the culprit, the scene and the hour — then accuse.
          </p>
          <ol className="flex list-none flex-col gap-2.5">
            {puzzle.clues.map((c, i) => (
              <li key={i} className={`${styles.clue} flex gap-2 text-ink`}>
                <span className="microlabel shrink-0 pt-0.5" style={{ color: HEX }}>
                  {i + 1}
                </span>
                <span>{c.text}</span>
              </li>
            ))}
          </ol>
        </CollapsiblePanel>
      </div>

      {/* ── CENTER: the deduction board (three aligned pill columns) ── */}
      <div className="flex flex-col gap-5">
        <div className="border-b border-line pb-3">
          <h1 className="display text-xl" style={{ color: HEX }}>
            {puzzle.caseName}
          </h1>
          <p className="microlabel mt-1">
            tap a pill to mark — potential · prime · cleared
          </p>
        </div>

        {axes.map(({ axis, label, values, truth }) => (
          <section key={axis}>
            <div className="microlabel mb-2" style={{ color: HEX }}>
              {label}
            </div>
            <ul className={styles.axis}>
              {values.map((v, i) => {
                const tag = tags[axis][i];
                const cleared = tag === "cleared";
                const prime = tag === "prime";
                const isTruth = solved && i === truth;
                const isWrongPick = solved && prime && i !== truth;
                return (
                  <li
                    key={i}
                    className={`${styles.row} border ${
                      isTruth
                        ? "border-history bg-history/10"
                        : prime
                          ? "border-ember bg-ember/10"
                          : "border-line bg-surface/50"
                    }`}
                  >
                    <span
                      className={`${styles.name} flex items-center gap-1.5 ${
                        cleared ? "text-muted line-through opacity-60" : "text-ink"
                      }`}
                    >
                      {isTruth && (
                        <span aria-label="the answer" title="the answer" style={{ color: HEX }}>
                          ✦
                        </span>
                      )}
                      {isWrongPick && (
                        <span aria-label="your incorrect pick" className="text-ember">
                          ✕
                        </span>
                      )}
                      {v}
                    </span>
                    <div className={styles.pillCol}>
                      <MysteryStatusPill
                        tag={tag}
                        onCycle={() => cycle(axis, i, "fwd")}
                        onReverse={() => cycle(axis, i, "back")}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* ── RIGHT: accusation / verdict (no scroll — CollapsiblePanel) ── */}
      <div className="lg:sticky lg:top-4">
        <CollapsiblePanel side="right" title={solved ? "Verdict" : "Accusation"} accent={HEX}>
          {!solved ? (
            <div className="flex flex-col gap-3">
              <dl className="flex flex-col gap-1.5 text-sm">
                <AccuseRow label="Culprit" value={puzzle.suspects[primeOf("suspects")]} />
                <AccuseRow label="Scene" value={puzzle.locations[primeOf("locations")]} />
                <AccuseRow label="Hour" value={puzzle.times[primeOf("times")]} />
              </dl>
              <button
                type="button"
                onClick={accuse}
                disabled={!canAccuse}
                className="min-h-[44px] rounded-full border border-brass bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Make the accusation
              </button>
              {!canAccuse && (
                <p className="text-xs leading-relaxed text-muted">
                  Prime one suspect, one scene and one hour to accuse. Long-press or right-click a
                  pill to step it back.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="display text-lg" style={{ color: won ? HEX : undefined }}>
                {won ? "Case Closed 🔓" : "Cold Case ❄️"}
              </p>
              <p className="text-sm leading-relaxed text-muted">
                The killer was <span className="text-ink">{puzzle.suspects[puzzle.solution.suspect]}</span>,
                in <span className="text-ink">{puzzle.locations[puzzle.solution.location]}</span>, at{" "}
                <span className="text-ink">{puzzle.times[puzzle.solution.time]}</span>.
              </p>
              <button
                type="button"
                onClick={share}
                className="min-h-[44px] rounded-full border border-brass bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:border-gold"
              >
                {copied ? "Copied ✓" : "Share the verdict"}
              </button>
              <p className="microlabel">a fresh case each night</p>
            </div>
          )}
        </CollapsiblePanel>
      </div>
    </div>
  );
}

function AccuseRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="microlabel">{label}</dt>
      <dd className={value ? "text-sm text-ink" : "text-sm text-muted"}>{value ?? "—"}</dd>
    </div>
  );
}
