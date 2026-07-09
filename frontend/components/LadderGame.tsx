"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type {
  LadderPuzzle,
  Rung,
  SkyscrapersRung,
  FutoshikiRung,
  BinairoRung,
  QueensRung,
} from "@/lib/ladder";
import { visible } from "@/lib/ladder";
import CollapsiblePanel from "./CollapsiblePanel";
import { buildShare, type Tier } from "@/lib/share";
import { sfxDoorLatch, sfxWrong, sfxPianoChord, sfxGlassClink } from "@/lib/sound";
import styles from "./LadderGame.module.css";

const ACCENT = "#c8852a"; // history / the Trickster's climb
const BEST_KEY = "parlor.ladder.best.v1";

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

const KIND_LABEL: Record<Rung["kind"], string> = {
  skyscrapers: "Skyline",
  futoshiki: "The Balance",
  binairo: "Twin Sigils",
  queens: "The Sentinels",
};

// ── Per-kind live conflict detection (which cell keys glow). Feedback only —
// the Lock still checks the grid against the archived unique solution. ──
function key(r: number, c: number) {
  return `${r}-${c}`;
}

function latinConflicts(grid: number[][], n: number): Set<string> {
  const bad = new Set<string>();
  for (let r = 0; r < n; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < n; c++) {
      const v = grid[r][c];
      if (v < 0) continue;
      const arr = seen.get(v) ?? [];
      arr.push(c);
      seen.set(v, arr);
    }
    for (const cols of seen.values())
      if (cols.length > 1) cols.forEach((c) => bad.add(key(r, c)));
  }
  for (let c = 0; c < n; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < n; r++) {
      const v = grid[r][c];
      if (v < 0) continue;
      const arr = seen.get(v) ?? [];
      arr.push(r);
      seen.set(v, arr);
    }
    for (const rows of seen.values())
      if (rows.length > 1) rows.forEach((r) => bad.add(key(r, c)));
  }
  return bad;
}

function skyConflicts(grid: number[][], rung: SkyscrapersRung): Set<string> {
  const { n, top, bottom, left, right } = rung;
  const bad = latinConflicts(grid, n);
  for (let r = 0; r < n; r++) {
    if (grid[r].every((v) => v >= 0)) {
      if (left[r] > 0 && visible(grid[r]) !== left[r]) grid[r].forEach((_, c) => bad.add(key(r, c)));
      if (right[r] > 0 && visible([...grid[r]].reverse()) !== right[r])
        grid[r].forEach((_, c) => bad.add(key(r, c)));
    }
  }
  for (let c = 0; c < n; c++) {
    const col = grid.map((row) => row[c]);
    if (col.every((v) => v >= 0)) {
      if (top[c] > 0 && visible(col) !== top[c]) col.forEach((_, r) => bad.add(key(r, c)));
      if (bottom[c] > 0 && visible([...col].reverse()) !== bottom[c])
        col.forEach((_, r) => bad.add(key(r, c)));
    }
  }
  return bad;
}

function futoConflicts(grid: number[][], rung: FutoshikiRung): Set<string> {
  const { n, gh, gv } = rung;
  const bad = latinConflicts(grid, n);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n - 1; c++) {
      const a = grid[r][c];
      const b = grid[r][c + 1];
      if (a < 0 || b < 0) continue;
      if ((gh[r][c] === 1 && !(a < b)) || (gh[r][c] === -1 && !(a > b))) {
        bad.add(key(r, c));
        bad.add(key(r, c + 1));
      }
    }
  for (let r = 0; r < n - 1; r++)
    for (let c = 0; c < n; c++) {
      const a = grid[r][c];
      const b = grid[r + 1][c];
      if (a < 0 || b < 0) continue;
      if ((gv[r][c] === 1 && !(a < b)) || (gv[r][c] === -1 && !(a > b))) {
        bad.add(key(r, c));
        bad.add(key(r + 1, c));
      }
    }
  return bad;
}

