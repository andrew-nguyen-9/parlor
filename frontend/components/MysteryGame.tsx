"use client";

// SANCTUM MYSTERII — the deduction room (G1 rebuild). Pure elimination: read the
// evidence in the Case File, cycle each suspect / room / hour through
// Potential → Prime → Cleared to track your reasoning, then accuse the one triple
// you have PRIMED. No click-to-reveal — the answer is deduced. 375px-clean via
// CollapsiblePanel rails; the pills sit in their own aligned column (Mystery.module.css).

import { useEffect, useMemo, useState } from "react";
import {
  clueMatches,
  type ClueFilter,
  type ClueKind,
  type MysteryPuzzle,
} from "@/lib/mysteryPuzzle";
import { CATEGORY_HEX } from "@/lib/types";
import { audio } from "@/lib/sound";
import { AmbientGlow, GrainFog, Ornament, ParticleField } from "@/components/atmosphere";
import CollapsiblePanel from "./CollapsiblePanel";
import MysteryStatusPill, { nextTag, prevTag, type SuspectTag } from "./MysteryStatusPill";
import styles from "./Mystery.module.css";

type Axis = "suspects" | "locations" | "times";
type Tags = Record<Axis, SuspectTag[]>;
type Accusation = { suspect: number; location: number; time: number };

