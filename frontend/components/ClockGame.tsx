"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CATEGORY_HEX } from "@/lib/types";
import { labelFor } from "@/lib/calendars";
import type {
  ChronosPuzzle,
  ChronosConstraint,
} from "@/lib/chronosPuzzle";

// win-only canvas confetti, code-split (kept out of the room's initial bundle)
const Confetti = dynamic(() => import("@/components/Confetti"), { ssr: false });

const ACCENT = CATEGORY_HEX.music;

type Status = "ok" | "bad" | "pending";

// Live-evaluate an engraved rule against the current (possibly partial) assembly.
// "pending" = not enough wheels placed yet to judge; "bad" = contradicted.
function evalConstraint(
  c: ChronosConstraint,
  assign: Record<string, number | null>,
  stages: number,
): Status {
  const a = assign[c.a];
  const b = c.b !== undefined ? assign[c.b] : undefined;
  const needB = c.b !== undefined;
  if (a == null || (needB && b == null)) return "pending";
  switch (c.kind) {
    case "first":
      return a === 1 ? "ok" : "bad";
    case "last":
      return a === stages ? "ok" : "bad";
    case "fixed":
      return a === c.k ? "ok" : "bad";
    case "before":
      return (b as number) > a ? "ok" : "bad";
    case "imm-before":
      return (b as number) === a + 1 ? "ok" : "bad";
    case "gap":
      return (b as number) - a === (c.k ?? 0) ? "ok" : "bad";
    case "adjacent":
      return Math.abs(a - (b as number)) === 1 ? "ok" : "bad";
    case "parity":
      return (c.flag === "even") === (a % 2 === 0) ? "ok" : "bad";
    default:
      return "pending";
  }
}

export default function ClockGame({
  puzzle,
  requestedDate,
}: {
  puzzle: ChronosPuzzle | null;
  requestedDate?: string | null;
}) {
  // Dark state — the archive is unreachable. Never throw; the room stays whole.
  if (!puzzle) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface/60 p-8 text-center">
        <p className="text-2xl" aria-hidden>
          ⚙
        </p>
        <p className="mt-3 microlabel text-muted">the mechanism is silent</p>
        <p className="mt-2 text-sm text-muted">
          {requestedDate
            ? "No clockwork was wound for that day."
            : "The archive is unreachable right now — wind it again shortly."}
        </p>
      </div>
    );
  }
  return <Box puzzle={puzzle} />;
}