function binConflicts(grid: number[][], n: number): Set<string> {
  const bad = new Set<string>();
  const run = (get: (i: number) => number, mark: (i: number) => void) => {
    for (let i = 2; i < n; i++) {
      const a = get(i - 2), b = get(i - 1), c = get(i);
      if (a >= 0 && a === b && b === c) {
        mark(i - 2);
        mark(i - 1);
        mark(i);
      }
    }
  };
  for (let r = 0; r < n; r++) {
    run((c) => grid[r][c], (c) => bad.add(key(r, c)));
    const zeros = grid[r].filter((v) => v === 0).length;
    const ones = grid[r].filter((v) => v === 1).length;
    if (zeros > n / 2 || ones > n / 2) grid[r].forEach((v, c) => v >= 0 && bad.add(key(r, c)));
  }
  for (let c = 0; c < n; c++) {
    const col = grid.map((row) => row[c]);
    run((r) => col[r], (r) => bad.add(key(r, c)));
    const zeros = col.filter((v) => v === 0).length;
    const ones = col.filter((v) => v === 1).length;
    if (zeros > n / 2 || ones > n / 2) col.forEach((v, r) => v >= 0 && bad.add(key(r, c)));
  }
  return bad;
}

function queenConflicts(grid: number[][], n: number): Set<string> {
  const bad = new Set<string>();
  const queens: [number, number][] = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) if (grid[r][c] === 1) queens.push([r, c]);
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const [r1, c1] = queens[i];
      const [r2, c2] = queens[j];
      if (r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
        bad.add(key(r1, c1));
        bad.add(key(r2, c2));
      }
    }
  }
  for (let r = 0; r < n; r++) {
    if (grid[r].every((v) => v >= 0) && grid[r].filter((v) => v === 1).length !== 1)
      grid[r].forEach((_, c) => bad.add(key(r, c)));
  }
  for (let c = 0; c < n; c++) {
    const col = grid.map((row) => row[c]);
    if (col.every((v) => v >= 0) && col.filter((v) => v === 1).length !== 1)
      col.forEach((_, r) => bad.add(key(r, c)));
  }
  return bad;
}

function conflictsFor(grid: number[][], rung: Rung): Set<string> {
  if (rung.kind === "skyscrapers") return skyConflicts(grid, rung);
  if (rung.kind === "futoshiki") return futoConflicts(grid, rung);
  if (rung.kind === "queens") return queenConflicts(grid, rung.n);
  return binConflicts(grid, rung.n);
}

function solved(grid: number[][], rung: Rung): boolean {
  const { n, solution } = rung;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) if (grid[r][c] !== solution[r][c]) return false;
  return true;
}

export default function LadderGame({
  puzzle,
  requestedDate,
}: {
  puzzle: LadderPuzzle | null;
  requestedDate?: string | null;
}) {
  const reduce = useReducedMotion();

  // Dark state: archive-play of a date that was never generated. Zero-env-var
  // play always gets a puzzle (getLadderPuzzle generates inline).
  if (!puzzle) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-5xl opacity-70" aria-hidden>
          🪜
        </p>
        <p className="text-muted">
          {requestedDate
            ? "No record of that ascent survives in the archive."
            : "The staircase has not yet been raised. Return when the Trickster builds it."}
        </p>
        <p className="microlabel text-smoke">the climb is forged nightly</p>
      </div>
    );
  }

  return <Climb puzzle={puzzle} reduce={!!reduce} />;
}

