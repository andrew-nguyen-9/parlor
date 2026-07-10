"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  emptyBoard,
  nextHint,
  remainingFromClue,
  withAutoElim,
  histCommit,
  histUndo,
  histRedo,
  histState,
  type SeancePuzzle,
  type Mark,
  type Board,
  type Hint,
  type History,
} from "@/lib/seance";
import { recordBanishing, loadGrimoire, spiritsBanished } from "@/lib/grimoire";
import { buildShare, type GameResult, type Tier } from "@/lib/share";
import { sfxGlassClink, sfxWrong, sfxDoorLatch, audio } from "@/lib/sound";
import { CATEGORIES, CATEGORY_HEX, CATEGORY_INK, CATEGORY_GLYPH } from "@/lib/types";
import CollapsiblePanel from "./CollapsiblePanel";
import FluidStage from "./FluidStage";
import SeanceAtmosphere from "./seance/SeanceAtmosphere";
import Planchette from "./seance/Planchette";
import { Ornament } from "@/components/atmosphere";
import styles from "./SeanceGame.module.css";

const ACCENT = "#7040a8"; // wildcard / the Medium — the room's signature accent

// E1.6 — color-code each puzzle category (guest/relic/sin/…) by its slot, so a
// category and all of its value columns share one hue. Text uses CATEGORY_INK
// (theme-remapping var, AA both themes); fills use CATEGORY_HEX. Never colour
// alone — every band also carries its suit glyph + label (a11y 2.14).
const catKey = (c: number) => CATEGORIES[c % CATEGORIES.length];
const catInk = (c: number) => CATEGORY_INK[catKey(c)]; // text
const catHex = (c: number) => CATEGORY_HEX[catKey(c)]; // fills
const catGlyph = (c: number) => CATEGORY_GLYPH[catKey(c)];
// Mark: 0 none · 1 exclude (snuffed candle) · 2 confirm (glowing rune).
// Board = marks[cat][seat][val]. Types + emptyBoard live in lib/seance.
// Auto-elim is DERIVED via withAutoElim (never stored) — see lib/seance.

// E1.4 — Title-Case grid headers (category labels + value names). Display-only;
// the underlying flavor data stays lowercase so clue prose reads naturally.
const titleCase = (s: string) => s.replace(/\b[a-z]/g, (m) => m.toUpperCase());

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function SeanceGame({
  puzzle,
  requestedDate,
}: {
  puzzle: SeancePuzzle | null;
  requestedDate?: string | null;
}) {
  const reduce = useReducedMotion();
  const active = puzzle;

  // ── Dark state: archive-play of a date that was never generated (DB
  // connected, no row). Zero-env-var play always gets a puzzle — see
  // `getSeancePuzzle` in lib/queries.ts. ──
  if (!active) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-5xl opacity-70" aria-hidden>
          🕯️
        </p>
        <p className="text-muted">
          {requestedDate
            ? "No record of that night survives in the archive."
            : "The veil is closed. No spirit waits at the table tonight."}
        </p>
        <p className="microlabel text-smoke">
          the séance is summoned nightly — return when the candles are lit
        </p>
      </div>
    );
  }

  return <SeanceTable puzzle={active} reduce={!!reduce} />;
}

