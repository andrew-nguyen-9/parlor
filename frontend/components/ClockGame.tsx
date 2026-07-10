"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import ThreeStage from "@/components/ThreeStage";
import { AmbientGlow, ParticleField } from "@/components/atmosphere";
import { audio } from "@/lib/sound";
import { CATEGORY_HEX } from "@/lib/types";
import { labelFor } from "@/lib/calendars";
import {
  runningMarks,
  type ChronosPuzzle,
  type ChronosGear,
} from "@/lib/chronosPuzzle";
import styles from "./ClockGame.module.css";

// win-only canvas confetti, code-split (kept out of the room's initial bundle)
const Confetti = dynamic(() => import("@/components/Confetti"), { ssr: false });

const ACCENT = CATEGORY_HEX.music;
const BRASS = 0xb08d57;
const STEEL = 0xcfd4da; // mirror-polished bridge
const RUBY = 0x9b1b2e; // synthetic ruby jewel bearings
const BLUED = 0x24347a; // anodized blue screws

type Status = "ok" | "bad" | "pending";

// Running index at each shaft for the current (possibly partial) assignment. A shaft
// is only judgeable once every shaft up to and including it is filled (the train is
// serial — an upstream gap leaves the index undefined downstream).
function shaftStatuses(
  puzzle: ChronosPuzzle,
  seatedTeeth: (number | null)[],
): Status[] {
  const firstGap = seatedTeeth.findIndex((t) => t == null);
  const filledCount = firstGap === -1 ? seatedTeeth.length : firstGap;
  const marks = runningMarks(
    seatedTeeth.slice(0, filledCount).map((t) => t as number),
    puzzle.drive,
    puzzle.dialTeeth,
  );
  return puzzle.shafts.map((s, i) => {
    if (i >= filledCount) return "pending";
    return marks[i] === s.target ? "ok" : "bad";
  });
}

