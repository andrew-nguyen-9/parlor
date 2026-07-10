"use client";

import styles from "./AmbientGlow.module.css";
import { withAlpha } from "./color";

/**
 * AmbientGlow — soft vignette + single-source bloom overlay.
 *
 * ONE light source (North Star): a warm bloom radiating from `position`, plus a
 * vignette that deepens the corners so Q&A sits in the lit centre. Pure CSS
 * gradients — SSR-safe, zero JS, no canvas. The optional `animate` breathe is a
 * slow candle flutter (module.css keyframe, auto-killed under reduced motion).
 *
 * Decorative garnish: `pointer-events:none`, `aria-hidden`. Compose it BEHIND
 * content; the bloom must never wash out text (keep `intensity` modest over copy).
 */

export interface AmbientGlowProps {
  /** Overall strength 0–1 (scales bloom + vignette alpha). Default 0.6. */
  intensity?: number;
  /** Bloom color — any CSS color. Default the candle token. */
  color?: string;
  /**
   * Vignette / corner-shadow color. Default a warm deep umber that reads as
   * shadow on dark and as soft umber on the parchment light theme (never pure
   * black, per the design). Override per room if needed.
   */
  vignette?: string;
  /** CSS `<position>` for the bloom centre. Default "50% 0%" (top light). */
  position?: string;
  /** Run the slow candle-flutter loop. Reduced motion forces it off. Default false. */
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function AmbientGlow({
  intensity = 0.6,
  color = "rgb(var(--c-candle))",
  vignette = "rgba(23, 8, 14, 0.9)", // ponytail: theme-invariant warm shadow; override for a lighter umber
  position = "50% 0%",
  animate = false,
  className,
  style,
}: AmbientGlowProps) {
  const i = Math.max(0, Math.min(1, intensity));
  // Bloom: warm light from the single source, fading to nothing by 60%.
  const bloom = `radial-gradient(60% 55% at ${position}, ${withAlpha(color, 0.55 * i)} 0%, transparent 60%)`;
  // Vignette: darken the corners so the centre reads brightest.
  const vig = `radial-gradient(120% 120% at 50% 45%, transparent 45%, ${withAlpha(vignette, 0.7 * i)} 100%)`;

  return (
    <div
      className={[styles.layer, animate ? styles.breathe : "", className]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundImage: `${bloom}, ${vig}`, ...style }}
      aria-hidden
    />
  );
}
