"use client";

import { useMemo, useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useAnimationControls,
} from "framer-motion";
import { pickRotating } from "@/lib/rng";
import { CATEGORY_HEX, type Question, type ThreadLink } from "@/lib/types";
import { buildShare, type Tier } from "@/lib/share";
import { sfxCorrect, sfxWrong, sfxPianoChord, sfx, audio } from "@/lib/sound";
import { AmbientGlow, Ornament } from "@/components/atmosphere";
import styles from "./ThreadGame.module.css";

// The Weaver / Seamstress of the Order hosts THE THREAD (character canon — see
// docs/v2/GAMES.md). Nameplate placeholder, mirrors lib/themes.ts BOARD_HOST.
const WEAVER = { name: "The Weaver", title: "Seamstress of the Order" };

const THREAD_HEX = CATEGORY_HEX.history; // brass thread

// A solved link is one of three tiers, reused verbatim by lib/share.ts:
//   hit  — solved clean (no hint)        🟩
//   near — solved, but a hint was spent  🟨   ← the hint's cost
//   miss — revealed / wrong              ⬛
type Resolved = "hit" | "near" | "miss";
type LinkState = "pending" | Resolved;

const KNOT: Record<LinkState | "active", string> = {
  pending: "#26263a",
  active: THREAD_HEX,
  hit: "#2d9155",
  near: "#c79a3a",
  miss: "#b22b2b",
};

interface Node {
  link: ThreadLink;
  state: LinkState;
}

/** Build a fallback chain from raw clue questions when no forged thread exists,
 *  so the room is never empty. # ponytail: fallback links share no real theme —
 *  the master theme is a generic placeholder; the forged thread is the real game. */
function fallbackThread(clues: Question[]): Question | null {
  const picked = pickRotating(clues, 5);
  if (picked.length < 3) return null;
  return {
    qtype: "thread",
    category: "history",
    difficulty: 3,
    prompt: "What is the thread that ties them all together?",
    correct: "The Archive",
    theme: "The Archive",
    theme_choices: ["The Archive", "The Voyage", "The Cosmos", "Egypt"],
    chain: picked.map((q) => ({
      prompt: q.prompt,
      answer: q.correct,
      link: "Drawn from the same nightly archive.",
    })),
  };
}

/** The letter that actually passes the thread forward — last A-Z char, mirrors
 *  pipeline's _chain_key (forge_thread). More useful than a first-letter hint:
 *  it's the one piece every player needs to keep weaving. */
function passingLetter(answer: string): string {
  const letters = answer.replace(/[^a-zA-Z]/g, "");
  return (letters || answer).slice(-1).toUpperCase();
}

/** First A-Z char of an answer — the letter a preceding link would pass forward. */
function firstLetter(answer: string): string {
  const letters = answer.replace(/[^a-zA-Z]/g, "");
  return (letters || answer).slice(0, 1).toUpperCase();
}

/** Forgiving match: trimmed equality, substring either way, or first-word hit. */
function isMatch(guess: string, answer: string): boolean {
  const g = guess.trim().toLowerCase();
  const a = answer.toLowerCase();
  return (
    g.length > 1 &&
    (g === a || a.includes(g) || g.includes(a.split(" ")[0]))
  );
}

// Hint ladder — each press spends the clean-solve tier (hit → near) once and
// escalates the help. Level 1: the tie (why this answer belongs to the theme).
// Level 2: the letter scaffold (first + passing letter + word/length shape).
const MAX_HINT = 2;

/** Answer skeleton: one glyph per character, letters shown as slots. The first
 *  and last A-Z letters are filled (they're the thread's warp+weft the room is
 *  built around); every other letter is a blank. Spaces/punctuation pass through
 *  so word shape reads at a glance. Pure — the letter-scaffold assist. */
