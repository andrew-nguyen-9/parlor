"use client";

// ATLAS (G5) — a constellation LOGIC puzzle over a living star field. Six drawn
// patterns, a slate of astronomy-free omens, exactly one answer. The GeoGuessr
// loop is retired; the star catalog is the offline, zero-network local fallback
// (see lib/atlasPuzzle.ts + public/star-catalog.json). Reduced-motion aware:
// twinkle/parallax collapse to a still field.

import { useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  type AtlasPuzzle,
  type AtlasCandidate,
  type AtlasClue,
} from "@/lib/atlasPuzzle";
import { mulberry32 } from "@/lib/rng";
import styles from "./MapGame.module.css";
import CollapsiblePanel from "@/components/CollapsiblePanel";

const Confetti = dynamic(() => import("@/components/Confetti"), { ssr: false });

const ACCENT = "#178b99"; // geography — CATEGORY_HEX (single source, lib/types.ts)

// Bigger dot = brighter star (smaller magnitude). Kept in a tight band so the
// pattern reads as a figure, and the single brightest star is visibly largest —
// which is exactly what the "brightest star" omens ask the player to find.
const magToR = (mag: number) => Math.max(1.1, 3.5 - mag * 0.46);

function brightestId(c: AtlasCandidate): string {
  return c.stars.reduce((m, s) => (s.mag < m.mag ? s : m), c.stars[0]).id;
}

// One faint drifting dust field behind everything — deterministic from the day's
// seed so server + client render the same specks (no hydration drift).
function useDust(seed: number, reduce: boolean) {
  return useMemo(() => {
    const rand = mulberry32((seed ^ 0x51ed) >>> 0);
    return Array.from({ length: 90 }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 0.2 + rand() * 0.9,
      o: 0.15 + rand() * 0.5,
      d: rand() * 6,
    }));
  }, [seed]);
}

function StarFigure({
  cand,
  showName,
  reduce,
}: {
  cand: AtlasCandidate;
  showName: boolean;
  reduce: boolean;
}) {
  const pos = new Map(cand.stars.map((s) => [s.id, s]));
  const bId = brightestId(cand);
  return (
    <svg
      viewBox="0 0 100 100"
      className={styles.figure}
      role="img"
      aria-label={showName ? cand.name : "star pattern"}
    >
      {cand.lines.map(([a, b], i) => {
        const pa = pos.get(a);
        const pb = pos.get(b);
        if (!pa || !pb) return null;
        return (
          <line
            key={i}
            x1={pa.x * 100}
            y1={pa.y * 100}
            x2={pb.x * 100}
            y2={pb.y * 100}
            className={styles.line}
          />
        );
      })}
      {cand.stars.map((s, i) => {
        const isBright = s.id === bId;
        return (
          <circle
            key={s.id}
            cx={s.x * 100}
            cy={s.y * 100}
            r={magToR(s.mag)}
            className={`${styles.star} ${isBright ? styles.bright : ""} ${reduce ? "" : styles.twinkle}`}
            style={reduce ? undefined : { animationDelay: `${(i % 7) * 0.4}s` }}
          />
        );
      })}
    </svg>
  );
}

type Phase = "playing" | "won";

export default function MapGame({
  puzzle,
  requestedDate,
}: {
  puzzle: AtlasPuzzle | null;
  requestedDate?: string | null;
}) {
  const reduce = !!useReducedMotion();

  // ── Dark state: an archived date that was never generated (DB connected, no
  // row). Zero-env play always gets a puzzle inline — see getAtlasPuzzle. ──
  if (!puzzle) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-5xl opacity-70" aria-hidden>
          ✦
        </p>
        <p className="text-muted">
          {requestedDate
            ? "No star chart survives for that night in the archive."
            : "The sky is overcast. No pattern burns tonight."}
        </p>
        <p className="microlabel text-smoke">
          the atlas is charted nightly — return under clearer skies
        </p>
      </div>
    );
  }

  return <StarAtlas puzzle={puzzle} reduce={reduce} />;
}

