"use client";

import { useMemo, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { HOURS, type MysteryCase } from "@/lib/mystery";
import type { MysteryContext } from "@/lib/mysteryTypes";
import { TooltipWrapper } from "./MysteryCharacterTooltip";

// Room center positions as % of the container (match mansion-map.jpg layout)
// These percentages target the visual center of each room in the image.
// Adjust after the image is in place.
const ROOM_CENTERS: Record<string, { cx: number; cy: number }> = {
  "the Observatory":    { cx: 50, cy: 22 },
  "the Smoking Lounge": { cx: 13, cy: 37 },
  "the Conservatory":   { cx: 87, cy: 37 },
  "the Grand Ballroom": { cx: 50, cy: 53 },
  "the Velvet Library": { cx: 13, cy: 67 },
  "the Wine Cellar":    { cx: 87, cy: 67 },
};

function polygonPositions(
  n: number,
  cx: number,
  cy: number,
  r: number
): [number, number][] {
  if (n === 1) return [[cx, cy]];
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [
      number,
      number
    ];
  });
}

export default function MysteryMapView({
  mystery,
  context,
  verdictSubmitted,
}: {
  mystery: MysteryCase;
  context: MysteryContext;
  verdictSubmitted?: boolean;
}) {
  const [selectedHour, setSelectedHour] = useState(0);

  // Group suspects by room for the selected hour
  const roomGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const s of mystery.suspects) {
      const room = mystery.dossiers[s.id].claimed[selectedHour];
      if (!groups[room]) groups[room] = [];
      groups[room].push(s.id);
    }
    return groups;
  }, [mystery, selectedHour]);

  // Compute final position for each suspect
  const positions = useMemo(() => {
    const result: Record<string, { x: number; y: number }> = {};
    for (const [room, ids] of Object.entries(roomGroups)) {
      const center = ROOM_CENTERS[room] ?? { cx: 50, cy: 50 };
      const pts = polygonPositions(ids.length, center.cx, center.cy, 5);
      ids.forEach((id, i) => {
        result[id] = { x: pts[i][0], y: pts[i][1] };
      });
    }
    return result;
  }, [roomGroups]);

  return (
    <div className="w-full space-y-4">
      {/* Map container */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-line bg-bg/60">
        <img
          src="/mansion-map.jpg"
          alt="Mansion floor plan"
          className="w-full"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Fallback placeholder shown when image is absent */}
        <div className="absolute inset-0 -z-10 bg-surface/80" />

        <LayoutGroup>
          {mystery.suspects.map((suspect) => {
            const pos = positions[suspect.id];
            if (!pos) return null;
            const isCulprit = mystery.culprits.includes(suspect.id);
            const glowing =
              verdictSubmitted && isCulprit && selectedHour === mystery.hourIndex;
            return (
              <motion.div
                key={suspect.id}
                layoutId={`mystery-map-char-${suspect.id}`}
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                transition={{ type: "spring", stiffness: 180, damping: 28 }}
              >
                <TooltipWrapper
                  character={suspect}
                  mystery={mystery}
                  context={context}
                >
                  <div
                    className={`cursor-pointer select-none text-2xl ${
                      glowing
                        ? "animate-pulse drop-shadow-[0_0_8px_rgba(220,80,60,0.9)]"
                        : ""
                    }`}
                  >
                    {suspect.emoji}
                  </div>
                </TooltipWrapper>
              </motion.div>
            );
          })}
        </LayoutGroup>
      </div>

      {/* Timeline scrubber */}
      <div className="px-2">
        <div className="mb-2 flex justify-between">
          {HOURS.map((hour, h) => (
            <span
              key={hour}
              className={`microlabel cursor-pointer ${
                selectedHour === h ? "text-gold" : "text-muted"
              }`}
              onClick={() => setSelectedHour(h)}
            >
              {hour}
            </span>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={HOURS.length - 1}
          value={selectedHour}
          onChange={(e) => setSelectedHour(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-amber-400"
        />
      </div>
    </div>
  );
}
