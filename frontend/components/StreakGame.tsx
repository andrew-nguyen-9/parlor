"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { IgnitePuzzle, IgniteClue } from "@/lib/ignitePuzzle";
import CollapsiblePanel from "@/components/CollapsiblePanel";
import styles from "./StreakGame.module.css";

// Flame brightness in [0.2, 1] from the fraction of runes inscribed. Reuses the
// shared `.streak-flame` / `.streak-bloom` decoration in globals.css (which sets
// its size/opacity from --flame and freezes itself under reduced-motion).
const FLAME_MIN = 0.2;

/** The Witch's candle — bloom + flame scale with --flame, purely decorative and
 *  BEHIND the board so it can never wash out text. */
function Candle({ brightness }: { brightness: number }) {
  return (
    <div
      className="pointer-events-none relative mx-auto h-24 w-16"
      style={{ ["--flame" as string]: brightness }}
      aria-hidden
    >
      <div className="streak-bloom absolute inset-x-[-80%] inset-y-[-110%]" />
      <div
        className="streak-flame absolute left-1/2 top-1 h-8 w-4 -translate-x-1/2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
        style={{
          background:
            "radial-gradient(circle at 50% 70%, #fff6d2 0%, #f5c542 35%, #e0871f 75%, #b8392b 100%)",
        }}
      />
      <div className="absolute left-1/2 top-9 h-2 w-px -translate-x-1/2 bg-ink/60" />
      <div className="absolute left-1/2 top-10 h-12 w-6 -translate-x-1/2 rounded-t-sm bg-gradient-to-b from-[#efe3c0] to-[#c9a24a]" />
    </div>
  );
}

export default function StreakGame({
  puzzle,
  requestedDate,
}: {
  puzzle: IgnitePuzzle | null;
  requestedDate?: string | null;
}) {
  const reduce = Boolean(useReducedMotion());

  // ── Dark state: archive-play of a date never generated (DB up, no row). The
  // zero-env loader always generates inline, so offline play is never dark. ──
  if (!puzzle) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-5xl opacity-70" aria-hidden>
          🕯️
        </p>
        <p className="text-muted">
          {requestedDate
            ? "No inscription survives from that night."
            : "The candle is unlit. No incantation waits tonight."}
        </p>
        <p className="microlabel text-smoke">
          the runes are carved nightly — return when the wick catches
        </p>
      </div>
    );
  }

  return <RuneBoard puzzle={puzzle} reduce={reduce} />;
}