function Climb({ puzzle, reduce }: { puzzle: LadderPuzzle; reduce: boolean }) {
  const [idx, setIdx] = useState(0);
  const [grid, setGrid] = useState<number[][]>([]);
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [collapses, setCollapses] = useState(0);
  const [clean, setClean] = useState<boolean[]>(() => puzzle.rungs.map(() => true));
  const [shake, setShake] = useState(false);
  const [won, setWon] = useState(false);
  const startedAt = useRef(Date.now());

  const rung = puzzle.rungs[idx];
  const total = elapsed + penalty;

  // init the working grid from givens when the rung changes. Queens' empty cells
  // are a valid final state, so they start at 0 (not -1) — the generic
  // complete/solved logic then treats an unplaced cell as "filled empty".
  useEffect(() => {
    setGrid(
      rung.givens.map((row) => row.map((v) => (rung.kind === "queens" && v < 0 ? 0 : v))),
    );
    setSel(null);
  }, [idx, rung]);

  useEffect(() => {
    if (won) return;
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, [won]);

  const conflicts = useMemo(
    () => (grid.length ? conflictsFor(grid, rung) : new Set<string>()),
    [grid, rung],
  );

  const complete = grid.length > 0 && grid.every((row) => row.every((v) => v >= 0));
  const canLock = complete && conflicts.size === 0;

  const setCell = useCallback(
    (r: number, c: number, v: number) => {
      if (rung.givens[r][c] >= 0) return; // locked given
      setGrid((g) => {
        const next = g.map((row) => [...row]);
        next[r][c] = v;
        return next;
      });
      sfxGlassClink();
    },
    [rung],
  );

  const cycleCell = useCallback(
    (r: number, c: number) => {
      const v = grid[r]?.[c];
      if (v === undefined) return;
      if (rung.kind === "binairo") setCell(r, c, v === -1 ? 0 : v === 0 ? 1 : -1);
      else setCell(r, c, v === 1 ? 0 : 1); // queens: empty(0) ↔ queen(1)
    },
    [grid, rung, setCell],
  );

  // Keyboard entry: arrows move the cursor, digits fill Latin-square rungs,
  // Enter/Space cycles token rungs (binairo/queens), Backspace/Delete/0 erases.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!grid.length) return;
      if (!sel) {
        if (e.key.startsWith("Arrow")) {
          setSel({ r: 0, c: 0 });
          e.preventDefault();
        }
        return;
      }
      const { r, c } = sel;
      if (e.key.startsWith("Arrow")) {
        const dr = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        const dc = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        setSel({
          r: Math.min(rung.n - 1, Math.max(0, r + dr)),
          c: Math.min(rung.n - 1, Math.max(0, c + dc)),
        });
        e.preventDefault();
        return;
      }
      if (rung.givens[r][c] >= 0) return; // locked given
      if (rung.kind === "skyscrapers" || rung.kind === "futoshiki") {
        const num = Number(e.key);
        if (e.key >= "1" && e.key <= "9" && num <= rung.n) {
          setCell(r, c, num);
          e.preventDefault();
        } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
          setCell(r, c, -1);
          e.preventDefault();
        }
      } else if (e.key === "Enter" || e.key === " ") {
        cycleCell(r, c);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, rung, grid, setCell, cycleCell]);

  const collapse = useCallback(() => {
    const nth = collapses + 1;
    setPenalty((p) => p + (nth === 1 ? 90 : 180));
    setCollapses(nth);
    setClean((cl) => cl.map((v, i) => (i === idx ? false : v)));
    sfxWrong();
    if (!reduce) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setGrid(
      rung.givens.map((row) => row.map((v) => (rung.kind === "queens" && v < 0 ? 0 : v))),
    );
    setSel(null);
  }, [collapses, reduce, rung, idx]);

  function lock() {
    if (won || !canLock) return;
    if (!solved(grid, rung)) {
      collapse();
      return;
    }
    sfxDoorLatch();
    if (idx + 1 >= puzzle.rungs.length) {
      setWon(true);
      sfxPianoChord();
      try {
        const prev = Number(localStorage.getItem(BEST_KEY) || 0);
        if (!prev || total < prev) localStorage.setItem(BEST_KEY, String(total));
      } catch {
        /* best-effort */
      }
    } else {
      setIdx((i) => i + 1);
    }
  }

  if (won)
    return <Summit puzzle={puzzle} seconds={total} collapses={collapses} clean={clean} />;

  return (
    <div className="mx-auto max-w-2xl">
      {/* HUD */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="microlabel" style={{ color: ACCENT }}>
          {puzzle.rite}
        </p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg tabular-nums text-ink">⏱ {fmt(total)}</span>
          {collapses > 0 && (
            <span className="microlabel text-[#b22b2b]" title="board collapses (time penalty)">
              💥 ×{collapses}
            </span>
          )}
        </div>
      </div>

      {/* Rung pips */}
      <div
        className="mb-3 flex items-center justify-center gap-2"
        aria-label={`rung ${idx + 1} of ${puzzle.rungs.length}`}
      >
        {puzzle.rungs.map((r, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === idx ? 28 : 14,
              background: i < idx ? ACCENT : i === idx ? `${ACCENT}aa` : "var(--line,#2a2333)",
            }}
          />
        ))}
      </div>

      <motion.div
        animate={shake ? { x: [0, -10, 10, -7, 7, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-line bg-surface/70 p-4 sm:p-5"
      >
        {/* Rung header: type + host + resonance */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="microlabel text-smoke">
            rung {idx + 1} · {KIND_LABEL[rung.kind]} {rung.n}×{rung.n} · {rung.modifier}
          </span>
          <span
            className="microlabel rounded-full border px-3 py-1"
            style={{ borderColor: `${ACCENT}66`, color: ACCENT }}
            title="Global Constraint Memory — carried up the staircase"
          >
            ✦ resonance {rung.resonance}
          </span>
        </div>
        <p className="mb-3 truncate text-xs italic text-muted" title={rung.whisper}>
          “{rung.whisper}”
        </p>

        <div className={styles.boardWrap}>
          {rung.kind === "skyscrapers" && (
            <SkyBoard rung={rung} grid={grid} sel={sel} setSel={setSel} conflicts={conflicts} />
          )}
          {rung.kind === "futoshiki" && (
            <FutoBoard rung={rung} grid={grid} sel={sel} setSel={setSel} conflicts={conflicts} />
          )}
          {rung.kind === "binairo" && (
            <BinBoard
              rung={rung}
              grid={grid}
              sel={sel}
              setSel={setSel}
              conflicts={conflicts}
              cycleCell={cycleCell}
            />
          )}
          {rung.kind === "queens" && (
            <QueensBoard
              rung={rung}
              grid={grid}
              sel={sel}
              setSel={setSel}
              conflicts={conflicts}
              cycleCell={cycleCell}
            />
          )}
        </div>

        {/* Number pad for Latin-value rungs */}
        {(rung.kind === "skyscrapers" || rung.kind === "futoshiki") && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: rung.n }, (_, i) => i + 1).map((v) => (
              <button
                key={v}
                onClick={() => sel && setCell(sel.r, sel.c, v)}
                disabled={!sel}
                className={styles.pad}
                style={{ borderColor: sel ? ACCENT : "var(--line,#2a2333)", color: ACCENT }}
              >
                {v}
              </button>
            ))}
            <button
              onClick={() => sel && setCell(sel.r, sel.c, -1)}
              disabled={!sel}
              className={styles.pad}
              aria-label="erase selected cell"
            >
              ⌫
            </button>
          </div>
        )}

        <button
          onClick={lock}
          disabled={!canLock}
          title="fill the board so every constraint is satisfied, then lock — a wrong lock collapses it (+90s, then +180s)"
          className="mt-5 w-full rounded-full px-6 py-3 text-sm font-medium text-bg transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: ACCENT }}
        >
          {!complete
            ? "⟁ Fill every cell to lock"
            : conflicts.size > 0
              ? "⟁ Resolve every conflict to lock"
              : "⟁ Lock this rung"}
        </button>

        <div className="mt-4">
          <CollapsiblePanel
            side="right"
            title={`how to read ${KIND_LABEL[rung.kind]}`}
            accent={ACCENT}
            defaultOpen={false}
            storageKey="parlor.ladder.help"
          >
            <RungHelp kind={rung.kind} />
          </CollapsiblePanel>
        </div>
      </motion.div>
    </div>
  );
}

