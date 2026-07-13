"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { IgnitePuzzle, IgniteClue } from "@/lib/ignitePuzzle";
import { mulberry32, shuffled } from "@/lib/rng";
import CollapsiblePanel from "@/components/CollapsiblePanel";
import { AmbientGlow, ParticleField } from "@/components/atmosphere";
import { audio } from "@/lib/sound";
import { applySkin } from "@/lib/theme";
import styles from "./StreakGame.module.css";

// IGNITE — the Witch's rune cipher (v4 "Ignite" engine). The deterministic,
// single-solution GAME LOGIC lives untouched in lib/ignitePuzzle (a bijection
// glyph→letter that a minimal clue set determines uniquely). This engine layer
// owns render + interaction + scoring/flow, driven by the USER's design-intake
// answers (docs/planning/design-intake/streak.md):
//   • Read is ALWAYS tappable; a wrong Read flags the runes it can prove wrong.
//   • Misreads cost a candle — run the wick out and the ritual fails (soft loss).
//   • "Reveal one rune" mercy after N misreads; "give up" reveals + voids streak.
//   • Cross-day flame streak (localStorage), one puzzle per day, hard-locked.
//   • Shuffled tray so alphabet order isn't a free clue.
//   • Spoiler-safe share with a candle/flame bar.
// DEGRADE FLOOR (template floor — INDEX §Floors): the board renders on a Phaser
// canvas ONLY when WebGL is available AND motion is allowed; otherwise (no-WebGL,
// Phaser throws, or prefers-reduced-motion) it falls back to an accessible DOM
// board — rune buttons + tray + Read, fully playable, never a white screen.

const CANDLES_START = 5; // wrong Reads you may survive before the ritual fails
const MERCY_AFTER = 3; // misreads before the "reveal one rune" mercy appears

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

  return <RuneBoard puzzle={puzzle} reduce={reduce} isLive={!requestedDate} />;
}

// ── Cross-day flame streak (localStorage; live daily only, never on archive). ──
const STREAK_KEY = "parlor:ignite:streak";
const solvedKey = (date: string) => `parlor:ignite:solved:${date}`;

function prevDay(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — streak is best-effort, never blocks play */
  }
}

interface StreakRecord {
  count: number;
  last: string; // last solved date
}
interface SolvedRecord {
  misreads: number;
  hints: number;
  gaveUp: boolean;
}

