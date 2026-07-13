// SeanceTutorialDemo — the E3 animated board-fill walkthrough (spec §S6).
//
// A canned, non-interactive "watch" clip that teaches the ONE mechanic newcomers
// miss: the three-state cell cycle (blank → snuff ✕ → bind ◯) and the DERIVED
// auto-snuff cascade across the bound seat's row + column. It reuses the shipped
// séance skin (brass-on-walnut, spectral violet) and the real Planchette motif
// at demo scale, so what's learned here is recognised on the live board.
//
// Self-contained by design: it imports NOTHING from SeanceGame and owns no game
// state — it's a pure function of the deterministic `SEANCE_DEMO` beat script
// (`lib/tutorials/seance.ts`). Drop it into the shipped how-to-play overlay above
// the static steps; it never forks the trigger system.
//
// Motion budget: plays ONCE through its beats (a chain of ≤600ms timers), then
// rests on the solved board — no infinite loop. Reduced motion (E0 `useReducedMotion`
// = calm OR OS) swaps the clip for a labelled blank → solved still: the same
// lesson as a designed state, zero motion. Silent — no audio coupling.
"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/settings";
import Planchette from "@/components/seance/Planchette";
import { SEANCE_DEMO, type DemoGrid } from "@/lib/tutorials/seance";
import styles from "./SeanceTutorialDemo.module.css";

const GLYPH = ["", "✕", "◯"] as const; // by mark: blank · snuffed · bound

/** One static 3×3 board rendered from a grid snapshot (no motion of its own). */
function Board({
  grid,
  planchette,
  reduce,
  pulse = 0,
}: {
  grid: DemoGrid;
  /** Show the reused planchette hovering the center-bound seat. */
  planchette?: boolean;
  reduce: boolean;
  pulse?: number;
}) {
  return (
    <div className={styles.board} data-skin="seance" aria-hidden>
      {grid.map((row, r) =>
        row.map((mark, c) => (
          <div key={`${r}-${c}`} className={styles.cell} data-state={mark}>
            <span className={styles.mark}>{GLYPH[mark]}</span>
          </div>
        )),
      )}
      {planchette && (
        <div className={styles.planchette}>
          <Planchette reduce={reduce} pulse={pulse} size={58} />
        </div>
      )}
    </div>
  );
}

export default function SeanceTutorialDemo({ reduce: reduceOverride }: { reduce?: boolean }) {
  const settingReduce = useReducedMotion(); // EFFECTIVE (calm OR OS)
  const reduce = reduceOverride ?? settingReduce;
  const { beats, beatMs, still } = SEANCE_DEMO;
  const last = beats.length - 1;

  const [beat, setBeat] = useState(0);

  // Advance one beat at a time until the sequence rests on the solved board.
  // Finite (no `repeat`/`Infinity`) → spends none of the ≤1-loop budget. Skipped
  // entirely under reduced motion (the still fallback renders instead).
  useEffect(() => {
    if (reduce || beat >= last) return;
    const t = setTimeout(() => setBeat((b) => b + 1), beatMs);
    return () => clearTimeout(t);
  }, [beat, last, beatMs, reduce]);

  // ── Reduced-motion: labelled blank → solved still, no motion (spec E3 §A) ──
  if (reduce) {
    return (
      <figure className={styles.wrap}>
        <div className={styles.stills}>
          <div className={styles.still}>
            <Board grid={still.before} reduce />
            <span className={styles.stillLabel}>blank</span>
          </div>
          <span className={styles.arrow} aria-hidden>
            →
          </span>
          <div className={styles.still}>
            <Board grid={still.after} reduce planchette />
            <span className={styles.stillLabel}>bound + auto-snuffed</span>
          </div>
        </div>
        <figcaption className={styles.caption}>
          Bind one seat and its row and column snuff themselves — the cascade.
        </figcaption>
      </figure>
    );
  }

  // ── Animated: a single played-once board-fill, narrated per beat ──
  const done = beat >= last;
  return (
    <figure className={styles.wrap}>
      <Board grid={beats[beat].grid} reduce={false} planchette pulse={beat >= 2 ? 1 : 0} />
      <figcaption className={styles.caption} aria-live="polite">
        {beats[beat].caption}
      </figcaption>
      <div className={styles.dots} aria-hidden>
        {beats.map((_, i) => (
          <span key={i} className={styles.dot} data-on={i <= beat} />
        ))}
      </div>
      {done && (
        <button type="button" className={styles.replay} onClick={() => setBeat(0)}>
          ↺ Replay
        </button>
      )}
    </figure>
  );
}