function RungHelp({ kind }: { kind: Rung["kind"] }) {
  if (kind === "skyscrapers")
    return (
      <ul className="space-y-1 text-sm text-muted">
        <li>Fill every row and column with 1…n, each digit once (a Latin square).</li>
        <li>
          A digit is a tower of that height. An edge clue counts how many towers are visible from
          that side — taller towers hide shorter ones behind them.
        </li>
        <li>Tap a cell, then a number below (or type a digit). Conflicting cells glow.</li>
      </ul>
    );
  if (kind === "futoshiki")
    return (
      <ul className="space-y-1 text-sm text-muted">
        <li>Fill every row and column with 1…n, each digit once.</li>
        <li>
          The signs between cells are inequalities — the arrow points at the smaller value. Every
          marked relation must hold.
        </li>
        <li>Tap a cell, then a number below (or type a digit). Broken relations glow.</li>
      </ul>
    );
  if (kind === "queens")
    return (
      <ul className="space-y-1 text-sm text-muted">
        <li>Place exactly one ♛ in every row and every column.</li>
        <li>No two ♛ may share a diagonal (row/column sharing is also forbidden).</li>
        <li>Tap a cell to place/remove a ♛ (or select with arrows, Enter to toggle).</li>
      </ul>
    );
  return (
    <ul className="space-y-1 text-sm text-muted">
      <li>Fill every cell with ○ or ● — tap a cell to cycle blank → ○ → ● → blank.</li>
      <li>Each row and column holds equal ○ and ●, and never three of the same in a row.</li>
      <li>No two rows are identical, and no two columns are identical.</li>
    </ul>
  );
}