function RuneBoard({
  puzzle,
  reduce,
  isLive,
}: {
  puzzle: IgnitePuzzle;
  reduce: boolean;
  isLive: boolean;
}) {
  const K = puzzle.letters.length;
  const [assign, setAssign] = useState<(number | null)[]>(() =>
    new Array(K).fill(null),
  );
  const [selected, setSelected] = useState<number>(0); // selected glyph index
  const [activeClue, setActiveClue] = useState<number | null>(null);
  const [misreads, setMisreads] = useState(0); // wrong "read" attempts
  const [hints, setHints] = useState(0); // mercy reveals used (dims flawless)
  const [candles, setCandles] = useState(CANDLES_START);
  const [shake, setShake] = useState(0); // increments to trigger a canvas shake
  const [wrongGlyphs, setWrongGlyphs] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set()); // locked-correct
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false); // candles spent — soft loss
  const [gaveUp, setGaveUp] = useState(false);
  const [streak, setStreak] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState<string | null>(null); // clipboard fallback

  const over = won || lost || gaveUp;
  const filled = assign.filter((a) => a !== null).length;

  // Shuffled letter tray (design: alphabet order isn't a free clue). Deterministic
  // off the puzzle seed — no Math.random, SSR/client-consistent.
  const trayOrder = useMemo(
    () =>
      shuffled(
        puzzle.letters.map((_, i) => i),
        mulberry32((puzzle.seed ^ 0x7a11) >>> 0),
      ),
    [puzzle],
  );

  // ── Living-flame audio bed while mounted; place tick on bind; stinger on win. ──
  useEffect(() => {
    audio.startAmbient("streak");
    return () => audio.stopAmbient();
  }, []);
  useEffect(() => {
    if (won) audio.stinger();
  }, [won]);

  // Load streak + one-puzzle-per-day lock on mount (client-only → no hydration
  // mismatch; initial render is the fresh unsolved board, effect restores state).
  useEffect(() => {
    if (!isLive) return;
    const rec = readJSON<StreakRecord>(STREAK_KEY);
    const solved = readJSON<SolvedRecord>(solvedKey(puzzle.date));
    if (solved) {
      // Already played today — hard-lock to the resolved state.
      setAssign(puzzle.solution.slice());
      setMisreads(solved.misreads);
      setHints(solved.hints);
      if (solved.gaveUp) setGaveUp(true);
      else setWon(true);
    }
    setStreak(rec?.count ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, puzzle.date]);

  // glyph indices lit by the active clue (ring highlight on the board)
  const litGlyphs = useMemo(() => {
    const s = new Set<number>();
    if (activeClue != null) for (const g of puzzle.clues[activeClue].glyphs) s.add(g);
    return s;
  }, [activeClue, puzzle.clues]);

  const clearWrong = useCallback(() => {
    setWrongGlyphs((prev) => (prev.size ? new Set() : prev));
  }, []);

  // Tap a rune: clear it if it already holds a letter (unless locked), else select.
  const tapGlyph = useCallback(
    (g: number) => {
      if (over || revealed.has(g)) return;
      if (assign[g] != null) {
        setAssign((prev) => {
          const next = [...prev];
          next[g] = null;
          return next;
        });
      }
      setSelected(g);
      clearWrong();
    },
    [over, revealed, assign, clearWrong],
  );

  // Tap a letter: drop it on the selected rune, then advance to the next empty.
  // Duplicates are ALLOWED (design C) and only flagged at Read time.
  const tapLetter = useCallback(
    (l: number) => {
      if (over || revealed.has(selected)) return;
      const already = assign[selected] === l;
      setAssign((prev) => {
        const next = [...prev];
        next[selected] = already ? null : l; // tap the same letter twice to clear
        return next;
      });
      clearWrong();
      if (!already) {
        audio.sfx("place");
        const nextEmpty = assign.findIndex(
          (a, i) => a === null && i !== selected && !revealed.has(i),
        );
        if (nextEmpty !== -1) setSelected(nextEmpty);
      }
    },
    [over, revealed, selected, assign, clearWrong],
  );

  const persistSolve = useCallback(
    (rec: SolvedRecord) => {
      if (isLive) writeJSON(solvedKey(puzzle.date), rec);
    },
    [isLive, puzzle.date],
  );

  const bumpStreak = useCallback(() => {
    if (!isLive) return;
    const prev = readJSON<StreakRecord>(STREAK_KEY);
    let count: number;
    if (prev?.last === puzzle.date) count = prev.count; // already counted today
    else if (prev && prev.last === prevDay(puzzle.date)) count = prev.count + 1;
    else count = 1;
    writeJSON(STREAK_KEY, { count, last: puzzle.date });
    setStreak(count);
  }, [isLive, puzzle.date]);

  const voidStreak = useCallback(() => {
    if (!isLive) return;
    writeJSON(STREAK_KEY, { count: 0, last: puzzle.date });
    setStreak(0);
  }, [isLive, puzzle.date]);

  // Read the runes — ALWAYS tappable (design B). A correct, full bijection wins;
  // otherwise flag every rune we can prove wrong (mismatch OR duplicate letter),
  // spend a candle, and fail the ritual once the last wick gutters out.
  const readTheRunes = useCallback(() => {
    if (over) return;
    const wrong = new Set<number>();
    const seen = new Map<number, number>(); // letter idx → first glyph holding it
    for (let g = 0; g < K; g++) {
      const a = assign[g];
      if (a == null) continue;
      if (a !== puzzle.solution[g]) wrong.add(g);
      if (seen.has(a)) {
        wrong.add(g);
        wrong.add(seen.get(a)!);
      } else seen.set(a, g);
    }
    if (filled === K && wrong.size === 0) {
      setWon(true);
      setWrongGlyphs(new Set());
      audio.sfx("correct");
      bumpStreak();
      persistSolve({ misreads, hints, gaveUp: false });
      return;
    }
    // Wrong read — the runes resist.
    audio.sfx("wrong");
    setWrongGlyphs(wrong);
    setMisreads((n) => n + 1);
    setShake((n) => n + 1);
    setCandles((c) => {
      const n = Math.max(0, c - 1);
      if (n === 0) {
        setLost(true);
        voidStreak();
        persistSolve({ misreads: misreads + 1, hints, gaveUp: true });
      }
      return n;
    });
  }, [
    over,
    K,
    assign,
    filled,
    puzzle.solution,
    misreads,
    hints,
    bumpStreak,
    persistSolve,
    voidStreak,
  ]);

  // Mercy: reveal one correct rune (locks it). Counts as a hint → dims flawless.
  const revealOne = useCallback(() => {
    if (over) return;
    // Prefer a rune that's currently wrong/empty; else the first still-unlocked.
    let target = -1;
    for (let g = 0; g < K; g++) {
      if (revealed.has(g)) continue;
      if (assign[g] !== puzzle.solution[g]) {
        target = g;
        break;
      }
    }
    if (target === -1)
      for (let g = 0; g < K; g++)
        if (!revealed.has(g)) {
          target = g;
          break;
        }
    if (target === -1) return;
    const g = target;
    setAssign((prev) => {
      const next = [...prev];
      next[g] = puzzle.solution[g];
      return next;
    });
    setRevealed((prev) => new Set(prev).add(g));
    setHints((n) => n + 1);
    setWrongGlyphs((prev) => {
      if (!prev.has(g)) return prev;
      const next = new Set(prev);
      next.delete(g);
      return next;
    });
    audio.sfx("place");
    const nextEmpty = assign.findIndex(
      (a, i) => a === null && i !== g && !revealed.has(i),
    );
    if (nextEmpty !== -1) setSelected(nextEmpty);
  }, [over, K, revealed, assign, puzzle.solution]);

  // Give up — reveal the full solution and void the streak.
  const giveUp = useCallback(() => {
    if (over) return;
    setAssign(puzzle.solution.slice());
    setWrongGlyphs(new Set());
    setGaveUp(true);
    voidStreak();
    persistSolve({ misreads, hints, gaveUp: true });
  }, [over, puzzle.solution, voidStreak, persistSolve, misreads, hints]);

  function reset() {
    setAssign(new Array(K).fill(null));
    setSelected(0);
    setWon(false);
    setLost(false);
    setGaveUp(false);
    setActiveClue(null);
    setMisreads(0);
    setHints(0);
    setCandles(CANDLES_START);
    setWrongGlyphs(new Set());
    setRevealed(new Set());
  }

  // ── Spoiler-safe share: rune row + candle/flame bar, never the plaintext. ──
  function buildShare(): string {
    const runes = puzzle.glyphs.map((g) => g.rune).join("");
    const spent = CANDLES_START - candles;
    const bar =
      "🔥".repeat(Math.max(0, candles)) + "🕯️".repeat(Math.min(CANDLES_START, spent));
    const verdict = lost
      ? "the wick guttered out"
      : gaveUp
        ? "revealed"
        : misreads === 0 && hints === 0
          ? "flawless"
          : `${misreads} misread${misreads === 1 ? "" : "s"}`;
    return `IGNITE ${puzzle.date}\n${runes}\n${bar}\n${puzzle.runeSet} · ${verdict} 🔥\nparlor`;
  }

  async function share() {
    const text = buildShare();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setShareText(null);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — surface a selectable box + toast (design B/C).
      setShareText(text);
    }
  }

  const canMercy = !over && misreads >= MERCY_AFTER && revealed.size < K;

  return (
    <div className="relative" {...applySkin("streak")}>
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="display text-4xl sm:text-5xl">Ignite</h1>
          {/* Rune set rotates SILENTLY by date (design-intake A) — not named
              pre-solve; its identity is revealed only in the win/share lore. */}
          <p className="microlabel mt-1 text-history">
            the Witch&apos;s cipher
          </p>
        </div>
        <div className="flex items-center gap-5 text-right">
          <div>
            <div className="microlabel">runes lit</div>
            <div className="tabular text-3xl font-black text-[#e0871f]">
              {won || gaveUp ? K : filled}/{K}
            </div>
          </div>
          <div>
            <div className="microlabel">candles</div>
            <div className="text-2xl leading-none" aria-hidden>
              {"🔥".repeat(candles) || "💨"}
            </div>
            <span className="sr-only">{candles} candles remaining</span>
          </div>
          {streak > 0 && (
            <div title="daily flame streak">
              <div className="microlabel">streak</div>
              <div className="tabular text-2xl font-black text-[#f5c542]">
                {streak}🔥
              </div>
            </div>
          )}
        </div>
      </header>

      {/* The interactive board. Phaser canvas when WebGL + motion allow; otherwise
          the accessible DOM board (no-WebGL / Phaser-throw / reduced-motion). React
          is the single source of truth either way. */}
      <BoardRegion
        puzzle={puzzle}
        assign={assign}
        selected={selected}
        litGlyphs={litGlyphs}
        wrongGlyphs={wrongGlyphs}
        revealed={revealed}
        trayOrder={trayOrder}
        won={won}
        over={over}
        reduce={reduce}
        shake={shake}
        filled={filled}
        onGlyph={tapGlyph}
        onLetter={tapLetter}
        onRead={readTheRunes}
      />

      {over ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mx-auto mt-6 max-w-md rounded-2xl border p-6 text-center ${
            won ? "border-[#e0871f]/50 bg-surface" : "border-line bg-surface"
          }`}
        >
          {won ? (
            <>
              <p className="display text-3xl text-[#e0871f]">The inscription blazes</p>
              <p
                className={`mt-2 text-2xl font-black tracking-[0.3em] text-ink ${styles.blaze}`}
              >
                {puzzle.incantation}
              </p>
              <p className="mt-2 text-muted">
                {misreads === 0 && hints === 0
                  ? "Read flawlessly — the Order is impressed."
                  : `${misreads} misread${misreads === 1 ? "" : "s"}${
                      hints ? `, ${hints} rune${hints === 1 ? "" : "s"} revealed` : ""
                    } before the wick caught.`}
              </p>
              {streak > 0 && (
                <p className="microlabel mt-2 text-[#f5c542]">
                  🔥 {streak}-day flame streak
                </p>
              )}
            </>
          ) : (
            <>
              <p className="display text-3xl text-muted">
                {lost ? "The wick gutters out" : "The runes are revealed"}
              </p>
              <p className="mt-2 text-2xl font-black tracking-[0.3em] text-ink">
                {puzzle.incantation}
              </p>
              <p className="mt-2 text-muted">
                {lost
                  ? "The candles are spent — the ritual sleeps until tomorrow."
                  : "The inscription stands revealed; the streak is broken."}
              </p>
            </>
          )}

          {/* The day's card → future Compendium (design: educational card per solve). */}
          <p className="microlabel mt-4 border-t border-line pt-4 text-smoke">
            {puzzle.runeSet} · {puzzle.incantation} — {K} runes bound in a bijection
            no other reading satisfies.
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
          {shareText && (
            <div className="mt-3">
              <p className="microlabel mb-1 text-music">
                copy failed — select and copy below
              </p>
              <textarea
                readOnly
                value={shareText}
                onFocus={(e) => e.currentTarget.select()}
                className="h-28 w-full resize-none rounded-lg border border-line bg-bg p-2 text-xs text-muted"
              />
            </div>
          )}
        </motion.div>
      ) : (
        <div className="mt-4">
          {misreads > 0 && (
            <p className="microlabel mb-3 text-center text-music">
              the runes resist — {misreads} misread{misreads === 1 ? "" : "s"} ·{" "}
              {candles} candle{candles === 1 ? "" : "s"} left
            </p>
          )}
          <div className="mb-3 flex flex-wrap justify-center gap-3">
            {canMercy && (
              <button
                onClick={revealOne}
                className="microlabel rounded-full border border-[#f5c542] px-5 py-2 text-[#f5c542] transition hover:bg-[#f5c542] hover:text-bg"
              >
                reveal one rune (dims flawless)
              </button>
            )}
            <button
              onClick={giveUp}
              className="microlabel rounded-full border border-line px-5 py-2 text-smoke transition hover:border-music hover:text-music"
            >
              give up · reveal (voids streak)
            </button>
          </div>
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

// ── Board region: choose Phaser (rich) vs DOM (accessible) at runtime ─────────
// Progressive-enhancement decision. The DOM board is the guaranteed floor; Phaser
// upgrades it only when WebGL is present, motion is allowed, and creation doesn't
// throw. Any failure flips back to DOM — the acceptance "no white-screen" floor.
function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

interface BoardProps {
  puzzle: IgnitePuzzle;
  assign: (number | null)[];
  selected: number;
  litGlyphs: Set<number>;
  wrongGlyphs: Set<number>;
  revealed: Set<number>;
  trayOrder: number[];
  won: boolean;
  over: boolean;
  reduce: boolean;
  shake: number;
  filled: number;
  onGlyph: (g: number) => void;
  onLetter: (l: number) => void;
  onRead: () => void;
}

function BoardRegion(props: BoardProps) {
  const { reduce } = props;
  // Start on the DOM board (safe on SSR + first paint + JS-hostile envs). An effect
  // upgrades to Phaser when it's both possible and wanted.
  const [useDom, setUseDom] = useState(true);

  useEffect(() => {
    if (reduce) {
      setUseDom(true);
      return;
    }
    setUseDom(!webglAvailable());
  }, [reduce]);

  const onFail = useCallback(() => setUseDom(true), []);

  if (useDom) return <DomBoard {...props} />;
  return (
    <div className="relative mt-4">
      <RunePhaserBoard {...props} onFail={onFail} />
      <FlameAtmosphere
        progress={props.won ? 1 : props.filled / props.puzzle.letters.length}
        won={props.won}
      />
    </div>
  );
}

// ── Accessible DOM board (the degrade floor + reduced-motion path) ────────────
// Same interaction model as the Phaser scene, in real focusable buttons so AT and
// keyboards get first-class play with zero WebGL.
function DomBoard(props: BoardProps) {
  const {
    puzzle,
    assign,
    selected,
    litGlyphs,
    wrongGlyphs,
    revealed,
    trayOrder,
    won,
    over,
    filled,
    onGlyph,
    onLetter,
    onRead,
  } = props;
  const K = puzzle.letters.length;

  return (
    <section
      className={`${styles.domBoard} mt-4`}
      aria-label="Rune cipher board — bind each rune to a letter, then read the runes"
    >
      {/* Inscription: the incantation spelled in runes with the current guess. */}
      <div className="flex flex-wrap justify-center gap-1 px-1 py-3" aria-hidden>
        {puzzle.cipher.map((g, i) => {
          const l = assign[g];
          return (
            <span key={i} className="flex flex-col items-center">
              <span className="text-2xl text-[#d8b25a] sm:text-3xl">
                {puzzle.glyphs[g].rune}
              </span>
              <span
                className={`text-sm font-bold ${
                  won ? "text-[#e0871f]" : l != null ? "text-ink" : "text-smoke"
                }`}
              >
                {l != null ? puzzle.letters[l] : "·"}
              </span>
            </span>
          );
        })}
      </div>

      {/* Rune key grid — tap to select, tap again to clear. */}
      <ul
        className="grid gap-2 px-1"
        style={{
          gridTemplateColumns: `repeat(${
            K <= 4 ? K : K <= 6 ? 3 : 4
          }, minmax(0,1fr))`,
        }}
      >
        {puzzle.glyphs.map((glyph, g) => {
          const l = assign[g];
          const isSel = selected === g && !over;
          const isWrong = wrongGlyphs.has(g);
          const isLocked = revealed.has(g);
          const isLit = litGlyphs.has(g);
          return (
            <li key={g}>
              <button
                type="button"
                disabled={over || isLocked}
                onClick={() => onGlyph(g)}
                aria-pressed={isSel}
                aria-label={`Rune ${glyph.name}${
                  l != null ? `, bound to ${puzzle.letters[l]}` : ", unbound"
                }${isWrong ? ", flagged wrong" : ""}${isLocked ? ", revealed" : ""}`}
                className={`flex min-h-[64px] w-full flex-col items-center justify-center rounded-lg border-2 p-2 transition ${
                  isWrong
                    ? "border-music bg-music/10"
                    : isSel
                      ? "border-[#e0871f] bg-[#e0871f]/10"
                      : isLocked
                        ? "border-[#f5c542] bg-[#f5c542]/10"
                        : isLit
                          ? "border-[#f5c542]"
                          : "border-line hover:border-[#e0871f]/60"
                }`}
              >
                <span className="text-2xl leading-none text-[#d8b25a]">
                  {glyph.rune}
                </span>
                <span className="microlabel mt-1 text-smoke">{glyph.name}</span>
                {l != null && (
                  <span className="mt-0.5 text-sm font-black text-[#e0871f]">
                    {puzzle.letters[l]}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Letter tray — shuffled order; tap to bind to the selected rune. */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 px-1">
        {trayOrder.map((l) => {
          const placed = assign.includes(l);
          return (
            <button
              key={l}
              type="button"
              disabled={over}
              onClick={() => onLetter(l)}
              aria-label={`Letter ${puzzle.letters[l]}${placed ? ", placed" : ""}`}
              className={`h-11 w-11 rounded-lg border-2 text-lg font-black transition ${
                placed
                  ? "border-[#e0871f] bg-[#e0871f]/10 text-[#e0871f]"
                  : "border-line text-ink hover:border-[#e0871f]/60"
              }`}
            >
              {puzzle.letters[l]}
            </button>
          );
        })}
      </div>

      {/* Read the runes — always tappable (design B). */}
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          disabled={over || filled === 0}
          onClick={onRead}
          className="microlabel rounded-full bg-[#e0871f] px-8 py-3 font-bold text-[#1b1712] transition enabled:hover:brightness-110 disabled:opacity-40"
        >
          read the runes
        </button>
      </div>
    </section>
  );
}

// ── Phaser presentation layer ───────────────────────────────────────────────
// View-model the scene reads on every draw. Kept in a ref so the (once-created)
// scene always sees fresh state + callbacks without being torn down.
interface BoardVM {
  puzzle: IgnitePuzzle;
  assign: (number | null)[];
  selected: number;
  litGlyphs: Set<number>;
  wrongGlyphs: Set<number>;
  revealed: Set<number>;
  trayOrder: number[];
  won: boolean;
  over: boolean;
  K: number;
  onGlyph: (g: number) => void;
  onLetter: (l: number) => void;
  onRead: () => void;
}

function RunePhaserBoard(props: BoardProps & { onFail: () => void }) {
  const { puzzle, reduce, shake, onFail } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const vmRef = useRef<BoardVM | null>(null);

  // Set the view-model during render so the effect below redraws with fresh state.
  vmRef.current = {
    puzzle,
    assign: props.assign,
    selected: props.selected,
    litGlyphs: props.litGlyphs,
    wrongGlyphs: props.wrongGlyphs,
    revealed: props.revealed,
    trayOrder: props.trayOrder,
    won: props.won,
    over: props.over,
    K: puzzle.letters.length,
    onGlyph: props.onGlyph,
    onLetter: props.onLetter,
    onRead: props.onRead,
  };

  // Build the Phaser game once. Dynamic import keeps Phaser off the server bundle.
  // ANY failure (import reject, GL init throw, context loss) → onFail → DOM board.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let game: any = null;
    let destroyed = false;

    import("phaser")
      .then((mod) => {
        const Phaser: any = (mod as any).default ?? mod;
        if (destroyed || !containerRef.current) return;

        class RuneScene extends Phaser.Scene {
          create() {
            sceneRef.current = this;
            drawBoard(this, vmRef.current);
            this.scale.on("resize", () => drawBoard(this, vmRef.current));
          }
        }

        try {
          game = new Phaser.Game({
            type: Phaser.AUTO, // WebGL, else Canvas2D (design C 2D fallback)
            parent: container,
            transparent: true,
            scale: {
              mode: Phaser.Scale.RESIZE,
              parent: container,
              width: container.clientWidth || 320,
              height: container.clientHeight || 480,
            },
            callbacks: {
              postBoot: (g: any) => {
                // No usable renderer despite AUTO → degrade to the DOM board.
                if (!g.renderer) onFail();
                g.canvas?.addEventListener?.("webglcontextlost", onFail, {
                  once: true,
                });
              },
            },
            scene: RuneScene,
          });
        } catch {
          onFail();
        }
      })
      .catch(onFail);

    return () => {
      destroyed = true;
      sceneRef.current = null;
      game?.destroy(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle]);

  // Redraw after every state change (cheap: K ≤ 7 objects).
  useEffect(() => {
    if (sceneRef.current) drawBoard(sceneRef.current, vmRef.current);
  });

  // Wrong-answer feedback: shake the camera (skipped under reduced motion).
  useEffect(() => {
    if (shake > 0 && !reduce) sceneRef.current?.cameras?.main?.shake?.(380, 0.008);
  }, [shake, reduce]);

  return (
    <div
      ref={containerRef}
      className={styles.stage}
      role="application"
      aria-label="Rune cipher board — bind each rune to a letter, then read the runes"
    />
  );
}

// ── Living-flame atmosphere ─────────────────────────────────────────────────
// Decorative F1 layers over the transparent Phaser canvas. The bloom brightens
// and the embers thicken + quicken as more runes bind (`progress` 0→1), then
// erupt on `won`. Both are pointer-events:none / aria-hidden. Reduced-motion
// routes to the DOM board, so this only ever runs in full-motion mode.
function FlameAtmosphere({ progress, won }: { progress: number; won: boolean }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1rem]"
      aria-hidden
    >
      <AmbientGlow
        intensity={0.22 + 0.45 * p + (won ? 0.15 : 0)}
        color="rgb(var(--c-ember))"
        vignette="rgba(23, 8, 14, 0.55)"
        position="50% 12%"
        className="absolute inset-0"
      />
      <ParticleField
        kind="ember"
        className="absolute inset-0"
        density={0.45 + 0.9 * p + (won ? 0.6 : 0)}
        driftSpeed={0.8 + 0.5 * p}
        opacity={0.4 + 0.35 * p}
      />
    </div>
  );
}

// Ember palette (hex ints for Phaser fills/strokes; strings for text color).
// Ignite spec skin: deep charcoal + gold + burnished copper + amber firelight.
const COL = {
  surface: 0x211b14,
  line: 0x3a332c,
  ember: 0xe0871f,
  gold: 0xf5c542,
  copper: 0xb87333,
  candle: 0xc9a24a,
  wrong: 0xb5462f,
  rune: "#d8b25a",
  name: "#8a7f74",
  ink: "#ece3d4",
  emberStr: "#e0871f",
  dim: "#6b6157",
};
const FONT = "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";

// Full redraw of the board from the current view-model. Stateless: clears the
// display list and rebuilds K (≤7) tiles — trivially cheap, avoids diffing.
// ponytail: full-rebuild-per-frame is fine at K≤7; switch to object pooling only
// if this ever renders hundreds of tiles.
function drawBoard(scene: any, vm: BoardVM | null) {
  scene.children?.removeAll(true);
  if (!vm) return;
  const {
    puzzle,
    assign,
    selected,
    litGlyphs,
    wrongGlyphs,
    revealed,
    trayOrder,
    won,
    over,
    K,
    onGlyph,
    onLetter,
    onRead,
  } = vm;
  const { width: W, height: H } = scene.scale.gameSize;
  if (W < 2 || H < 2) return;

  const p = Math.max(10, Math.round(W * 0.035));
  const cx = W / 2;
  const filled = assign.filter((a) => a != null).length;
  const brightness = won ? 1 : 0.2 + 0.8 * (filled / K);

  // Vertical bands (fractions of the stage height).
  const candleH = H * 0.16;
  const inscrH = H * 0.15;
  const gridH = H * 0.41;
  const trayH = H * 0.16;
  const btnH = H * 0.12;
  let y = 0;

  // ── Candle + flame glow ──
  const gfx = scene.add.graphics();
  const glowR = Math.min(W * 0.24, candleH);
  gfx.fillStyle(COL.ember, 0.07 + 0.2 * brightness);
  gfx.fillCircle(cx, y + candleH * 0.6, glowR);
  gfx.fillStyle(COL.gold, 0.08 + 0.22 * brightness);
  gfx.fillCircle(cx, y + candleH * 0.55, glowR * 0.55);
  const stickW = Math.min(20, W * 0.05);
  const stickH = candleH * 0.42;
  scene.add
    .rectangle(cx, y + candleH * 0.92, stickW, stickH, COL.candle)
    .setOrigin(0.5, 1);
  const flH = candleH * 0.34 * (0.55 + 0.45 * brightness);
  scene.add.ellipse(
    cx,
    y + candleH * 0.92 - stickH - flH * 0.3,
    stickW * 0.55,
    flH,
    COL.gold,
    0.9,
  );
  y += candleH;

  // ── Inscription: the incantation spelled in runes, chosen letters beneath ──
  {
    const n = puzzle.cipher.length;
    const cellW = Math.min((W - 2 * p) / n, 36);
    const runeFs = Math.round(cellW * 0.72);
    const letFs = Math.round(cellW * 0.5);
    let ix = cx - (cellW * n) / 2 + cellW / 2;
    const iy = y + inscrH * 0.5;
    for (let i = 0; i < n; i++) {
      const g = puzzle.cipher[i];
      const l = assign[g];
      scene.add
        .text(ix, iy - runeFs * 0.35, puzzle.glyphs[g].rune, {
          fontFamily: FONT,
          fontSize: `${runeFs}px`,
          color: COL.rune,
        })
        .setOrigin(0.5);
      scene.add
        .text(ix, iy + letFs * 0.75, l != null ? puzzle.letters[l] : "·", {
          fontFamily: FONT,
          fontSize: `${letFs}px`,
          fontStyle: "bold",
          color: won ? COL.emberStr : l != null ? COL.ink : COL.dim,
        })
        .setOrigin(0.5);
      ix += cellW;
    }
  }
  y += inscrH;

  // ── Rune key grid: tap a rune to select (or clear a placed one) ──
  {
    const cols = W < 380 ? 2 : 3;
    const rows = Math.ceil(K / cols);
    const gap = p * 0.7;
    const tw = (W - 2 * p - (cols - 1) * gap) / cols;
    const th = Math.min((gridH - (rows - 1) * gap) / rows, tw * 0.85);
    const startY = y + (gridH - (rows * th + (rows - 1) * gap)) / 2;
    for (let g = 0; g < K; g++) {
      const r = Math.floor(g / cols);
      // Center the last (possibly short) row.
      const inRow = Math.min(cols, K - r * cols);
      const rowW = inRow * tw + (inRow - 1) * gap;
      const rowX = cx - rowW / 2;
      const idxInRow = g - r * cols;
      const tx = rowX + tw / 2 + idxInRow * (tw + gap);
      const ty = startY + th / 2 + r * (th + gap);
      const l = assign[g];
      const isSel = selected === g && !over;
      const isLit = litGlyphs.has(g);
      const isWrong = wrongGlyphs.has(g);
      const isLocked = revealed.has(g);
      const rect = scene.add.rectangle(tx, ty, tw, th, COL.surface);
      const stroke = isWrong
        ? COL.wrong
        : isSel
          ? COL.ember
          : isLocked || isLit
            ? COL.gold
            : COL.line;
      rect.setStrokeStyle(isSel || isWrong || isLocked ? 3 : 2, stroke);
      scene.add
        .text(tx, ty - th * 0.14, puzzle.glyphs[g].rune, {
          fontFamily: FONT,
          fontSize: `${Math.round(th * 0.42)}px`,
          color: COL.rune,
        })
        .setOrigin(0.5);
      scene.add
        .text(tx, ty + th * 0.33, puzzle.glyphs[g].name, {
          fontFamily: FONT,
          fontSize: `${Math.round(Math.min(th * 0.17, tw * 0.16))}px`,
          color: COL.name,
        })
        .setOrigin(0.5);
      if (l != null)
        scene.add
          .text(tx + tw * 0.36, ty - th * 0.32, puzzle.letters[l], {
            fontFamily: FONT,
            fontSize: `${Math.round(th * 0.3)}px`,
            fontStyle: "bold",
            color: isWrong ? "#d97a5f" : COL.emberStr,
          })
          .setOrigin(0.5);
      if (!over && !isLocked) {
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", () => onGlyph(g));
      }
    }
  }
  y += gridH;

  // ── Letter tray: shuffled; tap a letter to place it on the selected rune ──
  {
    const gap = p * 0.5;
    const chip = Math.min((W - 2 * p - (K - 1) * gap) / K, trayH * 0.7, 46);
    let lx = cx - (chip * K + gap * (K - 1)) / 2 + chip / 2;
    const ly = y + trayH * 0.5;
    for (const l of trayOrder) {
      const placed = assign.indexOf(l) !== -1;
      const rect = scene.add.rectangle(lx, ly, chip, chip, COL.surface);
      rect.setStrokeStyle(2, placed ? COL.ember : COL.line);
      rect.setAlpha(placed ? 0.5 : 1);
      scene.add
        .text(lx, ly, puzzle.letters[l], {
          fontFamily: FONT,
          fontSize: `${Math.round(chip * 0.5)}px`,
          fontStyle: "bold",
          color: COL.ink,
        })
        .setOrigin(0.5)
        .setAlpha(placed ? 0.5 : 1);
      if (!over) {
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", () => onLetter(l));
      }
      lx += chip + gap;
    }
  }
  y += trayH;

  // ── Read the runes — ALWAYS tappable (design B) ──
  if (!over) {
    const enabled = filled > 0;
    const bw = Math.min(W - 2 * p, 320);
    const bh = Math.min(btnH * 0.72, 52);
    const by = y + btnH * 0.5;
    const rect = scene.add.rectangle(cx, by, bw, bh, enabled ? COL.ember : COL.surface);
    rect.setStrokeStyle(2, COL.ember);
    rect.setAlpha(enabled ? 1 : 0.5);
    scene.add
      .text(cx, by, "READ THE RUNES", {
        fontFamily: FONT,
        fontSize: `${Math.round(bh * 0.34)}px`,
        fontStyle: "bold",
        color: enabled ? "#1b1712" : COL.emberStr,
      })
      .setOrigin(0.5)
      .setAlpha(enabled ? 1 : 0.7);
    if (enabled) {
      rect.setInteractive({ useHandCursor: true });
      rect.on("pointerdown", () => onRead());
    }
  }
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
