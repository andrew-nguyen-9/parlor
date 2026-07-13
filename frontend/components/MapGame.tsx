"use client";

// ATLAS (G5) — a constellation LOGIC puzzle staged inside a real 3D starfield.
// Six drawn patterns float in deep space; a slate of astronomy-free omens fits
// exactly one — name it. The GeoGuessr loop is retired. The deterministic solver
// lives untouched in lib/atlasPuzzle.ts (over the committed, zero-network star
// catalog); this file is ONLY the space-game presentation on top of it.
//
// The 3D scene renders through F1's <ThreeStage> (one shared WebGL context, DPR
// cap, dispose + reduced-motion handled there). All game state stays in React and
// drives both the 3D materials and an always-present DOM control surface (numbered
// pattern chips + action bar) — so the puzzle is fully playable via the DOM even
// when WebGL/raycast/reduced-motion suppress the 3D feedback (accessibility).

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import * as THREE from "three";
import ThreeStage, { framePortrait, type ThreeStageContext } from "@/components/ThreeStage";
import {
  clueHolds,
  type AtlasPuzzle,
  type AtlasCandidate,
  type AtlasClue,
} from "@/lib/atlasPuzzle";
import { mulberry32 } from "@/lib/rng";
import { audio } from "@/lib/sound";
import styles from "./MapGame.module.css";
import CollapsiblePanel from "@/components/CollapsiblePanel";

const Confetti = dynamic(() => import("@/components/Confetti"), { ssr: false });

// Q37 (design-intake): the sky wears a cooler STAR-BLUE skin instead of the
// geography teal — a per-game skin over the locked floors (E0 de-restriction,
// f-design). The room's OUTER chrome (RoomShell accent="geography") is untouched;
// only the in-scene UI (omen numbers, selection ring, confirm, auras) shifts.
const ACCENT = "#5b8bf6";
const ACCENT_HEX = 0x5b8bf6;

// Q20 (design-intake): capped guesses — running out ends the round unsolved and
// breaks the streak (soft fail: the answer is still revealed, Q20-B + Q20-C).
const MAX_GUESSES = 3;

// Q16 (design-intake): named sky tiers are the thing worth celebrating, not a bare
// number. Clear Sky = a first-guess solve (🟩); a slip clouds it over; Overcast =
// out of guesses.
function skyTier(wrong: number, solved: boolean): { name: string; mark: string } {
  if (!solved) return { name: "Overcast", mark: "⬛" };
  if (wrong === 0) return { name: "Clear Sky", mark: "🟩" };
  if (wrong <= 2) return { name: "Passing Cloud", mark: "🟨" };
  return { name: "Hazy", mark: "🟨" };
}

function brightestId(c: AtlasCandidate): string {
  return c.stars.reduce((m, s) => (s.mag < m.mag ? s : m), c.stars[0]).id;
}

// Q43-B (design-intake) + CLAUDE.md THE MAP rule: a flat 2D SVG rendering of a
// candidate's actual star-and-line figure. This is the OFFLINE / no-WebGL play
// path — it draws from the same normalized 0..1 candidate geometry the 3D scene
// uses, needs zero network and zero GL, and makes the whole deduction solvable in
// pure DOM (the polygon-equivalent fallback for the star room). Always rendered
// inside every chip, so the patterns are visible even when the canvas is blank.
function FigureSVG({
  cand,
  tone,
}: {
  cand: AtlasCandidate;
  tone: "normal" | "selected" | "ruled" | "answer" | "dim";
}) {
  const bId = brightestId(cand);
  const pos = new Map(cand.stars.map((s) => [s.id, s]));
  const starColor =
    tone === "answer" || tone === "selected" ? "#eaf1ff" : tone === "ruled" || tone === "dim" ? "#5a6480" : "#cdd9ff";
  const lineColor =
    tone === "answer" || tone === "selected" ? ACCENT : tone === "ruled" || tone === "dim" ? "#3a4058" : "#7f93c8";
  const op = tone === "ruled" ? 0.35 : tone === "dim" ? 0.3 : 1;
  return (
    <svg viewBox="0 0 100 100" className={styles.figSvg} style={{ opacity: op }} aria-hidden focusable="false">
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
            stroke={lineColor}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        );
      })}
      {cand.stars.map((s) => {
        const isBright = s.id === bId;
        const r = isBright ? 3.4 : Math.max(1.4, 2.6 - s.mag * 0.28);
        return (
          <circle
            key={s.id}
            cx={s.x * 100}
            cy={s.y * 100}
            r={r}
            fill={isBright && tone !== "ruled" && tone !== "dim" ? "#ffffff" : starColor}
            stroke={isBright ? lineColor : "none"}
            strokeWidth={isBright ? 0.9 : 0}
          />
        );
      })}
    </svg>
  );
}