// ── 3D: a brass cog from an extruded tooth profile (kinematic backdrop only) ──────
function cogShape(teeth: number, rTip: number, rRoot: number, rHole: number) {
  const shape = new THREE.Shape();
  const pitch = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * pitch;
    const pts: [number, number][] = [
      [rRoot, a],
      [rTip, a + pitch * 0.25],
      [rTip, a + pitch * 0.5],
      [rRoot, a + pitch * 0.72],
    ];
    for (const [r, ang] of pts) {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && r === rRoot && ang === a) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, rHole, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function makeCog(
  teeth: number,
  opts: { color: number; emissive: number; opacity: number },
) {
  const geo = new THREE.ExtrudeGeometry(cogShape(teeth, 1.0, 0.82, 0.2), {
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 1,
  });
  geo.center();
  const mat = new THREE.MeshStandardMaterial({
    color: opts.color,
    emissive: opts.emissive,
    emissiveIntensity: opts.emissive ? 0.5 : 0,
    metalness: 0.9,
    roughness: 0.38,
    transparent: opts.opacity < 1,
    opacity: opts.opacity,
  });
  return new THREE.Mesh(geo, mat);
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
  return <Mechanism puzzle={puzzle} />;
}

function Mechanism({ puzzle }: { puzzle: ChronosPuzzle }) {
  const { gears, shafts, calendarSkin, dialTeeth } = puzzle;
  const stages = shafts.length;

  // assignment: gearKey → shaft index 1..S (null = still in the tray)
  const [assign, setAssign] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(gears.map((g) => [g.key, null])),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [peek, setPeek] = useState(false);
  const [solved, setSolved] = useState(false);
  const wasSolved = useRef(false);

  // Watch-shop bed while the room is open; teardown silences it. Discrete SFX are
  // fired at the interaction sites; the F1 manager no-ops under mute/reduced-motion.
  useEffect(() => {
    audio.startAmbient("clock");
    return () => audio.stopAmbient();
  }, []);

  const gearOf = (k: string) => gears.find((g) => g.key === k)!;

  // teeth seated at each shaft (index-1), null where empty
  const seatedTeeth = useMemo(() => {
    const arr: (number | null)[] = new Array(stages).fill(null);
    for (const g of gears) {
      const s = assign[g.key];
      if (s != null) arr[s - 1] = g.teeth;
    }
    return arr;
  }, [assign, gears, stages]);

  const statuses = useMemo(
    () => shaftStatuses(puzzle, seatedTeeth),
    [puzzle, seatedTeeth],
  );

  const placedCount = seatedTeeth.filter((t) => t != null).length;
  const full = placedCount === stages;

  useEffect(() => {
    if (!full) {
      setSolved(false);
      wasSolved.current = false;
      return;
    }
    const win = statuses.every((s) => s === "ok");
    setSolved(win);
    // Ceremony fires once on the transition into the solved state — the movement
    // comes alive (stinger); a full-but-jammed train reads as a mechanical fault.
    if (win && !wasSolved.current) audio.stinger();
    else if (!win) audio.sfx("wrong");
    wasSolved.current = win;
    if (win && typeof window !== "undefined") {
      try {
        localStorage.setItem(`parlor:chronos:${puzzle.date}`, "solved");
      } catch {
        /* private mode — scores are cosmetic, never block play */
      }
    }
  }, [full, statuses, puzzle.date]);

  const stageToGear = useMemo(() => {
    const m: Record<number, string> = {};
    for (const g of gears) {
      const s = assign[g.key];
      if (s != null) m[s] = g.key;
    }
    return m;
  }, [assign, gears]);

  // ── the 3D train ────────────────────────────────────────────────────────────
  // ThreeStage.setup runs once; we re-run it on every placement by keying the stage
  // on the arrangement + correctness signature. Human tap cadence makes a renderer
  // re-init cheap, and it keeps the reduced-motion still frame in sync too.
  // ponytail: keyed remount, not a live scene diff — swap to a stateRef diff only if
  // re-init cost ever shows on a device.
  const stageKey = useMemo(
    () =>
      shafts
        .map((s) => {
          const occ = stageToGear[s.index];
          return `${occ ?? "-"}:${statuses[s.index - 1]}`;
        })
        .join("|") + (solved ? "!" : ""),
    [shafts, stageToGear, statuses, solved],
  );

  const setup = useMemo(() => {
    const spacing = 2.35;
    const yOf = (shaftIndex: number) =>
      (shaftIndex - 1) * spacing - ((stages - 1) * spacing) / 2;

    return () => {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x161009);

      scene.add(new THREE.AmbientLight(0xffe9c8, 0.55));
      const key = new THREE.DirectionalLight(0xfff2d8, 1.15);
      key.position.set(3, 4, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x88aaff, 0.35);
      rim.position.set(-4, -2, 3);
      scene.add(rim);

      const accent = new THREE.Color(ACCENT);
      const spinners: { obj: THREE.Object3D; rate: number }[] = [];

      // Mirror-polished steel bridge spanning the train, set behind the wheels,
      // with anodized-blue screws at either end — the "beautiful engineering" plate.
      const span = (stages - 1) * spacing;
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, span + 1.9, 0.16),
        new THREE.MeshStandardMaterial({ color: STEEL, metalness: 0.96, roughness: 0.16 }),
      );
      bridge.position.set(0, 0, -0.65);
      scene.add(bridge);
      for (const sy of [-(span / 2 + 0.7), span / 2 + 0.7]) {
        const screw = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 14, 14),
          new THREE.MeshStandardMaterial({
            color: BLUED,
            metalness: 0.85,
            roughness: 0.28,
            emissive: 0x0a1440,
            emissiveIntensity: 0.35,
          }),
        );
        screw.position.set(0, sy, -0.5);
        scene.add(screw);
      }

      for (const shaft of shafts) {
        const occ = gears.find((g) => assign[g.key] === shaft.index);
        const y = yOf(shaft.index);
        const x = shaft.index % 2 === 0 ? 0.42 : -0.42; // gentle snake so cogs mesh
        if (occ) {
          const st = statuses[shaft.index - 1];
          const cog = makeCog(occ.teeth, {
            color: BRASS,
            emissive:
              st === "ok" ? accent.getHex() : st === "bad" ? 0x772222 : 0,
            opacity: 1,
          });
          cog.position.set(x, y, 0);
          scene.add(cog);
          // synthetic-ruby jewel bearing on the arbor — brighter once it meshes true
          const jewel = new THREE.Mesh(
            new THREE.SphereGeometry(0.17, 16, 16),
            new THREE.MeshStandardMaterial({
              color: RUBY,
              emissive: 0xff2d4a,
              emissiveIntensity: st === "ok" ? 0.95 : 0.25,
              metalness: 0.1,
              roughness: 0.14,
              transparent: true,
              opacity: 0.88,
            }),
          );
          jewel.position.set(x, y, 0.22);
          scene.add(jewel);
          const dir = shaft.index % 2 === 0 ? 1 : -1;
          spinners.push({
            obj: cog,
            rate: dir * (0.9 + 24 / occ.teeth) * (solved ? 2.2 : 0.35),
          });
        } else {
          const ghost = makeCog(24, { color: 0x4a4038, emissive: 0, opacity: 0.28 });
          ghost.position.set(x, y, -0.1);
          scene.add(ghost);
        }
      }

      // the dial notch marker on the output shaft (top)
      const outIdx = stages;
      const outY = yOf(outIdx);
      const outX = outIdx % 2 === 0 ? 0.42 : -0.42;
      const target = shafts[outIdx - 1].target;
      const notchAng = (target / dialTeeth) * Math.PI * 2 + Math.PI / 2;
      const notch = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshStandardMaterial({
          color: accent,
          emissive: accent,
          emissiveIntensity: 0.9,
        }),
      );
      notch.position.set(
        outX + Math.cos(notchAng) * 1.25,
        outY + Math.sin(notchAng) * 1.25,
        0.2,
      );
      scene.add(notch);

      // Completion ceremony: a balance wheel appears by the output shaft and, in
      // onFrame, oscillates like a beating escapement — "the watch ticks alive".
      if (solved) {
        const balance = new THREE.Mesh(
          new THREE.TorusGeometry(0.85, 0.06, 10, 40),
          new THREE.MeshStandardMaterial({
            color: BRASS,
            emissive: accent,
            emissiveIntensity: 0.45,
            metalness: 0.9,
            roughness: 0.3,
          }),
        );
        balance.position.set(outX, outY, 0.45);
        scene.add(balance);
        scene.userData.balance = balance;
      }

      scene.userData.spinners = spinners;

      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      const radius = ((stages - 1) * spacing) / 2 + 2.0;
      return { scene, camera, radius, center: new THREE.Vector3(0, 0, 0) };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageKey]);

  const onFrame = useMemo(
    () =>
      (dt: number, ctx: { scene: THREE.Scene }) => {
        const ud = ctx.scene.userData;
        ud.t = ((ud.t as number) ?? 0) + dt;
        const spinners = ud.spinners as
          | { obj: THREE.Object3D; rate: number }[]
          | undefined;
        if (spinners) for (const s of spinners) s.obj.rotation.z += s.rate * dt;
        const balance = ud.balance as THREE.Object3D | undefined;
        if (balance) balance.rotation.z = Math.sin((ud.t as number) * 6) * 0.7;
      },
    [],
  );

  // ── interaction ─────────────────────────────────────────────────────────────
  function seatAt(shaftIndex: number) {
    if (selected == null) {
      const occupant = stageToGear[shaftIndex];
      if (occupant) {
        setAssign((a) => ({ ...a, [occupant]: null }));
        audio.sfx("hover"); // wheel lifted back off the shaft
      }
      return;
    }
    setAssign((a) => {
      const next = { ...a };
      const occupant = Object.keys(next).find((k) => next[k] === shaftIndex);
      if (occupant) next[occupant] = null;
      next[selected] = shaftIndex;
      return next;
    });
    setSelected(null);
    audio.sfx("place"); // steel touches brass — the wheel seats
  }

  function toggleTray(k: string) {
    audio.sfx("hover");
    if (assign[k] != null) {
      setAssign((a) => ({ ...a, [k]: null }));
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
  const stageList = shafts.map((s) => s.index);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Confetti active={solved} />

      {/* header plate */}
      <div className="rounded-2xl border border-line bg-surface/50 p-4 text-center">
        <p className="microlabel" style={{ color: ACCENT }}>
          {puzzle.mechanism}
        </p>
        <p className="mt-1 text-sm text-muted">{puzzle.provenance}</p>
        <p className="mt-2 text-xs text-muted">
          Dial skin: {calendarSkin.name} {calendarSkin.glyph} · seat the wheels so every
          shaft&apos;s index rests on its engraved notch.
        </p>
      </div>

      {/* THE 3D GEAR TRAIN */}
      <div className={styles.stageWrap}>
        <ThreeStage
          key={stageKey}
          setup={setup}
          onFrame={onFrame}
          className={styles.stage}
        />
        {/* Watch-shop atmosphere over the movement. ONE animating loop per viewport:
            ParticleField (floating brass dust) runs; the glow is a static CSS bloom. */}
        <AmbientGlow
          className={styles.atmos}
          intensity={0.45}
          color="rgb(var(--c-candle))"
          position="50% 18%"
        />
        <ParticleField
          className={styles.atmos}
          kind="dust"
          density={0.7}
          opacity={0.6}
        />
        <p className={styles.stageHint} aria-hidden>
          barrel below · dial hand above
        </p>
      </div>

      {/* THE SHAFTS — seat a wheel on each */}
      <div className="mt-4">
        <p className="microlabel text-muted">
          the train · shaft 1 sits nearest the mainspring barrel
        </p>
        <div className="mt-2 flex flex-wrap items-stretch gap-2">
          {stageList.map((shaftIndex) => {
            const occ = stageToGear[shaftIndex];
            const g = occ ? gearOf(occ) : null;
            const st = statuses[shaftIndex - 1];
            const target = shafts[shaftIndex - 1].target;
            const borderColor =
              st === "ok"
                ? ACCENT
                : st === "bad"
                  ? "#c0392b"
                  : g
                    ? ACCENT
                    : undefined;
            return (
              <button
                key={shaftIndex}
                onClick={() => seatAt(shaftIndex)}
                aria-label={
                  g
                    ? `Shaft ${shaftIndex}: ${g.label}, ${g.teeth} teeth. Notch ${target}. ${st}. Tap to clear.`
                    : `Shaft ${shaftIndex}, empty. Notch ${target}. Tap to seat the selected wheel.`
                }
                className="flex min-h-[92px] min-w-[84px] flex-1 flex-col items-center justify-center rounded-xl border p-2 transition"
                style={{
                  borderColor,
                  background: g ? `${ACCENT}12` : undefined,
                }}
              >
                <span className="microlabel text-muted">shaft {shaftIndex}</span>
                <span className="microlabel" style={{ color: ACCENT }}>
                  notch {target}
                </span>
                {g ? (
                  <>
                    <span className="mt-0.5 text-2xl" aria-hidden>
                      {g.glyph}
                    </span>
                    <span className="text-center text-[11px] leading-tight">
                      {g.label}
                    </span>
                    <span className="microlabel text-muted">{g.teeth}t</span>
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

      {/* THE TRAY — unseated wheels */}
      <div className="mt-5">
        <p className="microlabel text-muted">
          {selected ? "tap a shaft to seat this wheel" : "the wheel-tray · tap to pick up"}
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
              <span className="microlabel text-muted">{g.teeth}t</span>
            </button>
          ))}
        </div>
      </div>

      {/* THE BACKPLATE — engraved notches, live-checked */}
      <div className="mt-6 rounded-2xl border border-line bg-surface/40 p-4">
        <p className="microlabel text-muted">
          the backplate · each shaft&apos;s index must land on its notch
        </p>
        <ul className="mt-2 space-y-1.5">
          {shafts.map((s) => {
            const st = statuses[s.index - 1];
            const mark = st === "ok" ? "✓" : st === "bad" ? "✕" : "·";
            const color =
              st === "ok" ? ACCENT : st === "bad" ? "#c0392b" : undefined;
            return (
              <li key={s.index} className="flex items-start gap-2 text-sm">
                <span
                  aria-hidden
                  className="mt-0.5 w-4 text-center"
                  style={{ color }}
                >
                  {mark}
                </span>
                <span className={st === "bad" ? "text-muted" : ""}>
                  Shaft {s.index}&apos;s index must rest on notch{" "}
                  <span style={{ color: ACCENT }}>{s.target}</span> of {dialTeeth}.
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-muted">
          The barrel starts the index at {puzzle.drive}; each wheel advances it by its
          tooth count (mod {dialTeeth}).
        </p>
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
              {gears.map((g: ChronosGear) => (
                <li key={g.key}>
                  <span aria-hidden>{g.glyph}</span> {g.label}:{" "}
                  <span style={{ color: ACCENT }}>
                    {labelFor(calendarSkin.key, g.cast)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs">
              Assembled oldest-first, the dial hand reads{" "}
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
              It jams — an index misses its notch. Re-read the backplate.
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