// ── Skyscrapers: an (n+2)² grid with edge clues framing the play area. ──
function SkyBoard({
  rung,
  grid,
  sel,
  setSel,
  conflicts,
}: {
  rung: SkyscrapersRung;
  grid: number[][];
  sel: { r: number; c: number } | null;
  setSel: (s: { r: number; c: number } | null) => void;
  conflicts: Set<string>;
}) {
  const { n, top, bottom, left, right, givens } = rung;
  if (!grid.length) return null;
  const cells: React.ReactNode[] = [];
  for (let R = 0; R < n + 2; R++) {
    for (let C = 0; C < n + 2; C++) {
      const edge = R === 0 || R === n + 1 || C === 0 || C === n + 1;
      if (edge) {
        let clue = 0;
        if (C > 0 && C < n + 1) {
          if (R === 0) clue = top[C - 1];
          else if (R === n + 1) clue = bottom[C - 1];
        }
        if (R > 0 && R < n + 1) {
          if (C === 0) clue = left[R - 1];
          else if (C === n + 1) clue = right[R - 1];
        }
        cells.push(
          <div key={`e${R}-${C}`} className={styles.clue}>
            {clue > 0 ? clue : ""}
          </div>,
        );
        continue;
      }
      const r = R - 1;
      const c = C - 1;
      const v = grid[r][c];
      const given = givens[r][c] >= 0;
      const bad = conflicts.has(key(r, c));
      const selected = sel?.r === r && sel?.c === c;
      cells.push(
        <button
          key={`${r}-${c}`}
          onClick={() => !given && setSel(selected ? null : { r, c })}
          disabled={given}
          aria-label={`row ${r + 1}, column ${c + 1}${v >= 0 ? `, ${v}` : ", empty"}${given ? ", locked" : ""}`}
          className={`${styles.cell} ${given ? styles.given : ""} ${bad ? styles.conflict : ""} ${selected ? styles.sel : ""}`}
        >
          {v >= 0 ? v : ""}
        </button>,
      );
    }
  }
  return (
    <div
      className={styles.frame}
      style={{ gridTemplateColumns: `repeat(${n + 2}, minmax(0, 1fr))` }}
      role="grid"
      aria-label="skyscrapers grid"
    >
      {cells}
    </div>
  );
}