function RuneBoard({ puzzle, reduce }: { puzzle: IgnitePuzzle; reduce: boolean }) {
  const K = puzzle.letters.length;
  const [assign, setAssign] = useState<(number | null)[]>(() =>
    new Array(K).fill(null),
  );
  const [selected, setSelected] = useState<number>(0); // selected glyph index
  const [activeClue, setActiveClue] = useState<number | null>(null);
  const [reveals, setReveals] = useState(0); // failed "read" attempts
  const [shake, setShake] = useState(false);
  const [won, setWon] = useState(false);
  const [copied, setCopied] = useState(false);

  const filled = assign.filter((a) => a !== null).length;
  const brightness = won ? 1 : FLAME_MIN + (1 - FLAME_MIN) * (filled / K);

  // glyph indices lit by the active clue (ring highlight)
  const litGlyphs = useMemo(() => {
    const s = new Set<number>();
    if (activeClue != null) for (const g of puzzle.clues[activeClue].glyphs) s.add(g);
    return s;
  }, [activeClue, puzzle.clues]);

  function selectGlyph(g: number) {
    if (won) return;
    setSelected(g);
  }

  // Tap a letter: unassign it if placed, else drop it on the selected glyph and
  // advance to the next empty glyph. Keeps the map a strict bijection.
  function tapLetter(l: number) {
    if (won) return;
    const at = assign.indexOf(l);
    setAssign((prev) => {
      const next = [...prev];
      if (at !== -1) {
        next[at] = null; // toggle off a placed letter
        return next;
      }
      next[selected] = l;
      return next;
    });
    if (at === -1) {
      const nextEmpty = assign.findIndex((a, i) => a === null && i !== selected);
      if (nextEmpty !== -1) setSelected(nextEmpty);
    }
  }

  function clearGlyph(g: number) {
    if (won) return;
    setAssign((prev) => {
      const next = [...prev];
      next[g] = null;
      return next;
    });
    setSelected(g);
  }

  function readTheRunes() {
    if (filled < K || won) return;
    const correct = assign.every((a, g) => a === puzzle.solution[g]);
    if (correct) {
      setWon(true);
    } else {
      setReveals((n) => n + 1);
      setShake(true);
      setTimeout(() => setShake(false), reduce ? 0 : 500);
    }
  }

  function reset() {
    setAssign(new Array(K).fill(null));
    setSelected(0);
    setWon(false);
    setActiveClue(null);
  }

  async function share() {
    const runes = puzzle.glyphs.map((g) => g.rune).join("");
    const text = `IGNITE ${puzzle.date}\n${runes}\n${puzzle.runeSet} deciphered${reveals ? ` · ${reveals} misread${reveals > 1 ? "s" : ""}` : " · flawless"} 🔥\nparlor`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }

  const letterAssignedTo = (l: number) => assign.indexOf(l); // glyph or -1

  return (
    <div className="relative">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="display text-4xl sm:text-5xl">Ignite</h1>
          <p className="microlabel mt-1 text-history">
            {puzzle.runeSet} · the Witch&apos;s cipher
          </p>
        </div>
        <div className="text-right">
          <div className="microlabel">runes lit</div>
          <div className="tabular text-3xl font-black text-[#e0871f]">
            {won ? K : filled}/{K}
          </div>
        </div>
      </header>

      {/* The inscription — the incantation spelled in runes; each rune shows the
          player's chosen letter beneath it, so cracking the key lights the word. */}
      <section className={`${styles.inscription} mt-6`} aria-label="the inscription">
        <Candle brightness={brightness} />
        <div className="mt-3 flex flex-wrap items-end justify-center gap-2">
          {puzzle.cipher.map((g, i) => {
            const l = assign[g];
            return (
              <div key={i} className={styles.inscriptionCell}>
                <span className={styles.inscriptionRune} aria-hidden>
                  {puzzle.glyphs[g].rune}
                </span>
                <span
                  className={`${styles.inscriptionLetter} ${won ? styles.inscriptionLit : ""}`}
                >
                  {l != null ? puzzle.letters[l] : "·"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {won ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-8 max-w-md rounded-2xl border border-[#e0871f]/50 bg-surface p-6 text-center"
        >
          <p className="display text-3xl text-[#e0871f]">The inscription blazes</p>
          <p className="mt-2 text-2xl font-black tracking-[0.3em] text-ink">
            {puzzle.incantation}
          </p>
          <p className="mt-2 text-muted">
            {reveals === 0
              ? "Read flawlessly — the Order is impressed."
              : `${reveals} misread${reveals > 1 ? "s" : ""} before the wick caught.`}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={share}
              className="microlabel rounded-full border border-history px-6 py-3 text-history transition hover:bg-history hover:text-bg"
            >
              {copied ? "copied ✓" : "share"}
            </button>
            <button
              onClick={reset}
              className="microlabel rounded-full border border-ink px-6 py-3 transition hover:bg-ink hover:text-bg"
            >
              inscribe again
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start">
          {/* Rune key + letter tray */}
          <div>
            <p className="microlabel">the rune key — bind each rune to a letter</p>
            <div
              className={`mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 ${shake ? styles.shake : ""}`}
            >
              {puzzle.glyphs.map((glyph, g) => {
                const l = assign[g];
                const isSel = selected === g;
                const isLit = litGlyphs.has(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => (l != null ? clearGlyph(g) : selectGlyph(g))}
                    aria-pressed={isSel}
                    aria-label={`${glyph.name} rune${l != null ? `, letter ${puzzle.letters[l]} — tap to clear` : ", tap to select"}`}
                    className={`${styles.glyphTile} ${isSel ? styles.glyphSelected : ""} ${isLit ? styles.glyphLit : ""}`}
                  >
                    <span className={styles.glyphRune} aria-hidden>
                      {glyph.rune}
                    </span>
                    <span className="microlabel text-[0.65rem] opacity-75">
                      {glyph.name}
                    </span>
                    <span className={styles.glyphLetter}>
                      {l != null ? puzzle.letters[l] : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="microlabel mt-5">the letters — tap to place on the lit rune</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {puzzle.letters.map((letter, l) => {
                const placedAt = letterAssignedTo(l);
                const placed = placedAt !== -1;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => tapLetter(l)}
                    aria-pressed={placed}
                    className={`${styles.letterChip} ${placed ? styles.letterPlaced : ""}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={readTheRunes}
                disabled={filled < K}
                className="microlabel rounded-full border border-[#e0871f] px-8 py-3 text-[#e0871f] transition enabled:hover:bg-[#e0871f] enabled:hover:text-bg disabled:opacity-40"
              >
                read the runes
              </button>
              {filled > 0 && (
                <button
                  onClick={reset}
                  className="microlabel rounded-full border border-line px-5 py-3 text-muted transition hover:border-ink hover:text-ink"
                >
                  clear
                </button>
              )}
              {reveals > 0 && (
                <span className="microlabel self-center text-music">
                  the runes resist — {reveals} misread{reveals > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Clues — collapsible on mobile (F4 primitive) */}
          <CollapsibleClues
            clues={puzzle.clues}
            active={activeClue}
            onHover={setActiveClue}
          />
        </div>
      )}
    </div>
  );
}

// Thin wrapper so the clue list can collapse on 375px while staying a sticky
// rail on desktop. Uses F4's CollapsiblePanel.
function CollapsibleClues({
  clues,
  active,
  onHover,
}: {
  clues: IgniteClue[];
  active: number | null;
  onHover: (i: number | null) => void;
}) {
  return (
    <CollapsiblePanel
      side="right"
      title={`the oracle's clues (${clues.length})`}
      accent="#e0871f"
      storageKey="parlor:ignite:clues"
    >
      <ol className="space-y-2">
        {clues.map((c, i) => (
          <li key={i}>
            <button
              type="button"
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(i)}
              onBlur={() => onHover(null)}
              onClick={() => onHover(active === i ? null : i)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                active === i
                  ? "border-[#e0871f] bg-[#e0871f]/10 text-ink"
                  : "border-line text-muted hover:border-[#e0871f]/60"
              }`}
            >
              {c.text}
            </button>
          </li>
        ))}
      </ol>
    </CollapsiblePanel>
  );
}