// ── 3D helpers (browser-only; all called inside ThreeStage.setup) ──

/** Soft round sprite texture; `core` tightens the falloff for a sharp star. */
function radialTexture(core: number): THREE.CanvasTexture {
  const s = 64;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const g = cv.getContext("2d")!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(core, "rgba(255,255,255,0.55)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(cv);
  t.needsUpdate = true;
  return t;
}

function numberTexture(n: number): THREE.CanvasTexture {
  const s = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const g = cv.getContext("2d")!;
  g.font = "700 74px ui-sans-serif, system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "rgba(220,232,255,0.92)";
  g.fillText(String(n), s / 2, s / 2 + 4);
  const t = new THREE.CanvasTexture(cv);
  t.needsUpdate = true;
  return t;
}

// Magnitude → sprite radius. Brighter (smaller mag) reads bigger; the single
// brightest star (× the bright factor + halo) is what the "brightest star" omens
// ask the player to find, so it must stay visibly largest.
const starSize = (mag: number) => Math.max(0.09, 0.26 - mag * 0.028);

const FIGURE_SCALE = 1.5;
const GRID = { cols: 2, cell: 2.4 };

function cellCenter(i: number): THREE.Vector3 {
  const col = i % GRID.cols;
  const row = Math.floor(i / GRID.cols);
  return new THREE.Vector3((col - 0.5) * GRID.cell, (1 - row) * GRID.cell, 0);
}

type VisualMode = "normal" | "selected" | "ruled" | "answer" | "dim";

interface Figure {
  id: string;
  group: THREE.Group;
  baseY: number;
  phase: number;
  starMat: THREE.SpriteMaterial; // shared by the figure's ordinary stars
  brightMat: THREE.SpriteMaterial; // the single brightest star
  haloMat: THREE.SpriteMaterial;
  lineMat: THREE.LineBasicMaterial;
  numMat: THREE.SpriteMaterial;
  glow: THREE.Sprite; // selection / answer aura
  hit: THREE.Mesh; // invisible raycast target
}

function applyMode(f: Figure, mode: VisualMode): void {
  const norm = 0xdfe7ff;
  const grey = 0x6a748c;
  const line = 0x8fb2ff;
  switch (mode) {
    case "normal":
      f.starMat.color.setHex(norm);
      f.starMat.opacity = 1;
      f.brightMat.opacity = 1;
      f.haloMat.opacity = 0.5;
      f.lineMat.color.setHex(line);
      f.lineMat.opacity = 0.5;
      f.numMat.opacity = 0.75;
      f.glow.visible = false;
      break;
    case "selected":
      f.starMat.color.setHex(0xbfeaff);
      f.starMat.opacity = 1;
      f.brightMat.opacity = 1;
      f.haloMat.opacity = 0.85;
      f.lineMat.color.setHex(ACCENT_HEX);
      f.lineMat.opacity = 0.85;
      f.numMat.opacity = 1;
      f.glow.material.color.setHex(ACCENT_HEX);
      f.glow.material.opacity = 0.5;
      f.glow.visible = true;
      break;
    case "answer":
      f.starMat.color.setHex(0xffffff);
      f.starMat.opacity = 1;
      f.brightMat.opacity = 1;
      f.haloMat.opacity = 1;
      f.lineMat.color.setHex(ACCENT_HEX);
      f.lineMat.opacity = 0.95;
      f.numMat.opacity = 1;
      f.glow.material.color.setHex(ACCENT_HEX);
      f.glow.material.opacity = 0.85;
      f.glow.visible = true;
      break;
    case "ruled":
      f.starMat.color.setHex(grey);
      f.starMat.opacity = 0.2;
      f.brightMat.opacity = 0.25;
      f.haloMat.opacity = 0.05;
      f.lineMat.color.setHex(grey);
      f.lineMat.opacity = 0.12;
      f.numMat.opacity = 0.3;
      f.glow.visible = false;
      break;
    case "dim":
      f.starMat.color.setHex(norm);
      f.starMat.opacity = 0.15;
      f.brightMat.opacity = 0.18;
      f.haloMat.opacity = 0.05;
      f.lineMat.color.setHex(line);
      f.lineMat.opacity = 0.1;
      f.numMat.opacity = 0.15;
      f.glow.visible = false;
      break;
  }
}

function modeFor(
  id: string,
  solution: string,
  won: boolean,
  ruledOut: Set<string>,
  selected: string | null,
): VisualMode {
  if (won) return id === solution ? "answer" : "dim";
  if (ruledOut.has(id)) return "ruled";
  if (selected === id) return "selected";
  return "normal";
}

/** Build one constellation figure as a Group of glowing sprites + lines. */
function buildFigure(
  cand: AtlasCandidate,
  index: number,
  seed: number,
  tex: { core: THREE.CanvasTexture; glow: THREE.CanvasTexture },
): Figure {
  const rand = mulberry32((seed ^ (0x9e37 * (index + 1))) >>> 0);
  const S = FIGURE_SCALE;
  const bId = brightestId(cand);
  const pos = new Map<string, THREE.Vector3>();
  for (const s of cand.stars) {
    pos.set(
      s.id,
      new THREE.Vector3((s.x - 0.5) * S, (0.5 - s.y) * S, (rand() - 0.5) * 0.5),
    );
  }

  const group = new THREE.Group();

  // Lines first (behind the stars).
  const lineMat = new THREE.LineBasicMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const verts: number[] = [];
  for (const [a, b] of cand.lines) {
    const pa = pos.get(a);
    const pb = pos.get(b);
    if (pa && pb) verts.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  group.add(new THREE.LineSegments(lineGeo, lineMat));

  // Stars.
  const starMat = new THREE.SpriteMaterial({
    map: tex.core,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const brightMat = new THREE.SpriteMaterial({
    map: tex.core,
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const haloMat = new THREE.SpriteMaterial({
    map: tex.glow,
    color: 0x9fe4ff,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  for (const s of cand.stars) {
    const p = pos.get(s.id)!;
    const isBright = s.id === bId;
    if (isBright) {
      const halo = new THREE.Sprite(haloMat);
      const hs = starSize(s.mag) * 4.2;
      halo.scale.set(hs, hs, 1);
      halo.position.copy(p);
      group.add(halo);
    }
    const sp = new THREE.Sprite(isBright ? brightMat : starMat);
    const sz = starSize(s.mag) * (isBright ? 1.6 : 1);
    sp.scale.set(sz, sz, 1);
    sp.position.copy(p);
    group.add(sp);
  }

  // Selection / answer aura (behind the figure).
  const glowMat = new THREE.SpriteMaterial({
    map: tex.glow,
    color: ACCENT_HEX,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(2.6, 2.6, 1);
  glow.position.set(0, 0, -0.35);
  glow.visible = false;
  group.add(glow);

  // Number label above the figure.
  const numMat = new THREE.SpriteMaterial({
    map: numberTexture(index + 1),
    transparent: true,
    depthWrite: false,
  });
  const num = new THREE.Sprite(numMat);
  num.scale.set(0.55, 0.55, 1);
  num.position.set(0, S * 0.5 + 0.5, 0.2);
  group.add(num);

  // Invisible tap target covering the figure + its number.
  const hit = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 2.3),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  hit.position.set(0, 0.25, 0.4);
  hit.userData.id = cand.id;
  group.add(hit);

  const center = cellCenter(index);
  group.position.copy(center);

  return {
    id: cand.id,
    group,
    baseY: center.y,
    phase: rand() * Math.PI * 2,
    starMat,
    brightMat,
    haloMat,
    lineMat,
    numMat,
    glow,
    hit,
  };
}

interface SceneApi {
  camera: THREE.PerspectiveCamera;
  raycaster: THREE.Raycaster;
  figures: Figure[];
}

function Starfield({
  puzzle,
  selected,
  ruledOut,
  reveal,
  onPick,
}: {
  puzzle: AtlasPuzzle;
  selected: string | null;
  ruledOut: Set<string>;
  reveal: boolean;
  onPick: (id: string) => void;
}) {
  const apiRef = useRef<SceneApi | null>(null);
  const timeRef = useRef(0);
  const bgRef = useRef<THREE.Object3D | null>(null);
  const bgMatRef = useRef<THREE.PointsMaterial | null>(null);
  const stageBoxRef = useRef<HTMLDivElement>(null);

  const setup = useMemo(() => {
    return (ctx: { renderer: THREE.WebGLRenderer; width: number; height: number }) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, ctx.width / ctx.height, 0.5, 200);

      const core = radialTexture(0.25);
      const glow = radialTexture(0.5);

      // Deep-space backdrop: a shell of drifting stars + a couple of faint nebulae.
      const bg = new THREE.Group();
      const rand = mulberry32((puzzle.seed ^ 0x51ed) >>> 0);
      const N = 1400;
      const pts = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        // Random point on a shell (r 16..30), biased behind the figures.
        const u = rand() * 2 - 1;
        const th = rand() * Math.PI * 2;
        const r = 16 + rand() * 14;
        const s = Math.sqrt(1 - u * u);
        pts[i * 3] = r * s * Math.cos(th);
        pts[i * 3 + 1] = r * s * Math.sin(th);
        pts[i * 3 + 2] = -Math.abs(r * u) * 0.6 - 4; // push toward the back
      }
      const bgGeo = new THREE.BufferGeometry();
      bgGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
      const bgMat = new THREE.PointsMaterial({
        map: core,
        color: 0xaebfff,
        size: 0.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      bg.add(new THREE.Points(bgGeo, bgMat));
      bgMatRef.current = bgMat;
      for (let i = 0; i < 3; i++) {
        const neb = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glow,
            color: [ACCENT_HEX, 0x6e3ca0, 0x2a4a80][i],
            transparent: true,
            opacity: 0.14,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        const sz = 14 + rand() * 10;
        neb.scale.set(sz, sz, 1);
        neb.position.set((rand() - 0.5) * 20, (rand() - 0.5) * 20, -10 - rand() * 6);
        bg.add(neb);
      }
      scene.add(bg);
      bgRef.current = bg;

      const figures = puzzle.candidates.map((c, i) =>
        buildFigure(c, i, puzzle.seed, { core, glow }),
      );
      for (const f of figures) scene.add(f.group);

      // Initial framing: fit the whole grid in portrait, then widen the far plane
      // so the deep backdrop is never clipped (framePortrait sets a tight far).
      framePortrait(camera, 4.4);
      camera.far = 200;
      camera.updateProjectionMatrix();

      apiRef.current = { camera, raycaster: new THREE.Raycaster(), figures };
      timeRef.current = 0;

      return {
        scene,
        camera,
        dispose: () => {
          apiRef.current = null;
          bgMatRef.current = null;
        },
      };
    };
  }, [puzzle]);

  const onFrame = useMemo(() => {
    return (dt: number, _ctx: ThreeStageContext) => {
      const api = apiRef.current;
      if (!api) return;
      timeRef.current += dt;
      const t = timeRef.current;
      if (bgRef.current) {
        bgRef.current.rotation.y += dt * 0.01;
        bgRef.current.rotation.x += dt * 0.004;
      }
      // Very subtle whole-sky twinkle (spec §Star Design) — one cheap material
      // breath, not per-star, so it stays calm and free on mobile.
      if (bgMatRef.current) {
        bgMatRef.current.opacity = 0.78 + Math.sin(t * 0.7) * 0.14;
      }
      for (const f of api.figures) {
        f.group.position.y = f.baseY + Math.sin(t * 0.6 + f.phase) * 0.06;
        f.group.rotation.z = Math.sin(t * 0.3 + f.phase) * 0.02;
        if (f.glow.visible) {
          // Calm breathing aura — settles rather than pulses (premium reveal).
          const p = 2.6 + Math.sin(t * 1.1) * 0.1;
          f.glow.scale.set(p, p, 1);
        }
      }
    };
  }, []);

  // Reflect game state into the 3D materials (shows on the next rendered frame;
  // under reduced motion the scene is a designed still — the DOM chips carry
  // the live state). ponytail: no manual re-render, ThreeStage owns the loop.
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    for (const f of api.figures) {
      applyMode(f, modeFor(f.id, puzzle.solution, reveal, ruledOut, selected));
    }
  }, [puzzle.solution, reveal, ruledOut, selected]);

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const api = apiRef.current;
    const box = stageBoxRef.current;
    if (!api || !box || reveal) return;
    const rect = box.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    api.raycaster.setFromCamera(ndc, api.camera);
    const hits = api.raycaster.intersectObjects(api.figures.map((f) => f.hit));
    const id = hits[0]?.object.userData.id as string | undefined;
    if (id) onPick(id);
  }

  return (
    <div ref={stageBoxRef} className={styles.stage} onPointerDown={handlePointer}>
      <ThreeStage setup={setup} onFrame={onFrame} className={styles.canvas} />
    </div>
  );
}

type Phase = "playing" | "won" | "lost";

// Per-chip visual tone for the 2D SVG fallback + chip chrome, mirrored from the
// same modeFor logic that drives the 3D materials.
function chipTone(
  id: string,
  solution: string,
  reveal: boolean,
  ruledOut: Set<string>,
  selected: string | null,
): "normal" | "selected" | "ruled" | "answer" | "dim" {
  if (reveal) return id === solution ? "answer" : "dim";
  if (ruledOut.has(id)) return "ruled";
  if (selected === id) return "selected";
  return "normal";
}

export default function MapGame({
  puzzle,
  requestedDate,
}: {
  puzzle: AtlasPuzzle | null;
  requestedDate?: string | null;
}) {
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

  return <StarAtlas puzzle={puzzle} />;
}

function StarAtlas({ puzzle }: { puzzle: AtlasPuzzle }) {
  const reduce = !!useReducedMotion();
  const [ruledOut, setRuledOut] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState<Phase>("playing");
  const [copied, setCopied] = useState(false);
  // Q13-C: opt-in assist — when on, the omens show ✓/✗ for the focused figure so
  // a player can SEE why a candidate does or doesn't fit, without auto-solving.
  const [assist, setAssist] = useState(false);

  const solvedCand = puzzle.candidates.find((c) => c.id === puzzle.solution)!;
  // Q14: gentler penalties (−15/wrong) so a slip isn't near-fatal.
  const score = Math.max(10, 100 - wrong.length * 15);
  const selectedRuledOut = selected != null && ruledOut.has(selected);
  const won = phase === "won";
  const lost = phase === "lost";
  const reveal = won || lost;
  const guessesLeft = Math.max(0, MAX_GUESSES - wrong.length);
  const selCand = selected ? (puzzle.candidates.find((c) => c.id === selected) ?? null) : null;
  const allRuledOut = puzzle.candidates.every((c) => ruledOut.has(c.id));

  // Deep-space ambient bed (f1-audio) — starts on mount, torn down on unmount.
  // No-op under mute/reduced-motion/SSR; the manager owns that decision.
  useEffect(() => {
    audio.startAmbient("map");
    return () => audio.stopAmbient();
  }, []);

  function pick(id: string) {
    if (phase !== "playing") return;
    audio.sfx("place"); // tiny crystalline focus cue
    setSelected((s) => (s === id ? null : id));
  }

  function toggleRuleOut() {
    if (phase !== "playing" || !selected) return;
    audio.sfx("hover");
    setRuledOut((prev) => {
      const next = new Set(prev);
      if (next.has(selected)) next.delete(selected);
      else next.add(selected);
      return next;
    });
  }

  function confirm() {
    if (phase !== "playing" || !selected || ruledOut.has(selected)) return;
    if (selected === puzzle.solution) {
      audio.sfx("correct");
      audio.stinger(); // restrained completion swell — the "it's a swan" moment
      setPhase("won");
      return;
    }
    // Wrong: costs points AND rules the figure out (Q15-A), and burns one of the
    // capped attempts (Q20). Running out soft-fails the round (answer revealed).
    const nextWrong = wrong.includes(selected) ? wrong : [...wrong, selected];
    audio.sfx("wrong");
    setWrong(nextWrong);
    setRuledOut((prev) => new Set(prev).add(selected));
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setSelected(null);
    if (nextWrong.length >= MAX_GUESSES) {
      audio.stinger();
      setPhase("lost");
    }
  }

  async function share() {
    // Q23-B: share the mark/tier/score but NOT the pattern name — never spoil the
    // day's answer for someone who hasn't played yet.
    const { name: tierName, mark } = skyTier(wrong.length, won);
    const outcome = won ? `solved in ${wrong.length + 1}` : "clouded over";
    const text = `PARLOR · Atlas ${puzzle.date}\n${mark} ${tierName} — ${outcome} · ${score} pts`;
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
      <header className={styles.head}>
        <p className="microlabel" style={{ color: ACCENT }}>
          {puzzle.skyRegion}
        </p>
        <h1 className={styles.title}>Read the omens</h1>
        <p className="text-muted text-sm">
          Six constellations drift in the dark. Exactly one obeys every omen below — name it.
          No stargazing needed; just count and reason.
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
            {puzzle.clues.map((cl: AtlasClue, i) => {
              // Q13-C assist: for the focused figure, does this omen hold? ✓/✗.
              const mark = assist && selCand ? clueHolds(cl, selCand) : null;
              return (
                <li key={cl.id} className={styles.clue}>
                  <span className={styles.clueNum} style={{ borderColor: ACCENT, color: ACCENT }}>
                    {i + 1}
                  </span>
                  <span>{cl.text}</span>
                  {mark !== null && (
                    <span
                      className={styles.clueMark}
                      style={{ color: mark ? ACCENT : "#e0748c" }}
                      aria-label={mark ? "the focused figure obeys this omen" : "the focused figure breaks this omen"}
                    >
                      {mark ? "✓" : "✗"}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            className={styles.assistBtn}
            aria-pressed={assist}
            onClick={() => setAssist((a) => !a)}
          >
            {assist ? "assist on ✦" : "assist"}
          </button>
          <p className="microlabel mt-3 text-smoke">
            tap a constellation (or its number below) to focus it, rule out the ones an omen
            forbids — one survives them all
            {assist ? " · assist marks whether the focused figure obeys each omen" : ""}
          </p>
        </CollapsiblePanel>

        <div className={styles.stageCol}>
          <div className={`${styles.stageFrame} ${shake ? styles.shake : ""}`}>
            <Starfield
              puzzle={puzzle}
              selected={selected}
              ruledOut={ruledOut}
              reveal={reveal}
              onPick={pick}
            />
            {reveal && (
              <p className={styles.answerBanner} style={{ color: ACCENT }}>
                {solvedCand.name}
              </p>
            )}
          </div>

          {/* Pattern chips — each renders the constellation's actual figure as a
              flat 2D SVG (Q43-B / THE MAP offline rule): the always-present,
              zero-WebGL, zero-network control surface that mirrors + drives
              selection. The 3D canvas is a progressive enhancement over this. */}
          <div className={styles.chips} role="group" aria-label="constellations">
            {puzzle.candidates.map((cand, idx) => {
              const isOut = ruledOut.has(cand.id);
              const isSel = selected === cand.id;
              const isAnswer = cand.id === puzzle.solution;
              const tone = chipTone(cand.id, puzzle.solution, reveal, ruledOut, selected);
              return (
                <button
                  key={cand.id}
                  type="button"
                  className={[
                    styles.chip,
                    isSel ? styles.chipSel : "",
                    isOut && !reveal ? styles.chipOut : "",
                    reveal && isAnswer ? styles.chipAnswer : "",
                    reveal && !isAnswer ? styles.chipDim : "",
                  ].join(" ")}
                  style={isSel || (reveal && isAnswer) ? { borderColor: ACCENT } : undefined}
                  aria-pressed={isSel}
                  aria-label={`Constellation ${idx + 1}${reveal && isAnswer ? ` — ${cand.name}` : isOut ? " (ruled out)" : ""}`}
                  disabled={reveal}
                  onClick={() => pick(cand.id)}
                >
                  <FigureSVG cand={cand} tone={tone} />
                  <span className={styles.chipNum} style={isSel || (reveal && isAnswer) ? { color: ACCENT } : undefined}>
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {won
          ? `Solved. The pattern was ${solvedCand.name}.`
          : lost
            ? `Out of guesses. The pattern was ${solvedCand.name}.`
            : ""}
      </p>

      {!reveal ? (
        <div className={styles.controls}>
          {selected && !selectedRuledOut && (
            <button type="button" className={styles.ruleBtn} onClick={toggleRuleOut}>
              rule out this one
            </button>
          )}
          {selectedRuledOut && (
            <button type="button" className={styles.ruleBtn} onClick={toggleRuleOut}>
              restore this one
            </button>
          )}
          <button
            type="button"
            className={styles.confirm}
            style={{ background: selected && !selectedRuledOut ? ACCENT : undefined }}
            disabled={!selected || selectedRuledOut}
            onClick={confirm}
          >
            {selected && !selectedRuledOut ? "Name this pattern" : "Choose a pattern"}
          </button>
          {/* Q20: capped guesses, shown as a calm budget. */}
          <span className="microlabel text-smoke">
            {guessesLeft} {guessesLeft === 1 ? "guess" : "guesses"} left · {score} pts at stake
          </span>
          {/* Q47: every figure ruled out — no valid guess remains; nudge a restore. */}
          {allRuledOut && (
            <span className="microlabel" style={{ color: "#e0748c" }}>
              you&rsquo;ve ruled out every figure — restore one to name it
            </span>
          )}
        </div>
      ) : (
        <div className={styles.result}>
          {won && !reduce && <Confetti active />}
          {(() => {
            const tier = skyTier(wrong.length, won);
            return (
              <>
                <p className="microlabel" style={{ color: won ? ACCENT : "#e0748c" }}>
                  {won ? `${tier.mark} ${tier.name} — the pattern was` : `${tier.mark} Overcast — the pattern was`}
                </p>
                <p className={styles.resultName}>{solvedCand.name}</p>
                <p className="text-muted text-sm">
                  {won
                    ? `Solved in ${wrong.length + 1} ${wrong.length === 0 ? "guess" : "guesses"} · ${score} points`
                    : `Out of guesses · streak breaks · ${score} points`}
                </p>
                <button type="button" className={styles.shareBtn} onClick={share}>
                  {copied ? "copied ✦" : "share result"}
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
