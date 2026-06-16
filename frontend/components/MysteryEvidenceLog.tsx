"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MysteryCase } from "@/lib/mystery";

export default function MysteryEvidenceLog({
  mystery,
  cluesRevealed,
  onRevealNext,
}: {
  mystery: MysteryCase;
  cluesRevealed: number;
  onRevealNext: () => void;
}) {
  return (
    <div className="gilt-frame rounded-2xl bg-surface/60 p-5">
      <p className="microlabel mb-3 text-gold">
        evidence log · {cluesRevealed}/{mystery.clues.length} revealed
      </p>
      <div className="space-y-3">
        <AnimatePresence>
          {mystery.clues.slice(0, cluesRevealed).map((clue) => (
            <motion.div
              key={clue.stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-line bg-bg/40 p-4"
            >
              <p className="microlabel text-ember">{clue.kind}</p>
              <p className="display mt-1 text-base">{clue.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/85">{clue.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {cluesRevealed < mystery.clues.length && (
        <button
          onClick={onRevealNext}
          className="microlabel mt-3 rounded-full border border-line px-5 py-2 text-muted transition hover:border-gold hover:text-gold"
        >
          ✦ reveal next clue
        </button>
      )}
    </div>
  );
}