// doc-01 "Multi-Layer Evidence": the clue KINDS already carry their evidence
// class — present them layered (timeline → testimony/movement → cleared) so the
// case reads as progressive reasoning, not a flat list. Pure presentation; the
// generated clue set (and its unique solution) is untouched.
const CLUE_LAYER: Record<ClueKind, 0 | 1 | 2> = {
  after: 0,
  before: 0,
  "clear-time": 0,
  "room-sealed": 1,
  arrived: 1,
  "never-in": 1,
  "clear-suspect": 2,
  "clear-room": 2,
};
const EVIDENCE_LAYERS: { key: 0 | 1 | 2; title: string; hint: string }[] = [
  { key: 0, title: "The Timeline", hint: "when the blow could fall" },
  { key: 1, title: "Movements & Testimony", hint: "who was where, and when" },
  { key: 2, title: "Alibis Cleared", hint: "the accounts that hold" },
];

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
  const [search, setSearch] = useState("");
  const [clueFilter, setClueFilter] = useState<ClueFilter>("all");

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

  // Candlelit parlor ambience for the room. The manager self-silences under mute
  // or reduced-motion and tears down on unmount (f1-audio contract).
  useEffect(() => {
    audio.startAmbient("mystery");
    return () => audio.stopAmbient();
  }, []);

  const solved = accusation !== null;

  const primeOf = (axis: Axis) => tags[axis].indexOf("prime");
  const canAccuse =
    primeOf("suspects") >= 0 && primeOf("locations") >= 0 && primeOf("times") >= 0;

  function cycle(axis: Axis, i: number, dir: "fwd" | "back") {
    if (solved) return; // verdict is locked in for the day
    audio.sfx("place"); // tactile mark — a soft note as a card is tagged
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
    if (w) {
      audio.sfx("correct");
      audio.stinger(); // the completion ceremony — case closed
    } else {
      audio.sfx("wrong");
    }
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

  // Case File search/filter (E6) — keep the original clue number (i+1) so it
  // still matches the numbering the player has been reasoning from.
  const filteredClues = useMemo(
    () =>
      puzzle.clues
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => clueMatches(c, search, clueFilter)),
    [puzzle.clues, search, clueFilter],
  );

  // Group the (filtered) clues by evidence layer, keeping only non-empty layers
  // so search/filter still collapses cleanly. Original clue numbers preserved.
  const evidenceGroups = useMemo(
    () =>
      EVIDENCE_LAYERS.map((layer) => ({
        layer,
        items: filteredClues.filter(({ c }) => CLUE_LAYER[c.kind] === layer.key),
      })).filter((g) => g.items.length > 0),
    [filteredClues],
  );

  const axes: { axis: Axis; label: string; values: string[]; truth: number }[] = useMemo(
    () => [
      { axis: "suspects", label: "The Suspects", values: puzzle.suspects, truth: puzzle.solution.suspect },
      { axis: "locations", label: "The Scene", values: puzzle.locations, truth: puzzle.solution.location },
      { axis: "times", label: "The Hour", values: puzzle.times, truth: puzzle.solution.time },
    ],
    [puzzle],
  );

  return (
    <>
      {/* ── Candlelit manor atmosphere (F1 primitives; ≤1 animating loop) ──
          Only the dust field animates; bloom + grain are designed still frames.
          Reduced-motion freezes all three via each primitive's own contract. */}
      <div aria-hidden className={styles.atmos}>
        <AmbientGlow intensity={0.5} color="rgb(var(--c-candle))" position="50% -8%" />
        <GrainFog opacity={0.1} />
        <ParticleField kind="dust" density={0.7} opacity={0.6} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_minmax(0,16rem)] lg:items-start">
      {/* ── LEFT: the Case File (evidence to reason from) ── */}
      <div className="lg:sticky lg:top-4">
        <CollapsiblePanel side="left" title="Case File" accent={HEX} storageKey="parlor:mystery:casefile">
          <p className="mb-3 text-sm leading-relaxed text-muted">
            The Order convenes over <span className="text-ink">{puzzle.caseName}</span>. A guest lies
            dead. From the evidence below, deduce the culprit, the scene and the hour — then accuse.
          </p>

          <div className="mb-3 flex flex-col gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search the clues…"
              aria-label="search clues"
              className="w-full rounded-lg border border-line bg-bg px-3 py-1.5 text-sm text-ink outline-none focus:border-gold"
            />
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", "All"],
                  ["suspects", "Suspects"],
                  ["locations", "Scene"],
                  ["times", "Hour"],
                ] as [ClueFilter, string][]
              ).map(([f, label]) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setClueFilter(f)}
                  className={`microlabel rounded-full border px-2.5 py-1 text-[10px] transition ${
                    clueFilter === f
                      ? "border-gold text-gold"
                      : "border-line text-muted hover:border-gold hover:text-gold"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {evidenceGroups.map(({ layer, items }) => (
              <section key={layer.key} className={styles.layer}>
                <div className="flex items-baseline justify-between gap-2 border-b border-line/70 pb-1">
                  <span className="microlabel" style={{ color: HEX }}>
                    {layer.title}
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-wide text-muted">
                    {layer.hint}
                  </span>
                </div>
                <ol className="flex list-none flex-col gap-2">
                  {items.map(({ c, i }) => (
                    <li key={i} className={`${styles.clueCard} border border-line/60 text-ink`}>
                      <span
                        className={`${styles.pin} microlabel border`}
                        style={{ color: HEX, borderColor: HEX }}
                      >
                        {i + 1}
                      </span>
                      <span>{c.text}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            {evidenceGroups.length === 0 && (
              <p className="text-sm text-muted">No clues match — try a different search or filter.</p>
            )}
          </div>
        </CollapsiblePanel>
      </div>

      {/* ── CENTER: the deduction board (three aligned pill columns) ── */}
      <div className="flex flex-col gap-5">
        <div className="border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Ornament variant="moon" treatment="gold" size={22} className="shrink-0" />
            <h1 className="display text-xl" style={{ color: HEX }}>
              {puzzle.caseName}
            </h1>
          </div>
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
                    // ponytail: whole row cycles fwd on click (E6); the pill stays the
                    // keyboard/reverse control (stopPropagation keeps it from double-firing).
                    onClick={() => cycle(axis, i, "fwd")}
                    className={`${styles.row} cursor-pointer border ${
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
              {won && (
                <div className={styles.seal}>
                  <Ornament variant="flourish" treatment="gold" size={120} />
                </div>
              )}
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
    </>
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