function scaffold(answer: string): { ch: string; filled: boolean }[] {
  const idx = [...answer].map((c, i) => (/[a-zA-Z]/.test(c) ? i : -1)).filter((i) => i >= 0);
  const first = idx[0];
  const last = idx[idx.length - 1];
  return [...answer].map((c, i) => {
    if (!/[a-zA-Z]/.test(c)) return { ch: c === " " ? "  " : c, filled: false };
    if (i === first || i === last) return { ch: c.toUpperCase(), filled: true };
    return { ch: "_", filled: false };
  });
}

export default function ThreadGame({
  threads,
  clues,
}: {
  threads: Question[];
  clues: Question[];
}) {
  const reduced = useReducedMotion();

  // Date-seeded daily pick among the available forged threads (SSR/client agree).
  const puzzle = useMemo<Question | null>(() => {
    if (threads.length) return pickRotating(threads, 1)[0] ?? null;
    return fallbackThread(clues);
  }, [threads, clues]);

  const chain = puzzle?.chain ?? [];
  const themeChoices = puzzle?.theme_choices ?? [];
  const theme = puzzle?.theme ?? puzzle?.correct ?? "";

  const [nodes, setNodes] = useState<Node[]>(
    chain.map((link) => ({ link, state: "pending" })),
  );
  const [active, setActive] = useState(0);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0); // wrong tries on the active link
  const [retry, setRetry] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0); // 0=none, 1=tie, 2=scaffold
  const [phase, setPhase] = useState<"chain" | "final" | "done">("chain");
  const [themeGuess, setThemeGuess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shake = useAnimationControls(); // wrong-guess wobble on the input row

  // --- THE LOOM: measured SVG woven thread through the knots (see .module.css) --
  const railRef = useRef<HTMLDivElement>(null);
  const knotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [centers, setCenters] = useState<{ x: number; y: number }[]>([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (phase === "chain") inputRef.current?.focus();
  }, [active, phase]);

  // F1 audio kit: the loom's ambient bed for the room's lifetime (mount → unmount).
  useEffect(() => {
    audio.startAmbient("thread");
    return () => audio.stopAmbient();
  }, []);

  // Measure each knot's centre relative to the rail so the thread can be woven
  // exactly through them (knot rows are variable-height — the active one is tall
  // — so positions must be measured, not assumed even). Re-runs on any layout
  // shift (state/phase) and on resize.
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => {
      const rb = rail.getBoundingClientRect();
      const cs = knotRefs.current
        .slice(0, nodes.length)
        .map((el) => {
          if (!el) return null;
          const b = el.getBoundingClientRect();
          return { x: b.left - rb.left + b.width / 2, y: b.top - rb.top + b.height / 2 };
        })
        .filter((c): c is { x: number; y: number } => c !== null);
      setCenters(cs);
      setDims({ w: rb.width, h: rb.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, active, phase, hintLevel, retry]);

  // Full faint thread top→bottom through every knot (a lead-in from the top edge
  // and a tail to the bottom keep the warp continuous). One continuous path.
  // `bow` is a hoisted function declaration below — must stay a hook, above the
  // early return, to keep hook order stable.
  const basePath = useMemo(() => {
    if (centers.length === 0) return "";
    const pts = [
      { x: centers[0].x, y: 0 },
      ...centers,
      { x: centers[centers.length - 1].x, y: dims.h },
    ];
    return (
      `M ${pts[0].x} ${pts[0].y} ` +
      pts.slice(1).map((p, i) => bow(pts[i], p)).join(" ")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centers, dims.h]);

  if (!puzzle || chain.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-4xl">🧵</p>
        <p className="text-muted">The thread is not yet spun.</p>
        <p className="microlabel">check back once the nightly forge runs</p>
      </div>
    );
  }

  // A gentle S-weave (cubic control points, no leading M) between two points —
  // the horizontal bow is what makes the thread read as woven rather than a
  // plain rule. Amplitude stays small so it never leaves the knot gutter (no
  // x-overflow at any breakpoint).
  function bow(a: { x: number; y: number }, b: { x: number; y: number }): string {
    const dy = b.y - a.y;
    const amp = Math.min(7, Math.abs(dy) / 3);
    return `C ${a.x - amp} ${a.y + dy * 0.34}, ${b.x + amp} ${a.y + dy * 0.66}, ${b.x} ${b.y}`;
  }

  // The coloured segment that "weaves in" when a link resolves (or reaches the
  // active knot): from the previous knot — or the top edge for the first — down
  // to knot i.
  function segment(i: number): string {
    const b = centers[i];
    if (!b) return "";
    const a = i === 0 ? { x: b.x, y: 0 } : centers[i - 1];
    if (!a) return "";
    return `M ${a.x} ${a.y} ${bow(a, b)}`;
  }

  function resolve(state: Resolved) {
    setNodes((ns) => ns.map((n, i) => (i === active ? { ...n, state } : n)));
    setInput("");
    setAttempts(0);
    setRetry(null);
    setHintLevel(0);
    if (active + 1 >= chain.length) {
      sfxPianoChord();
      setPhase("final");
    } else {
      setActive((a) => a + 1);
    }
  }

  function handleGuess() {
    if (nodes[active]?.state !== "pending") return;
    if (!isMatch(input, nodes[active].link.answer)) {
      sfxWrong();
      if (!reduced) shake.start({ x: [0, -7, 6, -4, 3, 0], transition: { duration: 0.32 } });
      // First miss is forgiven — one wrong guess shouldn't kill the loosest
      // input in the game. The second wrong guess unravels the link.
      if (attempts < 1) {
        setAttempts(1);
        setInput("");
        setRetry("not quite — one more stitch");
        return;
      }
      resolve("miss"); // the answer is shown
      return;
    }
    sfxCorrect();
    resolve(hintLevel > 0 ? "near" : "hit"); // a spent hint downgrades hit → near
  }

  // The hint ladder: each press spends the clean-solve tier (hit → near) and
  // escalates. L1 reveals the tie (the thematic clue, otherwise hidden until
  // solved); L2 reveals the letter scaffold + passing letter. Softest → strongest.
  function hint() {
    if (nodes[active]?.state !== "pending" || hintLevel >= MAX_HINT) return;
    sfx.tick();
    setHintLevel((h) => h + 1);
    inputRef.current?.focus();
  }

  function reveal() {
    if (nodes[active]?.state !== "pending") return;
    sfxWrong();
    resolve("miss");
  }

  function guessTheme(choice: string) {
    setThemeGuess(choice);
    if (choice === theme) sfxCorrect();
    else sfxWrong();
    audio.stinger(); // the tapestry is complete — F1 audio completion flourish
    setPhase("done");
  }

  const solved = nodes.filter((n) => n.state === "hit" || n.state === "near").length;
  const clean = nodes.filter((n) => n.state === "hit").length;
  const themeRight = themeGuess === theme;
  const solvedPct = Math.round((solved / chain.length) * 100);

  // Share via the canonical seam (lib/share.ts): one tier per link + a trailing
  // square for the theme guess, on one row. The headline is the solved-% chain.
  function threadCard() {
    const date = new Date().toISOString().slice(0, 10);
    const tiers: Tier[] = [
      ...nodes.map((n) => (n.state === "pending" ? "miss" : n.state) as Tier),
      themeRight ? "hit" : "miss",
    ];
    return buildShare({
      room: "/thread",
      date,
      tiers,
      score: solved,
      maxScore: chain.length,
      columns: chain.length + 1,
    });
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(threadCard().text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the grid is on screen anyway */
    }
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      {/* F1 atmosphere: a static golden-thread wash behind the whole loom — no
          animate (the woven SVG thread above is the room's one motion loop). */}
      <AmbientGlow
        className="-z-10"
        intensity={0.3}
        color="rgb(var(--c-gold))"
        position="50% 0%"
      />

      {/* Weaver nameplate */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70" style={{ color: THREAD_HEX }}>
            🧵
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{WEAVER.name}</p>
            <p className="microlabel text-smoke">{WEAVER.title}</p>
          </div>
        </div>
        <span className="microlabel tabular" style={{ color: THREAD_HEX }}>
          {phase === "chain"
            ? `link ${active + 1} / ${chain.length}`
            : `${solved}/${chain.length} woven`}
        </span>
      </div>

      {/* Loom instruction — spelled out in weaving terms so the mechanic reads at
          a glance (the deliberate difficulty drop this cycle). */}
      <p className="microlabel mb-3 text-smoke">
        Work the loom top to bottom: each answer&rsquo;s last letter is the weft
        that starts the next stitch along the warp.
      </p>

      {/* golden-thread flourish — static gold divider (F1 ornament kit) */}
      <Ornament
        variant="flourish"
        treatment="gold"
        size={16}
        className="mx-auto mb-4 block opacity-80"
      />

      {/* THE RAIL — every link, resolved ones revealed in place, the active one
          expanded with its input. This single list is the whole game. The woven
          SVG thread is drawn through the knots (measured), weaving in a coloured
          segment each time a stitch resolves. */}
      <div ref={railRef} className={styles.rail}>
        {dims.w > 0 && basePath && (
          <svg
            className={styles.thread}
            width={dims.w}
            height={dims.h}
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            fill="none"
            aria-hidden="true"
          >
            {/* the full warp, faint */}
            <path d={basePath} className={styles.warp} />
            {/* a single sheen travelling down the warp — the shuttle pass */}
            {!reduced && <path d={basePath} className={styles.sheen} />}
            {/* each resolved (or active) stitch weaves in its coloured segment */}
            {nodes.map((n, i) => {
              const done = n.state !== "pending";
              const isActive = phase === "chain" && i === active;
              if (!done && !isActive) return null;
              if (!centers[i]) return null;
              const color = done ? KNOT[n.state] : KNOT.active;
              return (
                <motion.path
                  key={`seg-${i}-${n.state}`}
                  d={segment(i)}
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
                  initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
                />
              );
            })}
          </svg>
        )}

        {nodes.map((n, i) => {
          const isActive = phase === "chain" && i === active;
          const knot =
            n.state === "pending" ? (isActive ? KNOT.active : KNOT.pending) : KNOT[n.state];
          const done = n.state !== "pending";
          const future = n.state === "pending" && !isActive;
          return (
            <div key={i} className={styles.link} style={{ ["--knot" as string]: knot }}>
              <span
                ref={(el) => {
                  knotRefs.current[i] = el;
                }}
                className={`${styles.knot} ${
                  done ? styles.knotDone : isActive ? styles.knotActive : ""
                }`}
              >
                {n.state === "hit" ? "✓" : n.state === "near" ? "◆" : n.state === "miss" ? "✕" : i + 1}
              </span>

              <div className={styles.body}>
                {future && (
                  <p className="py-1 text-sm text-smoke">
                    link {i + 1} — not yet spun
                  </p>
                )}

                {done && (
                  <>
                    <p className="font-medium leading-snug text-ink">
                      {n.link.answer}
                    </p>
                    <p className={`${styles.tie} microlabel mt-0.5 text-smoke`}>
                      {n.link.link}
                    </p>
                  </>
                )}

                {isActive && (
                  <motion.div
                    key={`active-${i}`}
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-lg font-medium leading-snug text-ink">
                      {n.link.prompt}
                    </p>
                    {/* Letter-chain tell: only when the forged chain actually
                        passes the prior answer's last letter into this one. */}
                    {active > 0 &&
                      passingLetter(nodes[active - 1].link.answer) ===
                        firstLetter(n.link.answer) && (
                        <p className="microlabel mt-2 text-smoke">
                          begins with &ldquo;{firstLetter(n.link.answer)}&rdquo;
                        </p>
                      )}

                    {/* HINT L1 — the tie: why this answer belongs to the theme. */}
                    {hintLevel >= 1 && (
                      <motion.p
                        initial={reduced ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="microlabel mt-2 leading-snug text-smoke"
                      >
                        <span style={{ color: THREAD_HEX }}>clue&nbsp;·&nbsp;</span>
                        {n.link.link}
                      </motion.p>
                    )}

                    {/* HINT L2 — the letter scaffold + passing letter. */}
                    {hintLevel >= 2 && (
                      <motion.div
                        initial={reduced ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2"
                      >
                        <div className={styles.scaffold}>
                          {scaffold(n.link.answer).map((s, k) => (
                            <span
                              key={k}
                              className={s.filled ? styles.slotFilled : styles.slot}
                              style={s.filled ? { color: THREAD_HEX } : undefined}
                            >
                              {s.ch}
                            </span>
                          ))}
                        </div>
                        <p className="microlabel mt-1 text-smoke">
                          passes the thread on &ldquo;{passingLetter(n.link.answer)}…&rdquo;
                        </p>
                      </motion.div>
                    )}

                    {retry && (
                      <p className="microlabel mt-2 text-music">{retry}</p>
                    )}
                    <motion.div className="mt-3 flex gap-2" animate={shake}>
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                        placeholder="name this stitch…"
                        className="flex-1 rounded-xl border border-line bg-bg px-4 py-2.5 text-ink placeholder:text-muted focus:border-brass focus:outline-none"
                      />
                      <button
                        onClick={handleGuess}
                        disabled={!input.trim()}
                        className="microlabel rounded-xl border border-line bg-surface px-4 py-2.5 transition hover:border-brass disabled:opacity-40"
                        style={{ color: THREAD_HEX }}
                      >
                        stitch →
                      </button>
                    </motion.div>
                    <div className="mt-2 flex gap-4">
                      <button
                        onClick={hint}
                        disabled={hintLevel >= MAX_HINT}
                        className="microlabel text-smoke transition hover:text-muted disabled:opacity-40"
                      >
                        {hintLevel === 0
                          ? "hint (costs a clean stitch)"
                          : hintLevel < MAX_HINT
                            ? "more help →"
                            : "hint spent"}
                      </button>
                      <button
                        onClick={reveal}
                        className="microlabel text-smoke transition hover:text-muted"
                      >
                        reveal answer
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* the final stitch + the reveal live at the foot of the same rail */}
      <AnimatePresence mode="wait">
        {phase === "final" && (
          <motion.div
            key="final"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl border border-line bg-surface p-5 text-center"
            style={{ boxShadow: `0 0 50px ${THREAD_HEX}22` }}
          >
            <p className="microlabel tracking-widest" style={{ color: THREAD_HEX }}>
              the final stitch
            </p>
            <p className="mt-2 text-lg font-medium text-ink">{puzzle.prompt}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {themeChoices.map((c) => (
                <button
                  key={c}
                  onClick={() => guessTheme(c)}
                  className="rounded-xl border border-line bg-bg px-4 py-3 text-ink transition hover:border-brass"
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-5 flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-center"
            style={{ boxShadow: `0 0 50px ${THREAD_HEX}22` }}
          >
            {/* the tapestry reveal — static gold corners frame the finished weave */}
            <Ornament
              variant="corner"
              treatment="gold"
              size={28}
              className="absolute left-2 top-2 opacity-70"
            />
            <Ornament
              variant="corner"
              treatment="gold"
              size={28}
              className="absolute right-2 top-2 opacity-70"
              style={{ transform: "scaleX(-1)" }}
            />
            <p className="microlabel tracking-widest text-brass">thread woven</p>
            <p className="display text-3xl" style={{ color: THREAD_HEX }}>
              {theme}
            </p>
            <pre className="whitespace-pre text-center text-lg leading-none tracking-widest">
              {threadCard().grid}
            </pre>
            <p className="text-sm text-muted">
              {solvedPct}% woven · {clean} clean · theme {themeRight ? "found" : "missed"}
            </p>
            <button
              onClick={share}
              className="microlabel rounded-full border px-6 py-2.5 transition"
              style={{ borderColor: THREAD_HEX, color: THREAD_HEX }}
            >
              {copied ? "copied ✓" : "share the thread"}
            </button>
            <p className="microlabel text-smoke">
              ✦ parlor · the thread ·{" "}
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
