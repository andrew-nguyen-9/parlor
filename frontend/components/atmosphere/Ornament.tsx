"use client";

import { useId } from "react";

/**
 * Ornament — the reusable SVG flourish / glyph kit (engraved-card Victorian).
 *
 * ONE component, many `variant`s: corner borders, a horizontal flourish, and
 * moon / sun / compass glyphs. Rooms compose these instead of pasting one-off
 * SVGs. Static, SSR-safe, `aria-hidden` (decorative). No animation — legibility
 * and the ≤1-loop budget are untouched by ornaments.
 *
 * `treatment`:
 *   - "stroke" — engraved hairline (fill none, `currentColor` stroke)
 *   - "fill"   — solid `currentColor`
 *   - "gold"   — a fresh static gold gradient (NOT GoldSheen: no pointer light,
 *                no shimmer keyframe) from the goldlite→gold→brass tokens
 *
 * Color: set `color` (default inherits `currentColor`) — for stroke/fill it tints
 * the glyph; the gold gradient is fixed to the gold tokens.
 */

export type OrnamentVariant = "corner" | "flourish" | "moon" | "sun" | "compass";
export type OrnamentTreatment = "stroke" | "fill" | "gold";

export interface OrnamentProps {
  variant: OrnamentVariant;
  /** Square edge (px) for glyphs/corner; the flourish keeps its 6:1 aspect. Default 48. */
  size?: number;
  treatment?: OrnamentTreatment;
  /** Tint for stroke/fill treatments (any CSS color). Default `currentColor`. */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface Shape {
  viewBox: string;
  aspect: number; // width / height
  paths: string[];
}

const SHAPES: Record<OrnamentVariant, Shape> = {
  // top-left corner bracket — rooms rotate (transform/scale) for the other three
  corner: {
    viewBox: "0 0 64 64",
    aspect: 1,
    paths: [
      "M6 30 L6 12 Q6 6 12 6 L30 6",
      "M6 22 Q18 22 22 6",
      "M12 12 q10 0 10 10",
    ],
  },
  // symmetric engraved divider with a central lozenge
  flourish: {
    viewBox: "0 0 120 20",
    aspect: 6,
    paths: [
      "M8 10 H44 Q52 10 56 4",
      "M112 10 H76 Q68 10 64 4",
      "M60 4 L66 10 L60 16 L54 10 Z",
      "M44 10 Q50 16 56 16",
      "M76 10 Q70 16 64 16",
    ],
  },
  moon: {
    viewBox: "0 0 64 64",
    aspect: 1,
    paths: ["M42 8 A26 26 0 1 0 42 56 A20 20 0 1 1 42 8 Z"],
  },
  sun: {
    viewBox: "0 0 64 64",
    aspect: 1,
    paths: [
      "M32 20 A12 12 0 1 0 32.01 20 Z",
      "M32 4 V12 M32 52 V60 M4 32 H12 M52 32 H60 M11 11 L17 17 M53 53 L47 47 M53 11 L47 17 M11 53 L17 47",
    ],
  },
  compass: {
    viewBox: "0 0 64 64",
    aspect: 1,
    paths: [
      "M32 4 L38 32 L32 60 L26 32 Z",
      "M4 32 L32 26 L60 32 L32 38 Z",
      "M32 32 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0",
      "M32 32 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0",
    ],
  },
};

export default function Ornament({
  variant,
  size = 48,
  treatment = "stroke",
  color = "currentColor",
  className,
  style,
}: OrnamentProps) {
  const gid = useId(); // SSR-stable, collision-free per instance
  const shape = SHAPES[variant];
  const gold = treatment === "gold";
  const filled = treatment !== "stroke";

  // Always stroke (keeps open line-art readable in every treatment); fill only
  // when the treatment asks for a body.
  const stroke = gold ? "rgb(var(--c-brass))" : "currentColor";
  const fill = !filled ? "none" : gold ? `url(#${gid})` : "currentColor";

  return (
    <svg
      className={className}
      style={{ color, ...style }}
      width={size * shape.aspect}
      height={size}
      viewBox={shape.viewBox}
      fill="none"
      aria-hidden
      focusable={false}
    >
      {gold && (
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-goldlite))" />
          <stop offset="50%" stopColor="rgb(var(--c-gold))" />
          <stop offset="100%" stopColor="rgb(var(--c-brass))" />
        </linearGradient>
      )}
      {shape.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
