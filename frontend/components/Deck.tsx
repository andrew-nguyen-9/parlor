"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import CardFace, { type Game } from "./CardFace";

const FAN_STEP = 7; // degrees between fanned cards
const DRAW_THRESHOLD = 120; // px the top card must travel to count as "drawn"

type Mode = "deck" | "fan" | "carousel";

export default function Deck({ games }: { games: Game[] }) {
  const reduced = useReducedMotion() ?? false;
  const n = games.length;
  const [order, setOrder] = useState(() => games.map((_, i) => i));
  const [mode, setMode] = useState<Mode>("deck");
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffling, setShuffling] = useState(false);
  // The zoom overlay is portalled to <body>: the page's `.page-enter` wrapper has
  // a transform, which would otherwise trap position:fixed inside the section.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const spring = reduced
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 160, damping: 20 };

  // Carousel auto-rotation angle (deg). Driven by rAF; frozen on select/reduce.
  const [orbit, setOrbit] = useState(0);
  const frozen = selected !== null; // selecting freezes the carousel
  useEffect(() => {
    if (mode !== "carousel" || reduced || frozen) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setOrbit((o) => (o + dt * 9) % 360); // ~9°/s slow drift
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, reduced, frozen]);

  // Stable per-card "magic" bob offsets (phase + amplitude), randomized once.
  const bob = useMemo(
    () =>
      games.map(() => ({
        rot: (Math.random() * 2 - 1) * 6, // ±6deg gentle spin
        delay: Math.random() * 2,
        dur: 3 + Math.random() * 2,
      })),
    [games]
  );

  // Move the top card to the bottom — the carousel cycle.
  const cycle = () => setOrder((p) => [...p.slice(1), p[0]]);

  const reorderRandom = () =>
    setOrder((p) => {
      const next = [...p];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });

  // SHUFFLE — bridge/riffle. Reduced-motion: instant reorder + restack.
  const shuffle = () => {
    if (shuffling) return;
    if (reduced) {
      reorderRandom();
      setMode("deck");
      return;
    }
    setMode("deck");
    setShuffling(true);
    // The bridge animation is driven by CSS/Framer variants keyed on `shuffling`.
    // Reorder mid-flight (after the split/riffle), then settle.
    window.setTimeout(() => reorderRandom(), 520);
    window.setTimeout(() => setShuffling(false), 1000);
  };

  // Per-card transform, by its position in the current order.
  const transformFor = (pos: number) => {
    if (mode === "fan") {
      const angle = (pos - (n - 1) / 2) * FAN_STEP;
      return { x: 0, y: 0, z: 0, rotate: angle, rotateY: 0, scale: 1, opacity: 1, zIndex: pos };
    }
    if (mode === "carousel") {
      // Cards arranged on a 3D ring. theta walks the circle; front (theta≈0)
      // is largest/brightest, back is smaller + dimmer.
      const theta = ((pos / n) * 360 + orbit) % 360;
      const rad = (theta * Math.PI) / 180;
      const radius = 150;
      const depth = Math.cos(rad); // 1 = front, -1 = back
      const x = Math.sin(rad) * radius;
      const scale = 0.62 + (depth + 1) * 0.24; // 0.62 (back) → 1.1 (front)
      const opacity = 0.4 + (depth + 1) * 0.3; // 0.4 → 1
      const b = bob[order[pos]] ?? { rot: 0 };
      return {
        x,
        y: 0,
        z: depth * 80,
        rotate: reduced || frozen ? 0 : b.rot,
        rotateY: -theta * 0.25,
        scale,
        opacity,
        zIndex: Math.round((depth + 1) * 100),
      };
    }
    // deck (stacked)
    return {
      x: pos * 1.4,
      y: pos * 1.2,
      z: 0,
      rotate: reduced ? 0 : (pos % 2 ? 1 : -1) * Math.min(pos, 4) * 0.5,
      rotateY: 0,
      scale: 1 - Math.min(pos, 6) * 0.012,
      opacity: 1,
      zIndex: n - pos,
    };
  };

  const microlabel =
    mode === "deck"
      ? "drag the top card to draw it · tap to open · fan or orbit to choose"
      : mode === "fan"
      ? "pick a card"
      : "the cards orbit — tap one to draw it";

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-8">
      <div className="deco-rule mb-6">
        <span className="gilt display text-lg tracking-[0.2em]">The Deck</span>
      </div>

      {/* controls */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <DeckButton
          onClick={mode === "deck" ? cycle : () => setMode("deck")}
          active={mode === "deck"}
        >
          {mode === "deck" ? "▸ next card" : "▤ stack"}
        </DeckButton>
        <DeckButton
          onClick={() => setMode((m) => (m === "fan" ? "deck" : "fan"))}
          active={mode === "fan"}
        >
          {mode === "fan" ? "▤ gather" : "◡ fan out"}
        </DeckButton>
        <DeckButton
          onClick={() => setMode((m) => (m === "carousel" ? "deck" : "carousel"))}
          active={mode === "carousel"}
        >
          {mode === "carousel" ? "▤ settle" : "◍ orbit"}
        </DeckButton>
        <DeckButton onClick={shuffle}>♠ shuffle</DeckButton>
      </div>

      {/* the deck stage */}
      <div className="deck-stage" style={{ perspective: 1600 }}>
        {order.map((gi, pos) => {
          const game = games[gi];
          const isTop = pos === 0;
          // dragging is a pointer enhancement; reduced-motion users tap to draw.
          const draggable = mode === "deck" && isTop && !shuffling && !reduced;
          const tappable = mode === "fan" || mode === "carousel" || isTop;
          return (
            <DeckCard
              key={game.href}
              game={game}
              pos={pos}
              mode={mode}
              reduced={reduced}
              shuffling={shuffling}
              transform={transformFor(pos)}
              spring={spring}
              bob={bob[gi]}
              frozen={frozen}
              draggable={draggable}
              onSelect={() => {
                if (tappable) setSelected(gi);
                else cycle();
              }}
            />
          );
        })}
      </div>

      <p className="microlabel mt-6 text-center opacity-60">{microlabel}</p>

      {/* zoomed selection — portalled to <body> so position:fixed pins to the
          viewport (the page's transformed `.page-enter` wrapper would trap it) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {selected !== null && (
              <motion.div
                className="deck-zoom-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                role="dialog"
                aria-modal="true"
                aria-label={`${games[selected].name} — drawn`}
              >
                <motion.div
                  className="deck-zoom-wrap"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 30 }}
                  transition={spring}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="deck-zoom-card deck-scene">
                    <CardFace game={games[selected]} side="front" zoomed />
                  </div>
                  <div className="deck-zoom-actions">
                    <Link
                      href={games[selected].href}
                      className="deck-play-btn"
                      autoFocus
                    >
                      ▶ Play {games[selected].name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="deck-close-btn microlabel"
                      aria-label="Close"
                    >
                      ✕ close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}

// ── A single card in the stage. The top card in deck mode is draggable, and
// flips (rotateY) as it is pulled away. Releasing past DRAW_THRESHOLD selects it.
function DeckCard({
  game,
  pos,
  mode,
  reduced,
  shuffling,
  transform,
  spring,
  bob,
  frozen,
  draggable,
  onSelect,
}: {
  game: Game;
  pos: number;
  mode: Mode;
  reduced: boolean;
  shuffling: boolean;
  transform: Record<string, number>;
  spring: object;
  bob: { rot: number; delay: number; dur: number };
  frozen: boolean;
  draggable: boolean;
  onSelect: () => void;
}) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  // flip the card as it is pulled away — back → front by ~half the threshold.
  const dist = useTransform([dragX, dragY], ([x, y]: number[]) =>
    Math.hypot(x as number, y as number)
  );
  const flip = useTransform(dist, [0, DRAW_THRESHOLD], [180, 0]);
  const [dragging, setDragging] = useState(false);
  const [revealFront, setRevealFront] = useState(false); // committed face after drag

  const isTop = pos === 0;
  // Fan/carousel always show fronts; in deck mode only the top card is a front.
  const baseFront = mode === "fan" || mode === "carousel" || isTop;
  // The draggable top deck card renders BOTH faces and flips via rotateY.
  const useFlip = draggable;

  // Bridge-shuffle: split deck in two halves and riffle. Even pos → left, odd → right.
  const shuffleAnim =
    shuffling && !reduced
      ? (() => {
          const side = pos % 2 === 0 ? -1 : 1;
          return {
            keyframes: {
              x: [transform.x, side * 130, side * 70, transform.x],
              y: [transform.y, -10, 8, transform.y],
              rotate: [transform.rotate, side * 8, side * -3, transform.rotate],
              rotateY: [0, 180, 180, baseFront ? 0 : 180], // face down during riffle
            },
            transition: {
              duration: 0.95,
              times: [0, 0.35, 0.7, 1],
              delay: Math.min(pos, 9) * 0.025,
              ease: "easeInOut" as const,
            },
          };
        })()
      : null;

  const animate = shuffleAnim
    ? { opacity: 1, ...shuffleAnim.keyframes, scale: transform.scale, zIndex: transform.zIndex }
    : draggable && !reduced
    ? // top card: x/y are owned by the drag motion values (snap to origin = slot).
      {
        opacity: transform.opacity,
        rotate: transform.rotate,
        scale: transform.scale,
        zIndex: transform.zIndex,
      }
    : {
        opacity: transform.opacity,
        x: transform.x,
        y: transform.y,
        rotate: transform.rotate,
        rotateY: transform.rotateY,
        scale: transform.scale,
        zIndex: transform.zIndex,
      };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const d = Math.hypot(info.offset.x, info.offset.y);
    setDragging(false);
    if (d >= DRAW_THRESHOLD) {
      setRevealFront(true);
      onSelect();
    }
    dragX.set(0);
    dragY.set(0);
  };

  // gentle magical bob in carousel mode
  const bobAnim =
    mode === "carousel" && !reduced && !frozen
      ? {
          y: [transform.y, transform.y - 8, transform.y],
          rotate: [transform.rotate, transform.rotate + bob.rot * 0.4, transform.rotate],
        }
      : undefined;

  return (
    <motion.button
      type="button"
      aria-label={`${game.name} — ${baseFront ? "open" : "reveal"}`}
      onClick={onSelect}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.9 }}
      animate={animate}
      transition={
        shuffleAnim
          ? shuffleAnim.transition
          : { ...spring, delay: reduced || mode === "carousel" ? 0 : Math.min(pos, 8) * 0.04 }
      }
      whileHover={mode === "fan" && !reduced ? { y: -26, scale: 1.05, zIndex: 50 } : undefined}
      drag={draggable && !reduced ? true : false}
      dragSnapToOrigin
      dragElastic={0.6}
      style={{
        x: draggable && !reduced ? dragX : undefined,
        y: draggable && !reduced ? dragY : undefined,
        transformOrigin: mode === "fan" ? "50% 145%" : "50% 50%",
        zIndex: transform.zIndex,
      }}
      onDragStart={() => setDragging(true)}
      onDragEnd={onDragEnd}
      className="deck-slot deck-scene"
    >
      {useFlip ? (
        <motion.div
          className="deck-flip-inner"
          style={{ rotateY: dragging ? flip : revealFront ? 0 : 180 }}
        >
          <div className="deck-flip-face">
            <CardFace game={game} side="back" />
          </div>
          <div className="deck-flip-face deck-flip-back">
            <CardFace game={game} side="front" />
          </div>
        </motion.div>
      ) : bobAnim ? (
        <motion.div
          className="deck-bob"
          animate={bobAnim}
          transition={{ duration: bob.dur, delay: bob.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <CardFace game={game} side="front" />
        </motion.div>
      ) : (
        <CardFace game={game} side={baseFront ? "front" : "back"} />
      )}
    </motion.button>
  );
}

function DeckButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`microlabel rounded-full border px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
        active
          ? "border-gold/70 bg-gold/10 text-goldlite"
          : "border-line text-gold hover:border-gold/60 hover:text-goldlite"
      }`}
    >
      {children}
    </button>
  );
}