function StarAtlas({ puzzle, reduce }: { puzzle: AtlasPuzzle; reduce: boolean }) {
  const [ruledOut, setRuledOut] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [copied, setCopied] = useState(false);

  const dust = useDust(puzzle.seed, reduce);
  const solvedCand = puzzle.candidates.find((c) => c.id === puzzle.solution)!;
  const score = Math.max(10, 100 - wrong.length * 25);

  function toggleRuleOut(id: string) {
    if (phase !== "playing") return;
    setRuledOut((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelected((s) => (s === id ? null : s));
  }

  function confirm() {
    if (phase !== "playing" || !selected) return;
    if (selected === puzzle.solution) {
      setPhase("won");
      return;
    }
    setWrong((w) => (w.includes(selected) ? w : [...w, selected]));
    setRuledOut((prev) => new Set(prev).add(selected));
    setShake(selected);
    setTimeout(() => setShake(null), 500);
    setSelected(null);
  }

  async function share() {
    const mark = wrong.length === 0 ? "🟩" : wrong.length <= 2 ? "🟨" : "⬛";
    const text = `PARLOR · Atlas ${puzzle.date}\n${mark} solved in ${wrong.length + 1} — ${score} pts\nthe pattern was ${solvedCand.name}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text }).catch(() => {});
      } else {
        await navigator.clipboard?.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* share/clipboard blocked — no-op */
    }
  }

  return (
    <div className={`${styles.wrap} ${reduce ? styles.still : ""}`}>
      {/* Living star field behind the whole room. */}
      <div className={styles.sky} aria-hidden>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.dust}>
          {dust.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#dfe7ff"
              opacity={d.o}
              className={reduce ? "" : styles.twinkle}
              style={reduce ? undefined : { animationDelay: `${d.d}s` }}
            />
          ))}
        </svg>
      </div>

      <header className={styles.head}>
        <p className="microlabel" style={{ color: ACCENT }}>
          {puzzle.skyRegion}
        </p>
        <h1 className={styles.title}>Read the omens</h1>
        <p className="text-muted text-sm">
          Six patterns hang in the dark. Exactly one obeys every omen below — name it. No
          stargazing needed; just count and reason.
        </p>
      </header>

      <div className={styles.layout}>
        {/* Omens — collapsible on small screens (F4 primitive). */}
        <CollapsiblePanel
          side="left"
          title="the omens"
          accent={ACCENT}
          storageKey="parlor:atlas-omens"
        >
          <ol className={styles.clues}>
            {puzzle.clues.map((cl: AtlasClue, i) => (
              <li key={cl.id} className={styles.clue}>
                <span className={styles.clueNum} style={{ borderColor: ACCENT, color: ACCENT }}>
                  {i + 1}
                </span>
                <span>{cl.text}</span>
              </li>
            ))}
          </ol>
          <p className="microlabel mt-3 text-smoke">
            cross off any pattern an omen rules out — one will survive them all
          </p>
        </CollapsiblePanel>

        {/* The six patterns. */}
        <div className={styles.grid} role="group" aria-label="star patterns">
          {puzzle.candidates.map((cand, idx) => {
            const isOut = ruledOut.has(cand.id);
            const isSel = selected === cand.id;
            const isWon = phase === "won";
            const isAnswer = cand.id === puzzle.solution;
            return (
              <div
                key={cand.id}
                className={[
                  styles.card,
                  isOut && !isWon ? styles.struck : "",
                  isSel ? styles.selected : "",
                  shake === cand.id ? styles.shake : "",
                  isWon && isAnswer ? styles.answer : "",
                  isWon && !isAnswer ? styles.dimmed : "",
                ].join(" ")}
                style={isSel || (isWon && isAnswer) ? { borderColor: ACCENT } : undefined}
              >
                <button
                  type="button"
                  className={styles.cardBtn}
                  aria-pressed={isSel}
                  aria-label={`Pattern ${idx + 1}${isWon ? ` — ${cand.name}` : ""}`}
                  disabled={isWon}
                  onClick={() => {
                    if (isOut) return;
                    setSelected((s) => (s === cand.id ? null : cand.id));
                  }}
                >
                  <StarFigure cand={cand} showName={isWon} reduce={reduce} />
                  <span className={styles.tag}>
                    {isWon && isAnswer ? cand.name : `pattern ${idx + 1}`}
                  </span>
                </button>
                {!isWon && (
                  <button
                    type="button"
                    className={styles.ruleBtn}
                    onClick={() => toggleRuleOut(cand.id)}
                    aria-label={
                      isOut ? `Restore pattern ${idx + 1}` : `Rule out pattern ${idx + 1}`
                    }
                  >
                    {isOut ? "restore" : "rule out"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls / result */}
      <p className="sr-only" aria-live="polite">
        {phase === "won" ? `Solved. The pattern was ${solvedCand.name}.` : ""}
      </p>

      {phase === "playing" ? (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.confirm}
            style={{ background: selected ? ACCENT : undefined }}
            disabled={!selected}
            onClick={confirm}
          >
            {selected ? "Name this pattern" : "Choose a pattern"}
          </button>
          {wrong.length > 0 && (
            <span className="microlabel text-smoke">
              {wrong.length} wrong · {score} pts at stake
            </span>
          )}
        </div>
      ) : (
        <div className={styles.result}>
          {!reduce && <Confetti active />}
          <p className="microlabel" style={{ color: ACCENT }}>
            the pattern was
          </p>
          <p className={styles.resultName}>{solvedCand.name}</p>
          <p className="text-muted text-sm">
            Solved in {wrong.length + 1} {wrong.length === 0 ? "guess" : "guesses"} · {score} points
          </p>
          <button type="button" className={styles.shareBtn} onClick={share}>
            {copied ? "copied ✦" : "share result"}
          </button>
        </div>
      )}
    </div>
  );
}