function Box({ puzzle }: { puzzle: ChronosPuzzle }) {
  const { gears, constraints, stages, solution, calendarSkin } = puzzle;
  const stageList = useMemo(
    () => Array.from({ length: stages }, (_, i) => i + 1),
    [stages],
  );

  // assignment: gearKey → stage (null = still in the tray)
  const [assign, setAssign] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(gears.map((g) => [g.key, null])),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [peek, setPeek] = useState(false); // trivia shortcut flap
  const [solved, setSolved] = useState(false);

  const stageToGear = useMemo(() => {
    const m: Record<number, string> = {};
    for (const g of gears) {
      const st = assign[g.key];
      if (st != null) m[st] = g.key;
    }
    return m;
  }, [assign, gears]);

  const gearOf = (k: string) => gears.find((g) => g.key === k)!;
  const placedCount = Object.values(assign).filter((v) => v != null).length;
  const full = placedCount === stages;

  // check for the win whenever a full assembly is reached
  useEffect(() => {
    if (!full) {
      setSolved(false);
      return;
    }
    const win = Object.entries(solution).every(([k, st]) => assign[k] === st);
    setSolved(win);
    if (win && typeof window !== "undefined") {
      try {
        localStorage.setItem(`parlor:chronos:${puzzle.date}`, "solved");
      } catch {
        /* private mode — scores are cosmetic, never block play */
      }
    }
  }, [full, assign, solution, puzzle.date]);

  function placeAt(stage: number) {
    setSelected((sel) => {
      if (sel == null) {
        // no wheel in hand — lift the one already at this stage back to the tray
        const occupant = stageToGear[stage];
        if (occupant) setAssign((a) => ({ ...a, [occupant]: null }));
        return null;
      }
      setAssign((a) => {
        const next = { ...a };
        // if another wheel sits here, bump it back to the tray
        const occupant = Object.keys(next).find((k) => next[k] === stage);
        if (occupant) next[occupant] = null;
        next[sel] = stage;
        return next;
      });
      return null;
    });
  }

  function toggleTray(k: string) {
    if (assign[k] != null) {
      setAssign((a) => ({ ...a, [k]: null })); // pull a placed wheel back
      setSelected(null);
      return;
    }
    setSelected((s) => (s === k ? null : k));
  }

  function reset() {
    setAssign(Object.fromEntries(gears.map((g) => [g.key, null])));
    setSelected(null);
  }

  const trayGears = gears.filter((g) => assign[g.key] == null);

  return (
    <div className="mx-auto max-w-3xl">
      <Confetti active={solved} />

      {/* header plate */}
      <div className="rounded-2xl border border-line bg-surface/50 p-4 text-center">
        <p className="microlabel" style={{ color: ACCENT }}>
          {puzzle.mechanism}
        </p>
        <p className="mt-1 text-sm text-muted">{puzzle.provenance}</p>
        <p className="mt-2 text-xs text-muted">
          Dial skin: {calendarSkin.name} {calendarSkin.glyph} · assemble the train
          from mainspring to dial.
        </p>
      </div>

      {/* THE TRAIN — the stage slots */}
      <div className="mt-5">
        <p className="microlabel text-muted">the train · stage 1 winds the mainspring</p>
        <div className="mt-2 flex flex-wrap items-stretch gap-2">
          {stageList.map((stage) => {
            const occ = stageToGear[stage];
            const g = occ ? gearOf(occ) : null;
            return (
              <button
                key={stage}
                onClick={() => placeAt(stage)}
                aria-label={
                  g
                    ? `Stage ${stage}: ${g.label}. Tap to clear.`
                    : `Stage ${stage}, empty. Tap to place the selected wheel.`
                }
                className="flex min-h-[88px] min-w-[88px] flex-1 flex-col items-center justify-center rounded-xl border p-2 transition"
                style={{
                  borderColor: g ? ACCENT : undefined,
                  background: g ? `${ACCENT}14` : undefined,
                }}
              >
                <span className="microlabel text-muted">stage {stage}</span>
                {g ? (
                  <>
                    <span className="mt-1 text-2xl" aria-hidden>
                      {g.glyph}
                    </span>
                    <span className="text-center text-xs">{g.label}</span>
                  </>
                ) : (
                  <span className="mt-1 text-2xl text-muted" aria-hidden>
                    ◌
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* THE TRAY — unplaced wheels */}
      <div className="mt-5">
        <p className="microlabel text-muted">
          {selected ? "tap a stage to seat this wheel" : "the wheel-tray · tap to pick up"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2" aria-live="polite">
          {trayGears.length === 0 && (
            <span className="text-sm text-muted">every wheel is seated.</span>
          )}
          {trayGears.map((g) => (
            <button
              key={g.key}
              onClick={() => toggleTray(g.key)}
              aria-pressed={selected === g.key}
              className="flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm transition"
              style={{
                borderColor: selected === g.key ? ACCENT : undefined,
                background: selected === g.key ? `${ACCENT}22` : undefined,
              }}
            >
              <span className="text-lg" aria-hidden>
                {g.glyph}
              </span>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* THE BACKPLATE — engraved constraints, live-checked */}
      <div className="mt-6 rounded-2xl border border-line bg-surface/40 p-4">
        <p className="microlabel text-muted">the backplate · engraved rules</p>
        <ul className="mt-2 space-y-1.5">
          {constraints.map((c, i) => {
            const st = evalConstraint(c, assign, stages);
            const mark = st === "ok" ? "✓" : st === "bad" ? "✕" : "·";
            const color =
              st === "ok" ? ACCENT : st === "bad" ? "#c0392b" : undefined;
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span
                  aria-hidden
                  className="mt-0.5 w-4 text-center"
                  style={{ color }}
                >
                  {mark}
                </span>
                <span className={st === "bad" ? "text-muted line-through" : ""}>
                  {c.text}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* OPTIONAL TRIVIA SHORTCUT — never needed, only faster */}
      <div className="mt-4 rounded-2xl border border-dashed border-line p-4">
        <button
          onClick={() => setPeek((p) => !p)}
          className="microlabel flex min-h-[44px] items-center gap-2"
          aria-expanded={peek}
        >
          <span aria-hidden>{peek ? "▾" : "▸"}</span> cheat with history (optional)
        </button>
        {peek && (
          <div className="mt-2 text-sm text-muted">
            <p>{puzzle.triviaHint}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {gears.map((g) => (
                <li key={g.key}>
                  <span aria-hidden>{g.glyph}</span> {g.label}:{" "}
                  <span style={{ color: ACCENT }}>
                    {labelFor(calendarSkin.key, g.cast)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs">
              Assembled, the train points its dial to{" "}
              {labelFor(calendarSkin.key, puzzle.dialYear)}.
            </p>
          </div>
        )}
      </div>

      {/* verdict + controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={reset}
          className="min-h-[44px] rounded-full border border-line px-5 py-2 text-sm transition hover:border-brass"
        >
          Strip the train
        </button>
        <p className="text-sm" aria-live="assertive">
          {solved ? (
            <span style={{ color: ACCENT }}>
              The escapement ticks. The mechanism runs true.
            </span>
          ) : full ? (
            <span className="text-muted">
              It jams — a wheel is out of order. Re-read the backplate.
            </span>
          ) : (
            <span className="text-muted">
              {placedCount}/{stages} wheels seated.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