// ── Futoshiki: a (2n-1)² grid — value cells on even indices, inequality signs
// woven between them. ──
function FutoBoard({
  rung,
  grid,
  sel,
  setSel,
  conflicts,
}: {
  rung: FutoshikiRung;
  grid: number[][];
  sel: { r: number; c: number } | null;
  setSel: (s: { r: number; c: number } | null) => void;
  conflicts: Set<string>;
}) {
  const { n, gh, gv, givens } = rung;
  if (!grid.length) return null;
  const span = 2 * n - 1;
  const cells: React.ReactNode[] = [];
  for (let R = 0; R < span; R++) {
    for (let C = 0; C < span; C++) {
      const cellRow = R % 2 === 0;
      const cellCol = C % 2 === 0;
      if (cellRow && cellCol) {
        const r = R / 2;
        const c = C / 2;
        const v = grid[r][c];
        const given = givens[r][c] >= 0;
        const bad = conflicts.has(key(r, c));
        const selected = sel?.r === r && sel?.c === c;
        cells.push(
          <button
            key={`${r}-${c}`}
            onClick={() => !given && setSel(selected ? null : { r, c })}
            disabled={given}
            aria-label={`row ${r + 1}, column ${c + 1}${v >= 0 ? `, ${v}` : ", empty"}${given ? ", locked" : ""}`}
            className={`${styles.cell} ${given ? styles.given : ""} ${bad ? styles.conflict : ""} ${selected ? styles.sel : ""}`}
          >
            {v >= 0 ? v : ""}
          </button>,
        );
      } else if (cellRow && !cellCol) {
        const r = R / 2;
        const c = (C - 1) / 2;
        const rel = gh[r][c];
        cells.push(
          <div key={`h${R}-${C}`} className={styles.signH}>
            {rel === 1 ? "‹" : rel === -1 ? "›" : ""}
          </div>,
        );
      } else if (!cellRow && cellCol) {
        const r = (R - 1) / 2;
        const c = C / 2;
        const rel = gv[r][c];
        cells.push(
          <div key={`v${R}-${C}`} className={styles.signV}>
            {rel === 1 ? "ᐱ" : rel === -1 ? "ᐯ" : ""}
          </div>,
        );
      } else {
        cells.push(<div key={`x${R}-${C}`} className={styles.gap} />);
      }
    }
  }
  return (
    <div
      className={styles.futo}
      style={{
        gridTemplateColumns: Array.from({ length: span }, (_, i) =>
          i % 2 === 0 ? "1fr" : "0.5fr",
        ).join(" "),
      }}
      role="grid"
      aria-label="futoshiki grid"
    >
      {cells}
    </div>
  );
}

// ── Binairo: tap-cycle two-token grid (tap = advance, keyboard-selectable). ──
function BinBoard({
  rung,
  grid,
  sel,
  setSel,
  conflicts,
  cycleCell,
}: {
  rung: BinairoRung;
  grid: number[][];
  sel: { r: number; c: number } | null;
  setSel: (s: { r: number; c: number } | null) => void;
  conflicts: Set<string>;
  cycleCell: (r: number, c: number) => void;
}) {
  const { n, givens } = rung;
  if (!grid.length) return null;
  return (
    <div
      className={styles.frame}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      role="grid"
      aria-label="binairo grid"
    >
      {Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
          const v = grid[r][c];
          const given = givens[r][c] >= 0;
          const bad = conflicts.has(key(r, c));
          const selected = sel?.r === r && sel?.c === c;
          return (
            <button
              key={`${r}-${c}`}
              onClick={() => {
                if (given) return;
                setSel({ r, c });
                cycleCell(r, c);
              }}
              disabled={given}
              aria-label={`row ${r + 1}, column ${c + 1}, ${v === 1 ? "filled" : v === 0 ? "hollow" : "empty"}${given ? ", locked" : ""}`}
              className={`${styles.cell} ${styles.bin} ${given ? styles.given : ""} ${bad ? styles.conflict : ""} ${selected ? styles.sel : ""}`}
              style={{ color: v === 1 ? ACCENT : "#cbb892" }}
            >
              {v === 1 ? "●" : v === 0 ? "○" : ""}
            </button>
          );
        }),
      )}
    </div>
  );
}

