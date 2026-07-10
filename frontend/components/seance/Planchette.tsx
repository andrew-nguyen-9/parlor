"use client";

import { useEffect, useId } from "react";
import { motion, useAnimationControls } from "framer-motion";

/**
 * Planchette — the séance's one living element (and the SINGLE per-viewport
 * animation loop, per the ≤1-loop floor). A brass Ouija pointer that:
 *   - idle: drifts slowly across the board (framer loop),
 *   - binds: leans + glows once when a spirit is bound (`pulse` bump, ≤600ms),
 *   - spells: on completion, a finite glide sweep (`spelling`).
 *
 * Purely decorative: `pointer-events:none`, `aria-hidden`. Under reduced motion
 * it freezes to a still, legible frame (no drift, no lean) — the atmosphere
 * primitives around it are already static, so nothing loops.
 */
export default function Planchette({
  reduce,
  pulse = 0,
  spelling = false,
  size = 104,
}: {
  reduce: boolean;
  pulse?: number;
  spelling?: boolean;
  size?: number;
}) {
  const gid = useId(); // SSR-stable gold gradient (fresh — not GoldSheen)
  const lean = useAnimationControls();

  // A binding just landed → a finite lean + brighten, never a loop.
  useEffect(() => {
    if (pulse === 0 || reduce) return;
    lean.start({
      scale: [1, 1.16, 1],
      filter: [
        "drop-shadow(0 0 6px rgba(214,176,92,0.45))",
        "drop-shadow(0 0 18px rgba(214,176,92,0.85))",
        "drop-shadow(0 0 6px rgba(214,176,92,0.45))",
      ],
      transition: { duration: 0.5, ease: "easeOut" },
    });
  }, [pulse, reduce, lean]);

  // Idle drift is THE viewport loop; spelling is a one-shot sweep; reduced
  // motion holds it dead still.
  const drift = reduce
    ? undefined
    : spelling
      ? {
          x: [-52, 44, -30, 22, 0],
          y: [0, -8, 6, -3, 0],
          rotate: [-4, 3, -2, 1, 0],
          transition: { duration: 2.6, ease: "easeInOut" as const },
        }
      : {
          x: [0, 12, -9, 7, 0],
          y: [0, -9, 7, -4, 0],
          rotate: [0, 2.4, -1.8, 1.2, 0],
          transition: { duration: 15, ease: "easeInOut" as const, repeat: Infinity },
        };

  return (
    <motion.div aria-hidden animate={drift} style={{ willChange: "transform" }}>
      <motion.div
        animate={lean}
        style={{ filter: "drop-shadow(0 0 6px rgba(214,176,92,0.45))" }}
      >
        <svg
          width={size * 0.86}
          height={size}
          viewBox="0 0 86 100"
          fill="none"
          aria-hidden
          focusable={false}
        >
          <defs>
            <radialGradient id={gid} cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="rgb(var(--c-goldlite))" />
              <stop offset="55%" stopColor="rgb(var(--c-gold))" />
              <stop offset="100%" stopColor="rgb(var(--c-brass))" />
            </radialGradient>
          </defs>
          {/* teardrop planchette body */}
          <path
            d="M43 4 C64 4 82 20 82 44 C82 70 58 84 43 96 C28 84 4 70 4 44 C4 20 22 4 43 4 Z"
            fill={`url(#${gid})`}
            fillOpacity={0.16}
            stroke={`url(#${gid})`}
            strokeWidth={2}
          />
          {/* scrying lens ring */}
          <circle cx="43" cy="40" r="18" stroke="rgb(var(--c-goldlite))" strokeWidth={1.6} />
          <circle cx="43" cy="40" r="2.4" fill="rgb(var(--c-candle))" />
          {/* three feet */}
          {[
            [22, 16],
            [64, 16],
            [43, 92],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3.2" fill="rgb(var(--c-brass))" />
          ))}
        </svg>
      </motion.div>
    </motion.div>
  );
}
