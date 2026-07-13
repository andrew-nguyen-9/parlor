"use client";

import type { CSSProperties } from "react";
import { AmbientGlow, GrainFog, Ornament, ParticleField } from "@/components/atmosphere";
import type { Quality } from "@/lib/settings";
import Planchette from "./Planchette";

/**
 * SeanceAtmosphere — the séance's candle / smoke / dust sim + gilt frame, as ONE
 * background layer sitting BEHIND all content (zIndex 0). Every primitive here is
 * STATIC (`animate={false}`) so the whole composition spends zero of the
 * ≤1-loop budget; the lone loop is the Planchette drift. Legibility floor: the
 * layer is behind the (semi-transparent) grid and translucent, and content sits
 * at zIndex 1, so nothing here ever crosses Q&A text.
 *
 * E2 honors the E0 quality tier: "off" → the layer renders nothing (flat
 * panels, the game stays complete on its own — atmosphere is optional garnish);
 * "reduced" (Balanced) → static textures at lower density + the planchette drift
 * frozen (no loop); "full" (High) → full texture + the single planchette loop.
 */

const CORNERS = [
  { top: 6, left: 6, rotate: 0 },
  { top: 6, right: 6, rotate: 90 },
  { bottom: 6, right: 6, rotate: 180 },
  { bottom: 6, left: 6, rotate: 270 },
] as const;

export default function SeanceAtmosphere({
  reduce,
  pulse,
  quality = "full",
}: {
  reduce: boolean;
  pulse: number;
  quality?: Quality;
}) {
  // quality "off" → no atmosphere at all (flat panels; the board renders
  // complete on its own — Floor). Balanced/High just dial the richness.
  if (quality === "off") return null;
  const balanced = quality === "reduced";
  // the planchette drift is THE per-viewport loop; freeze it on Balanced or
  // under reduced motion (still a legible frame; lean-on-bind is finite anyway).
  const freezePlanchette = reduce || balanced;
  const density = balanced ? 0.35 : 0.7;
  const grain = balanced ? 0.06 : 0.1;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0, // wins over `.shell > * { z-index: 1 }` (inline > class)
        pointerEvents: "none",
        overflow: "hidden",
        borderRadius: "inherit",
      }}
    >
      {/* candle bloom + corner shadow — the lit-centre vignette (one warm
          light source from top-center; corners fall to darkness) */}
      <AmbientGlow intensity={0.5} position="50% -4%" />
      {/* subtle compass-rose watermark behind the board center (issue #11:
          amplified Ouija motif) — a faint engraved spirit-symbol, low-contrast,
          decorative, behind non-text panel areas only. */}
      <CompassRose />
      {/* drifting dust motes, frozen to a single seeded frame (density dialed
          down on the Balanced quality tier) */}
      <ParticleField kind="dust" animate={false} density={density} opacity={0.5} />
      {/* faint séance smoke + film grain, still */}
      <GrainFog opacity={grain} animate={false} />

      {/* the living planchette — the one loop, translucent, behind the grid */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.38,
        }}
      >
        <Planchette reduce={freezePlanchette} pulse={pulse} />
      </div>

      {/* gold ornament corners — carved brass frame (static SVG) */}
      {CORNERS.map((c, i) => {
        const { rotate, ...pos } = c;
        return (
          <Ornament
            key={i}
            variant="corner"
            treatment="gold"
            size={30}
            style={{ position: "absolute", transform: `rotate(${rotate}deg)`, ...pos }}
          />
        );
      })}
    </div>
  );
}

/** A faint engraved compass rose watermarked behind the board center — a static
 *  Ouija motif (issue #11), aria-hidden, very low contrast, never over text. */
function CompassRose() {
  const wrap: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(52%, 26rem)",
    aspectRatio: "1",
    opacity: 0.05,
    color: "rgb(var(--c-goldlite))",
  };
  return (
    <div aria-hidden style={wrap}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" focusable={false}>
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="7" stroke="currentColor" strokeWidth="0.5" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          const long = i % 2 === 0;
          const r = long ? 46 : 34;
          const x = 50 + Math.sin(a) * r;
          const y = 50 - Math.cos(a) * r;
          return (
            <polygon
              key={i}
              points={`50,50 ${(50 + x) / 2},${(50 + y) / 2} ${x},${y}`}
              stroke="currentColor"
              strokeWidth={long ? 0.6 : 0.35}
            />
          );
        })}
      </svg>
    </div>
  );
}