function SeanceTable({ puzzle, reduce }: { puzzle: SeancePuzzle; reduce: boolean }) {
  // The real marks live in an undo/redo history; `board` is the current frame.
  const [hist, setHist] = useState<History<Board>>(() => ({
    stack: [emptyBoard(puzzle)],
    idx: 0,
  }));
  const board = histState(hist);
  const canUndo = hist.idx > 0;
  const canRedo = hist.idx < hist.stack.length - 1;

  const [whisper, setWhisper] = useState<Board>(() => emptyBoard(puzzle)); // scratchpad, no history
  const [whisperMode, setWhisperMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeClue, setActiveClue] = useState<number | null>(null);
  const [hint, setHint] = useState<Hint | null>(null);
  const [flagged, setFlagged] = useState<Set<number>>(() => new Set());
  // Each binding bumps `pulse` so the planchette leans toward the freshly bound
  // spirit — per-deduction feedback (a finite ≤600ms lean, not a loop).
  const [pulse, setPulse] = useState(0);
  const clueRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const startedAt = useRef(Date.now());

  // Ambient séance bed (f1-audio): starts on mount, stops on unmount. Silent
  // under mute OR reduced-motion by the manager's own contract — no gate here.
  useEffect(() => {
    audio.startAmbient("seance");
    return () => audio.stopAmbient();
  }, []);

  // E1 layout: the matrix is TRANSPOSED — seats are columns (numbered 1..N,
  // left→right) and each category's values are rows (category axis on the LEFT).
  // Only N (≤7) columns, so it fits every width with no horizontal scroll and no
  // rotation hack; the long K·N axis runs down the page (vertical scroll only).

  // Derived display board: manual marks + logic-grid auto-elimination. Auto-X is
  // never stored, so blanking a confirm releases exactly the X's it forced
  // unless another confirm still forces them (withAutoElim re-derives). Manual
  // board (`board`) stays confirm-accurate → solve-check + nextHint read it raw.
  const view = useMemo(() => withAutoElim(board, puzzle.n), [board, puzzle.n]);
  const whisperView = useMemo(() => withAutoElim(whisper, puzzle.n), [whisper, puzzle.n]);

  const total = elapsed + strikes * 60;

  // count-up "Ectoplasmic Decay" timer
  useEffect(() => {
    if (won) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [won]);

  // atmospheric pressure: vignette deepens with time (frozen if reduced-motion)
  const pressure = reduce ? 0.25 : Math.min(0.85, 0.18 + total / 900);

  // columns highlighted in the matrix: those named by the traced clue AND by the
  // clue(s) a hint points at, as "cat:val" keys.
  const hiCols = useMemo(() => {
    const s = new Set<string>();
    const add = (i: number | null) => {
      const cl = i === null ? undefined : puzzle.clues[i];
      if (!cl) return;
      s.add(`${cl.a.cat}:${cl.a.val}`);
      if (cl.b) s.add(`${cl.b.cat}:${cl.b.val}`);
    };
    add(activeClue);
    hint?.clues.forEach(add);
    return s;
  }, [activeClue, hint, puzzle.clues]);

  const setCell = (prev: Board, c: number, seat: number, val: number, nv: Mark): Board => {
    const next = prev.map((cat) => cat.map((row) => row.slice()));
    next[c][seat][val] = nv;
    return next;
  };

  const cycle = useCallback(
    (c: number, seat: number, val: number) => {
      if (won) return;
      // 3-phase X→O→blank driven off the DISPLAYED mark (which already includes
      // auto-X), so one tap always visibly advances even on an auto-excluded
      // cell: blank→X, X→O, O→blank. Auto-X is never written; confirming a cell
      // re-derives the row/col exclusions, blanking releases them (withAutoElim).
      const cur = (whisperMode ? whisperView : view)[c][seat][val];
      const nv: Mark = cur === 0 ? 1 : cur === 1 ? 2 : 0;
      if (whisperMode) {
        setWhisper((prev) => setCell(prev, c, seat, val, nv));
      } else {
        setHist((h) => histCommit(h, setCell(histState(h), c, seat, val, nv)));
        setHint(null);
        if (nv === 2) {
          sfxGlassClink(); // glass clink when a cell is bound
          setPulse((p) => p + 1); // planchette leans toward the binding
        }
      }
    },
    [view, whisperView, whisperMode, won],
  );

  const undo = useCallback(() => {
    setHist((h) => histUndo(h));
    setHint(null);
  }, []);
  const redo = useCallback(() => {
    setHist((h) => histRedo(h));
    setHint(null);
  }, []);

  // Triple-click a cell: snuff its whole row (this seat, every category+value)
  // and its whole column (this category+value, every seat) — a bulk "I got
  // this wrong" gesture. A cell already CONFIRMED (bound, mark 2) anywhere in
  // that row/col is a settled placement, not scratch work — it survives.
  const clearRowCol = useCallback(
    (c: number, seat: number, val: number) => {
      if (won) return;
      const wipe = (prev: Board): Board => {
        const next = prev.map((cat) => cat.map((row) => row.slice()));
        for (let cc = 0; cc < puzzle.categories.length; cc++)
          for (let v = 0; v < puzzle.n; v++)
            if (next[cc][seat][v] !== 2) next[cc][seat][v] = 0;
        for (let s = 0; s < puzzle.n; s++)
          if (next[c][s][val] !== 2) next[c][s][val] = 0;
        return next;
      };
      if (whisperMode) {
        setWhisper(wipe); // in whisper mode the gesture clears scratch, not the board
      } else {
        setHist((h) => histCommit(h, wipe(histState(h))));
        setHint(null);
      }
    },
    [won, whisperMode, puzzle.categories.length, puzzle.n],
  );

  // Clear button: wipe the whole matrix back to blank. A full commit, so a
  // regretted Clear is one ⌘/Ctrl+Z away — no confirm dialog needed.
  const clearBoard = useCallback(() => {
    if (won) return;
    setHist((h) => histCommit(h, emptyBoard(puzzle)));
    setHint(null);
    setActiveClue(null);
  }, [won, puzzle]);

  // Undo/redo keyboard shortcuts (ignored while typing in a field).
  useEffect(() => {
    if (won) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))
        return;
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [won, undo, redo]);

  // Hint: reveal the clue(s) that force the next move, never the answer.
  const showHint = useCallback(() => {
    const h = nextHint(board, puzzle);
    setHint(h);
    if (h?.wrong) setActiveClue(null); // no clue to trace — a mark is bad
    else if (h && h.clues.length) setActiveClue(h.clues[0]);
  }, [board, puzzle]);

  // Scroll the primary hinted clue into view.
  useEffect(() => {
    const i = hint?.clues[0];
    if (i === undefined) return;
    clueRefs.current[i]?.scrollIntoView({
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [hint, reduce]);

  // Flag a clue done. If it still yields deductions, confirm before dimming it.
  // The confirm lives OUTSIDE the state updater — React requires updaters to be
  // pure and may run them twice (StrictMode dev), double-popping the dialog.
  const toggleFlag = useCallback(
    (i: number) => {
      if (!flagged.has(i)) {
        const n = remainingFromClue(board, puzzle, i);
        if (n > 0 && typeof window !== "undefined") {
          const ok = window.confirm(
            `${n} more elimination${n > 1 ? "s" : ""} possible with this clue. Mark it done anyway?`,
          );
          if (!ok) return;
        }
      }
      setFlagged((prev) => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        return next;
      });
    },
    [board, puzzle, flagged],
  );

  function submit() {
    if (won) return;
    // valid iff every category/seat has exactly one confirm AND it matches truth
    let ok = true;
    for (let c = 0; c < puzzle.categories.length && ok; c++) {
      for (let seat = 0; seat < puzzle.n && ok; seat++) {
        const confirms = board[c][seat]
          .map((m, v) => (m === 2 ? v : -1))
          .filter((v) => v >= 0);
        if (confirms.length !== 1 || puzzle.solution[c][seat] !== confirms[0]) {
          ok = false;
        }
      }
    }
    if (ok) {
      setWon(true);
      audio.stinger(); // reverent completion stinger (f1-audio)
      recordBanishing({
        spirit: puzzle.spirit,
        date: puzzle.date,
        rite: puzzle.rite,
        seconds: total,
        strikes,
      });
    } else {
      // Poltergeist Strike: +60s, shake the table
      setStrikes((s) => s + 1);
      sfxWrong();
      if (!reduce) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  }

  if (won) {
    return (
      <Banished
        puzzle={puzzle}
        seconds={total}
        strikes={strikes}
        copied={copied}
        setCopied={setCopied}
        reduce={reduce}
      />
    );
  }

  return (
    // FluidStage (F1): max-width cap + centering + overflow-x-clip, composed
    // instead of re-derived — padding stays on .shell (inside the card, as
    // before) so FluidStage contributes width math only, no doubled gutters.
    <FluidStage maxWidth="74rem" padding="0">
      <motion.div
        className={styles.shell}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0], opacity: 1, y: 0 } : { x: 0, opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          // edges darken as the séance drags on
          boxShadow: `inset 0 0 140px ${pressure * 100}px rgba(8,4,14,${pressure})`,
        }}
      >
      {/* Premium séance atmosphere: candle/dust/smoke sim + gilt frame + the
          one living planchette. A background layer (zIndex 0) behind content. */}
      <SeanceAtmosphere reduce={reduce} pulse={pulse} />

      {/* HUD */}
      <div className={styles.hud}>
        <div>
          <p className="microlabel" style={{ color: ACCENT }}>
            {puzzle.rite} · {puzzle.spirit}
          </p>
          <p className="text-xs text-muted mt-0.5 max-w-md">{puzzle.backstory}</p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <span className="font-mono text-lg tabular-nums text-ink" aria-live="off">
            ⏱ {fmt(total)}
          </span>
          {strikes > 0 && (
            <span className="microlabel text-[#b22b2b]" title="poltergeist strikes (+60s each)">
              💀 ×{strikes}
            </span>
          )}
        </div>
      </div>

      <div className={styles.main}>
        {/* Clues — the corrupted message. Stacked vertically in the left rail;
            tap one to light up the cells it names. */}
        <div className={styles.hintRail}>
          <CollapsiblePanel
            side="left"
            title={`the spirit whispers (${puzzle.clues.length})`}
            accent={ACCENT}
            defaultOpen
            storageKey="parlor:seance-hints"
          >
            <p className="microlabel mb-2 text-smoke">tap a clue to trace · ✓ marks it spent</p>
            <div className={styles.clues}>
              {puzzle.clues.map((cl, i) => {
                const on = activeClue === i;
                const hinted = !!hint?.clues.includes(i);
                const flag = flagged.has(i);
                return (
                  <div
                    key={i}
                    className={`${styles.clueRow} ${flag ? styles.clueFlagged : ""} ${hinted ? styles.clueHint : ""}`}
                  >
                    <button
                      ref={(el) => {
                        clueRefs.current[i] = el;
                      }}
                      type="button"
                      onClick={() => setActiveClue(on ? null : i)}
                      aria-pressed={on}
                      className={`${styles.clue} ${on ? styles.clueActive : ""} text-sm text-ink`}
                      style={on ? { color: ACCENT } : undefined}
                    >
                      <span className="text-smoke select-none" aria-hidden>
                        ✦
                      </span>
                      <span>{cl.text}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFlag(i)}
                      aria-pressed={flag}
                      aria-label={flag ? "clue marked spent — restore it" : "mark clue spent"}
                      title={flag ? "restore clue" : "mark clue spent"}
                      className={styles.flagBtn}
                    >
                      {flag ? "✓" : "○"}
                    </button>
                  </div>
                );
              })}
            </div>
          </CollapsiblePanel>
        </div>

        {/* The Scrying Matrix — TRANSPOSED: seats are columns (1..N, ascending
            left→right); each category's values are rows, category axis on the
            LEFT. Only N (≤7) columns, so it fits every width with no horizontal
            scroll and no rotation; the long K·N axis runs down the page. */}
        <div className={styles.matrixWrap}>
          <table className={styles.matrix} role="grid" aria-label="the scrying matrix">
            <thead>
              <tr>
                <th className={styles.corner} scope="col" colSpan={2}>
                  seat →
                </th>
                {Array.from({ length: puzzle.n }, (_, seat) => (
                  <th key={seat} scope="col" className={`${styles.seatHead} text-smoke`}>
                    {seat + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {puzzle.categories.map((cat, c) =>
                cat.values.map((v, val) => {
                  const hi = hiCols.has(`${c}:${val}`);
                  return (
                    <tr key={`${cat.key}-${val}`}>
                      {val === 0 && (
                        <th
                          scope="rowgroup"
                          rowSpan={puzzle.n}
                          className={`${styles.catAxis} ${c > 0 ? styles.groupStart : ""}`}
                          style={{ color: catInk(c) }}
                        >
                          <span className={styles.catAxisInner}>
                            <span aria-hidden className="mr-1">
                              {catGlyph(c)}
                            </span>
                            {titleCase(cat.label)}
                          </span>
                        </th>
                      )}
                      <th
                        scope="row"
                        className={`${styles.valHead} ${val === 0 && c > 0 ? styles.groupStart : ""} ${hi ? styles.colHiHead : ""}`}
                        style={{ color: catInk(c) }}
                        title={v}
                      >
                        {titleCase(v)}
                      </th>
                      {Array.from({ length: puzzle.n }, (_, seat) => {
                        const m = view[c][seat][val];
                        const w = whisperView[c][seat][val];
                        const mark = m === 2 ? "◯" : m === 1 ? "✕" : "";
                        const wisp = w !== 0 && m === 0 ? (w === 2 ? "◯" : "✕") : "";
                        return (
                          <td
                            key={seat}
                            className={`${styles.cellTd} ${hi ? styles.colHi : ""}`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                // triple-click snuffs the whole row + column
                                // (confirmed cells survive); taps cycle.
                                if (e.detail >= 3) clearRowCol(c, seat, val);
                                else cycle(c, seat, val);
                              }}
                              aria-label={`seat ${seat + 1}, ${cat.label} ${v}: ${m === 2 ? "bound" : m === 1 ? "snuffed" : "unmarked"}`}
                              title="triple-click to clear this row + column"
                              className={styles.cell}
                              style={{
                                borderColor: m === 2 ? catHex(c) : undefined,
                                background: m === 2 ? `${catHex(c)}26` : "transparent",
                                color: m === 2 ? catInk(c) : m === 1 ? "#7a6e8a" : "transparent",
                                // a bound spirit glows — a soft spectral halo in
                                // the cell's category hue (static, no loop)
                                boxShadow: m === 2 ? `0 0 10px -1px ${catHex(c)}66` : undefined,
                              }}
                            >
                              <span aria-hidden>
                                {mark || (wisp && <span className={styles.wisp}>{wisp}</span>) || "·"}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.nav}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={showHint}
            className="microlabel inline-flex items-center justify-center min-h-11 rounded-full border px-4 py-2 transition hover:brightness-110"
            style={{ borderColor: ACCENT, color: ACCENT, background: `${ACCENT}12` }}
            title="reveal the clue that forces the next move"
          >
            ✦ hint
          </button>
          <button
            onClick={undo}
            disabled={!canUndo}
            aria-label="undo"
            title="undo (⌘/Ctrl+Z)"
            className="microlabel inline-flex items-center justify-center min-h-11 rounded-full border px-4 py-2 transition disabled:opacity-30"
            style={{ borderColor: "var(--line, #2a2333)" }}
          >
            ↶ undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            aria-label="redo"
            title="redo (⇧⌘/Ctrl+Z)"
            className="microlabel inline-flex items-center justify-center min-h-11 rounded-full border px-4 py-2 transition disabled:opacity-30"
            style={{ borderColor: "var(--line, #2a2333)" }}
          >
            ↷ redo
          </button>
          <button
            onClick={clearBoard}
            aria-label="clear the board"
            title="clear every mark (undoable)"
            className="microlabel inline-flex items-center justify-center min-h-11 rounded-full border px-4 py-2 transition hover:brightness-110 disabled:opacity-30"
            style={{ borderColor: "var(--line, #2a2333)" }}
          >
            ⌫ clear
          </button>
          {puzzle.whisper && (
            <>
              <button
                onClick={() => {
                  setWhisperMode((wm) => !wm);
                  sfxDoorLatch();
                }}
                aria-pressed={whisperMode}
                className="microlabel inline-flex items-center justify-center min-h-11 rounded-full border px-4 py-2 transition"
                style={{
                  borderColor: whisperMode ? ACCENT : "var(--line, #2a2333)",
                  color: whisperMode ? ACCENT : undefined,
                  background: whisperMode ? `${ACCENT}1a` : undefined,
                }}
              >
                {whisperMode ? "✎ whisper: on" : "✎ whisper"}
              </button>
              {whisperMode && (
                <button
                  onClick={() => setWhisper(emptyBoard(puzzle))}
                  className="microlabel text-smoke hover:text-muted"
                >
                  clear draft
                </button>
              )}
            </>
          )}
        </div>
        <button
          onClick={submit}
          className="rounded-full px-6 py-3 text-sm font-medium text-white transition hover:brightness-110"
          style={{ background: ACCENT }}
        >
          ✦ Stabilise the Séance
        </button>
      </div>

      {hint && (
        <p className="text-center microlabel" style={{ color: ACCENT }}>
          {hint.wrong
            ? `your ${hint.mark === 2 ? "✕" : "◯"} on ${
                puzzle.categories[hint.cat].values[hint.val]
              } in seat ${hint.seat + 1} contradicts the spirits — undo it first`
            : hint.clues.length
              ? "the highlighted clue points to your next move — read it, don't guess"
              : "your marks alone already force a cell — scan the grid"}
        </p>
      )}
      <p className="text-center microlabel text-smoke">
        tap once to snuff (✕) · tap twice to bind (◯) · triple-tap clears the row + column · a
        wrong submission costs +60s
        {puzzle.whisper ? " · whisper mode is a scratchpad" : ""}
      </p>
      </motion.div>
    </FluidStage>
  );
}

function Banished({
  puzzle,
  seconds,
  strikes,
  copied,
  setCopied,
  reduce,
}: {
  puzzle: SeancePuzzle;
  seconds: number;
  strikes: number;
  copied: boolean;
  setCopied: (b: boolean) => void;
  reduce: boolean;
}) {
  const collected = useMemo(() => spiritsBanished(loadGrimoire()).length, []);

  // §3.7 social artifact: solve time + the solved grid, through the §3.0 share
  // seam. One 🟩 tier per binding (cat × seat); a clean solve is an all-green
  // board shaped K rows × N. Time/strikes ride in the headline composed over
  // card.grid/card.url — the Mystery pattern (no `score`, so the OG card shows
  // the grid + date without a misleading numeric).
  const { grid, text } = useMemo(() => {
    const tiers: Tier[] = Array(puzzle.categories.length * puzzle.n).fill("hit");
    const card = buildShare({
      room: "/seance",
      date: puzzle.date,
      tiers,
      columns: puzzle.n,
    } satisfies GameResult);
    return {
      grid: card.grid,
      text: [
        `✦ The Séance — ${puzzle.rite}`,
        `${puzzle.spirit} banished`,
        `⏱ ${fmt(seconds)}  💀 ${strikes}`,
        card.grid,
        card.url,
      ].join("\n"),
    };
  }, [puzzle, seconds, strikes]);

  function copy() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        void navigator.share({ text }).catch(() => {});
      } else {
        void navigator.clipboard?.writeText(text);
      }
    } catch {
      /* clipboard/share unavailable — silently no-op */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 text-center"
    >
      {/* the planchette spells the spirit's name into the veil — one finite
          glide sweep, then it settles (reduced-motion → already still). */}
      <div aria-hidden style={{ opacity: 0.85 }}>
        <Planchette reduce={reduce} spelling size={84} />
      </div>
      <p className="microlabel tracking-widest" style={{ color: ACCENT }}>
        spirit stabilised
      </p>
      <p className="display text-3xl">{puzzle.spirit}</p>
      <p className="font-mono text-5xl tabular-nums" style={{ color: ACCENT }}>
        {fmt(seconds)}
      </p>
      <p className="text-sm text-muted">
        {strikes === 0
          ? "A flawless channelling. The Medium nods."
          : `${strikes} poltergeist strike${strikes > 1 ? "s" : ""} along the way.`}
      </p>

      {/* Spirit Memory — the fact the séance surfaces. A parchment card with
          fixed dark ink (self-contained, AA in both themes: the legibility
          floor overrides the gilt treatment). */}
      <div className={styles.memory}>
        <Ornament variant="flourish" treatment="gold" size={14} />
        <p className={styles.memoryLabel}>Spirit Memory · {puzzle.rite}</p>
        <p className={styles.memoryBody}>{puzzle.backstory}</p>
        <p className={styles.memoryMeta}>the {puzzle.date} séance</p>
      </div>

      <pre className="whitespace-pre-wrap text-2xl leading-snug">{grid}</pre>
      <button
        onClick={copy}
        className="rounded-full px-6 py-3 text-sm font-medium text-white transition hover:brightness-110"
        style={{ background: ACCENT }}
      >
        {copied ? "copied ✓" : "share result"}
      </button>
      <p className="microlabel text-smoke">
        📖 grimoire — {collected} spirit{collected === 1 ? "" : "s"} banished
      </p>
    </motion.div>
  );
}
