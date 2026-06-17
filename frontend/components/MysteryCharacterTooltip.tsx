"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Character, MysteryCase } from "@/lib/mystery";
import { pretty } from "@/lib/mystery";
import type { MysteryContext } from "@/lib/mysteryTypes";

export function TooltipWrapper({
  character,
  mystery,
  context,
  children,
}: {
  character: Character;
  mystery: MysteryCase;
  context: MysteryContext;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  const dossier = mystery.dossiers[character.id];
  const rel = dossier?.relationships.find((r) => r.to === mystery.victim.id);
  const relLabel = rel ? rel.kind : "Unknown connection";

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 text-left shadow-xl"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{character.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{pretty(character.id)}</p>
                <p className="microlabel text-gold">{character.title}</p>
              </div>
            </div>
            <p className="mt-2 text-xs italic text-muted">{character.trait}</p>
            <p className="mt-1 text-xs text-ink/70">{character.quirk}</p>
            <div className="mt-2 border-t border-line pt-2">
              <p className="microlabel text-muted">to victim</p>
              <p className="text-xs capitalize text-ink">{relLabel}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