// ── Queens: tap a cell to place/remove a sentinel (♛). One per row & column,
// none sharing a diagonal. Two-state toggle, keyboard-selectable. ──
function QueensBoard({
  rung,
  grid,
  sel,
  setSel,
  conflicts,
  cycleCell,
}: {
  rung: QueensRung;
  grid: number[][];
  sel: { r: number; c: number } | null;
  setSel: (s: { r: number; c: number } | null) => void;
  conflicts: Set<string>;
  cycleCell: (r: number, c: number) => void;
}) {
  const { n, givens } = rung;
  if (!grid.length) return null;
  return (
    <div
      className={styles.frame}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      role="grid"
      aria-label="queens grid"
    >
      {Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
          const v = grid[r][c];
          const given = givens[r][c] >= 0;
          const bad = conflicts.has(key(r, c));
          const selected = sel?.r === r && sel?.c === c;
          return (
            <button
              key={`${r}-${c}`}
              onClick={() => {
                if (given) return;
                setSel({ r, c });
                cycleCell(r, c);
              }}
              disabled={given}
              aria-label={`row ${r + 1}, column ${c + 1}, ${v === 1 ? "queen" : "empty"}${given ? ", locked" : ""}`}
              className={`${styles.cell} ${styles.bin} ${given ? styles.given : ""} ${bad ? styles.conflict : ""} ${selected ? styles.sel : ""}`}
              style={{ color: ACCENT }}
            >
              {v === 1 ? "♛" : ""}
            </button>
          );
        }),
      )}
    </div>
  );
}

function Summit({
  puzzle,
  seconds,
  collapses,
  clean,
}: {
  puzzle: LadderPuzzle;
  seconds: number;
  collapses: number;
  clean: boolean[];
}) {
  const [copied, setCopied] = useState(false);
  const perfect = collapses === 0;
  const best = useMemo(() => {
    try {
      return Number(localStorage.getItem(BEST_KEY) || 0);
    } catch {
      return 0;
    }
  }, []);

  const card = useMemo(() => {
    const tiers: Tier[] = clean.map((c) => (c ? "hit" : "near") as Tier);
    return buildShare({
      room: "/ladder",
      date: puzzle.date,
      tiers,
      score: clean.filter(Boolean).length,
      maxScore: clean.length,
      columns: clean.length,
    });
  }, [clean, puzzle.date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 text-center"
    >
      <p className="microlabel tracking-widest" style={{ color: ACCENT }}>
        the summit
      </p>
      <p className="font-mono text-5xl tabular-nums" style={{ color: ACCENT }}>
        {fmt(seconds)}
      </p>
      {perfect ? (
        <p className="display text-2xl" style={{ color: ACCENT }}>
          ✦ Perfect Ascent
        </p>
      ) : (
        <p className="text-sm text-muted">
          {collapses} collapse{collapses > 1 ? "s" : ""} on the way up.
        </p>
      )}
      <p className="text-2xl tracking-[0.2em]">{card.grid}</p>
      <div className="w-full rounded-xl border border-line bg-surface/60 p-3 text-left">
        <p className="microlabel mb-1 text-smoke">the ascent</p>
        <ul className="space-y-0.5 text-sm text-muted">
          {puzzle.rungs.map((r, i) => (
            <li key={i}>
              {clean[i] ? "🟩" : "🟨"} {KIND_LABEL[r.kind]} · {r.n}×{r.n}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() =>
          navigator.clipboard?.writeText(card.text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
        }
        className="rounded-full px-6 py-3 text-sm font-medium text-bg transition hover:brightness-110"
        style={{ background: ACCENT }}
      >
        {copied ? "copied ✓" : "share ascent"}
      </button>
      {best > 0 && <p className="microlabel text-smoke">best ascent · {fmt(best)}</p>}
    </motion.div>
  );
}
