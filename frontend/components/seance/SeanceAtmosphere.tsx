"use client";

import { AmbientGlow, GrainFog, Ornament, ParticleField } from "@/components/atmosphere";
import Planchette from "./Planchette";

/**
 * SeanceAtmosphere — the séance's candle / smoke / dust sim + gilt frame, as ONE
 * background layer sitting BEHIND all content (zIndex 0). Every primitive here is
 * STATIC (`animate={false}`) so the whole composition spends zero of the
 * ≤1-loop budget; the lone loop is the Planchette drift. Legibility floor: the
 * layer is behind the (semi-transparent) grid and translucent, and content sits
 * at zIndex 1, so nothing here ever crosses Q&A text.
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
}: {
  reduce: boolean;
  pulse: number;
}) {
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
      {/* candle bloom + corner shadow — the lit-centre vignette */}
      <AmbientGlow intensity={0.5} position="50% -4%" />
      {/* drifting dust motes, frozen to a single seeded frame */}
      <ParticleField kind="dust" animate={false} density={0.7} opacity={0.5} />
      {/* faint séance smoke + film grain, still */}
      <GrainFog opacity={0.1} animate={false} />

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
        <Planchette reduce={reduce} pulse={pulse} />
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
