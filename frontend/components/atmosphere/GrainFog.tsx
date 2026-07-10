"use client";

import { useId } from "react";
import styles from "./GrainFog.module.css";
import { withAlpha } from "./color";

/**
 * GrainFog — film-grain stipple + volumetric-fog overlay.
 *
 * Grain is an inline SVG `feTurbulence` texture (SSR-safe, no canvas, no
 * `Math.random`) blended `soft-light` at low opacity so it never darkens text.
 * Fog is a stack of soft radial blobs; `animate` drifts them as the single
 * allowed loop (module.css, killed under reduced motion). Decorative:
 * `pointer-events:none`, `aria-hidden`.
 *
 * Compose it OVER a room as a top garnish layer, but keep `opacity` low where it
 * crosses Q&A — legibility overrides the effect (North Star Floor).
 */

export interface GrainFogProps {
  /** Overall layer opacity 0–1. Default 0.14 (grain runs lower internally). Default 0.14. */
  opacity?: number;
  /** Texture/fog coarseness. >1 = coarser grain + larger fog. Default 1. */
  scale?: number;
  /** Fog tint — any CSS color. Default the smoke token. */
  tint?: string;
  /** Drift the fog (the single loop). Reduced motion forces it off. Default false. */
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function GrainFog({
  opacity = 0.14,
  scale = 1,
  tint = "rgb(var(--c-smoke))",
  animate = false,
  className,
  style,
}: GrainFogProps) {
  const gid = useId();
  const s = Math.max(0.25, scale);
  const baseFreq = (0.8 / s).toFixed(3);

  // Two offset fog banks so drift reveals depth rather than a single sliding wash.
  const fogBg = [
    `radial-gradient(${40 * s}% ${30 * s}% at 25% 30%, ${withAlpha(tint, 0.5)} 0%, transparent 70%)`,
    `radial-gradient(${45 * s}% ${35 * s}% at 75% 70%, ${withAlpha(tint, 0.4)} 0%, transparent 70%)`,
  ].join(", ");

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={{ opacity: Math.max(0, Math.min(1, opacity)), ...style }}
      aria-hidden
    >
      <div
        className={[styles.fog, animate ? styles.fogDrift : ""].filter(Boolean).join(" ")}
        style={{ backgroundImage: fogBg }}
      />
      <svg className={styles.grain} width="100%" height="100%">
        <filter id={gid}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFreq}
            numOctaves={2}
            seed={7}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${gid})`} opacity={0.5} />
      </svg>
    </div>
  );
}
