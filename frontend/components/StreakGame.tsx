"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { IgnitePuzzle, IgniteClue } from "@/lib/ignitePuzzle";
import CollapsiblePanel from "@/components/CollapsiblePanel";
import styles from "./StreakGame.module.css";

// IGNITE — the Witch's rune cipher. The GAME LOGIC is untouched (lib/ignitePuzzle):
// a bijection glyph→letter that the clues determine uniquely. What changed (E4) is
// the render/input layer: the interactive board (candle, inscription, rune grid,
// letter tray, "read" action) is now a Phaser canvas instead of DOM buttons. React
// stays the single source of truth for game state; Phaser is a pure presenter that
// draws the current view-model and forwards taps back to React. Clues + the win
// panel remain accessible DOM. Phaser is client-only (dynamic import inside an
// effect) so SSR/prerender never touches `window`.

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
  const [shake, setShake] = useState(0); // increments to trigger a canvas shake
  const [won, setWon] = useState(false);
  const [copied, setCopied] = useState(false);

  const filled = assign.filter((a) => a !== null).length;

  // glyph indices lit by the active clue (ring highlight on the board)
  const litGlyphs = useMemo(() => {
    const s = new Set<number>();
    if (activeClue != null) for (const g of puzzle.clues[activeClue].glyphs) s.add(g);
    return s;
  }, [activeClue, puzzle.clues]);

  function selectGlyph(g: number) {
    if (won) return;
    setSelected(g);
  }

  // Tap a rune: clear it if it already holds a letter, else select it.
  function tapGlyph(g: number) {
    if (assign[g] != null) clearGlyph(g);
    else selectGlyph(g);
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
    if (correct) setWon(true);
    else {
      setReveals((n) => n + 1);
      setShake((n) => n + 1);
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

      {/* The interactive board — candle, inscription, rune grid, letter tray and
          the "read" action, all rendered + input-handled by Phaser. */}
      <RunePhaserBoard
        puzzle={puzzle}
        assign={assign}
        selected={selected}
        litGlyphs={litGlyphs}
        won={won}
        reduce={reduce}
        shake={shake}
        onGlyph={tapGlyph}
        onLetter={tapLetter}
        onRead={readTheRunes}
      />

      {won ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-6 max-w-md rounded-2xl border border-[#e0871f]/50 bg-surface p-6 text-center"
        >
          <p className="display text-3xl text-[#e0871f]">The inscription blazes</p>
          <p className={`mt-2 text-2xl font-black tracking-[0.3em] text-ink ${styles.blaze}`}>
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
        <div className="mt-4">
          {reveals > 0 && (
            <p className="microlabel mb-3 text-center text-music">
              the runes resist — {reveals} misread{reveals > 1 ? "s" : ""}
            </p>
          )}
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

// ── Phaser presentation layer ───────────────────────────────────────────────
// View-model the scene reads on every draw. Kept in a ref so the (once-created)
// scene always sees fresh state + callbacks without being torn down.
interface BoardVM {
  puzzle: IgnitePuzzle;
  assign: (number | null)[];
  selected: number;
  litGlyphs: Set<number>;
  won: boolean;
  K: number;
  onGlyph: (g: number) => void;
  onLetter: (l: number) => void;
  onRead: () => void;
}

function RunePhaserBoard(props: {
  puzzle: IgnitePuzzle;
  assign: (number | null)[];
  selected: number;
  litGlyphs: Set<number>;
  won: boolean;
  reduce: boolean;
  shake: number;
  onGlyph: (g: number) => void;
  onLetter: (l: number) => void;
  onRead: () => void;
}) {
  const { puzzle, reduce, shake } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const vmRef = useRef<BoardVM | null>(null);

  // Set the view-model during render so the effect below redraws with fresh state.
  vmRef.current = {
    puzzle,
    assign: props.assign,
    selected: props.selected,
    litGlyphs: props.litGlyphs,
    won: props.won,
    K: puzzle.letters.length,
    onGlyph: props.onGlyph,
    onLetter: props.onLetter,
    onRead: props.onRead,
  };

  // Build the Phaser game once (rebuild only if the puzzle identity changes).
  // Dynamic import keeps Phaser out of the server/prerender bundle (SSR guard).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let game: any = null;
    let destroyed = false;

    import("phaser").then((mod) => {
      const Phaser: any = (mod as any).default ?? mod;
      if (destroyed || !containerRef.current) return;

      class RuneScene extends Phaser.Scene {
        create() {
          sceneRef.current = this;
          drawBoard(this, vmRef.current);
          this.scale.on("resize", () => drawBoard(this, vmRef.current));
        }
      }

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: container,
        transparent: true,
        scale: {
          mode: Phaser.Scale.RESIZE,
          parent: container,
          width: container.clientWidth || 320,
          height: container.clientHeight || 480,
        },
        scene: RuneScene,
      });
    });

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
      className={`${styles.stage} mt-4`}
      role="application"
      aria-label="Rune cipher board — bind each rune to a letter, then read the runes"
    />
  );
}

// Ember palette (hex ints for Phaser fills/strokes; strings for text color).
const COL = {
  surface: 0x211b14,
  line: 0x3a332c,
  ember: 0xe0871f,
  gold: 0xf5c542,
  candle: 0xc9a24a,
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
  const { puzzle, assign, selected, litGlyphs, won, K, onGlyph, onLetter, onRead } = vm;
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
  scene.add.rectangle(cx, y + candleH * 0.92, stickW, stickH, COL.candle).setOrigin(0.5, 1);
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
      const isSel = selected === g && !won;
      const isLit = litGlyphs.has(g);
      const rect = scene.add.rectangle(tx, ty, tw, th, COL.surface);
      rect.setStrokeStyle(isSel ? 3 : 2, isSel ? COL.ember : isLit ? COL.gold : COL.line);
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
            color: COL.emberStr,
          })
          .setOrigin(0.5);
      if (!won) {
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", () => onGlyph(g));
      }
    }
  }
  y += gridH;

  // ── Letter tray: tap a letter to place it on the selected rune (toggle off) ──
  {
    const gap = p * 0.5;
    const chip = Math.min((W - 2 * p - (K - 1) * gap) / K, trayH * 0.7, 46);
    let lx = cx - (chip * K + gap * (K - 1)) / 2 + chip / 2;
    const ly = y + trayH * 0.5;
    for (let l = 0; l < K; l++) {
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
      if (!won) {
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", () => onLetter(l));
      }
      lx += chip + gap;
    }
  }
  y += trayH;

  // ── Read the runes ──
  if (!won) {
    const enabled = filled >= K;
    const bw = Math.min(W - 2 * p, 320);
    const bh = Math.min(btnH * 0.72, 52);
    const by = y + btnH * 0.5;
    const rect = scene.add.rectangle(cx, by, bw, bh, enabled ? COL.ember : COL.surface);
    rect.setStrokeStyle(2, COL.ember);
    rect.setAlpha(enabled ? 1 : 0.4);
    scene.add
      .text(cx, by, "READ THE RUNES", {
        fontFamily: FONT,
        fontSize: `${Math.round(bh * 0.34)}px`,
        fontStyle: "bold",
        color: enabled ? "#1b1712" : COL.emberStr,
      })
      .setOrigin(0.5)
      .setAlpha(enabled ? 1 : 0.6);
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
