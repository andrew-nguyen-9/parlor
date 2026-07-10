"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * ParticleField — the shared 2D-canvas atmosphere particle layer.
 *
 * ONE reusable field for dust / embers / sparks / motes. Rooms tune it with
 * props; they must NOT re-implement particles. Owns the whole perf contract:
 *   - one shared requestAnimationFrame loop, DPR capped ≤2
 *   - ResizeObserver (never a window resize listener) resizes + rescales density
 *   - full teardown on unmount (cancel RAF, disconnect RO) — leak-free
 *   - `prefers-reduced-motion` OR `animate={false}` → ONE static seeded frame,
 *     no RAF (the ≤1-loop-per-viewport composition control: a room enabling
 *     several primitives runs at most one animating)
 *
 * Purely decorative garnish — `pointer-events:none`, `aria-hidden`, and it must
 * never sit legibly over Q&A text (compose it as a background layer).
 */

export type ParticleKind = "dust" | "ember" | "spark" | "mote";

export interface ParticleFieldProps {
  /** Particle behaviour preset. Default "dust". */
  kind?: ParticleKind;
  /**
   * Palette (any CSS colors). Omit to derive from the candlelight tokens
   * (`--c-candle/--c-gold/--c-goldlite`, or ember hue for embers) at mount,
   * so the field re-tints with the theme for free.
   */
  colors?: string[];
  /** Population multiplier vs. the kind's area-based default. Default 1. */
  density?: number;
  /** Speed multiplier. Default 1. */
  driftSpeed?: number;
  /** Layer opacity 0–1. Default 1 (per-particle alpha already runs low). */
  opacity?: number;
  /**
   * When false, freeze to a single static frame (no RAF). Reduced-motion forces
   * this regardless. Default true.
   */
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  base: number; // base alpha
  a: number; // current alpha
  ph: number; // twinkle phase
  tw: number; // twinkle speed
  color: string;
}

interface KindCfg {
  /** css px² of area per particle (lower = denser). */
  areaPer: number;
  size: [number, number];
  speed: [number, number];
  vyBias: number; // <0 rises, >0 falls
  alpha: [number, number];
  twinkle: boolean;
  glow: number; // shadowBlur multiplier on radius
  vars: string[];
  fallback: string[];
}

const KINDS: Record<ParticleKind, KindCfg> = {
  dust: {
    areaPer: 9000,
    size: [0.6, 2],
    speed: [0.05, 0.3],
    vyBias: -0.15,
    alpha: [0.12, 0.35],
    twinkle: false,
    glow: 0,
    vars: ["--c-goldlite", "--c-gold", "--c-smoke"],
    fallback: ["rgb(230 200 120)", "rgb(201 162 74)", "rgb(90 68 82)"],
  },
  mote: {
    areaPer: 14000,
    size: [1.5, 3.5],
    speed: [0.08, 0.35],
    vyBias: -0.1,
    alpha: [0.18, 0.45],
    twinkle: true,
    glow: 1.5,
    vars: ["--c-candle", "--c-goldlite", "--c-gold"],
    fallback: ["rgb(245 197 66)", "rgb(230 200 120)", "rgb(201 162 74)"],
  },
  ember: {
    areaPer: 16000,
    size: [1, 2.6],
    speed: [0.2, 0.7],
    vyBias: -0.9, // embers rise
    alpha: [0.25, 0.6],
    twinkle: true,
    glow: 2.5,
    vars: ["--c-ember", "--c-candle", "--c-gold"],
    fallback: ["rgb(212 67 30)", "rgb(245 197 66)", "rgb(201 162 74)"],
  },
  spark: {
    areaPer: 22000,
    size: [0.6, 1.8],
    speed: [0.3, 1],
    vyBias: -0.2,
    alpha: [0.3, 0.75],
    twinkle: true,
    glow: 3,
    vars: ["--c-candle", "--c-goldlite"],
    fallback: ["rgb(245 197 66)", "rgb(230 200 120)"],
  },
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function resolveColors(el: HTMLElement, cfg: KindCfg, override?: string[]): string[] {
  if (override && override.length) return override;
  const cs = getComputedStyle(el);
  const out = cfg.vars.map((name, i) => {
    const v = cs.getPropertyValue(name).trim();
    return v ? `rgb(${v})` : cfg.fallback[i] ?? cfg.fallback[0];
  });
  return out.length ? out : cfg.fallback;
}

export default function ParticleField({
  kind = "dust",
  colors,
  density = 1,
  driftSpeed = 1,
  opacity = 1,
  animate = true,
  className,
  style,
}: ParticleFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const moving = animate && !reduced;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;display:block";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return; // no 2D context → nothing renders, room stays legible
    }

    const cfg = KINDS[kind];
    const palette = resolveColors(container, cfg, colors);
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // ponytail: DPR>2 wastes fill-rate on mobile
    let w = 1;
    let h = 1;
    let particles: Particle[] = [];

    const mk = (spawn: boolean): Particle => {
      const base = rand(cfg.alpha[0], cfg.alpha[1]);
      const sp = rand(cfg.speed[0], cfg.speed[1]) * driftSpeed;
      return {
        x: Math.random() * w,
        // spawn=false → seed across the frame; spawn=true → enter from the far edge
        y: spawn ? (cfg.vyBias < 0 ? h + 8 : -8) : Math.random() * h,
        vx: rand(-0.4, 0.4) * driftSpeed,
        vy: cfg.vyBias * sp + rand(-0.05, 0.05),
        r: rand(cfg.size[0], cfg.size[1]),
        base,
        a: base,
        ph: Math.random() * Math.PI * 2,
        tw: rand(0.01, 0.05),
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    };

    const target = () =>
      Math.min(400, Math.max(0, Math.round(((w * h) / cfg.areaPer) * density)));

    const seed = () => {
      const n = target();
      particles = Array.from({ length: n }, () => mk(false));
    };

    const resize = () => {
      w = Math.max(1, container.clientWidth);
      h = Math.max(1, container.clientHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (!moving) draw(); // keep the still frame crisp across resizes
    };

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, Math.min(1, p.a)) * opacity;
        if (cfg.glow) {
          ctx.shadowBlur = p.r * cfg.glow;
          ctx.shadowColor = p.color;
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function step() {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (cfg.twinkle) {
          p.ph += p.tw;
          p.a = p.base * (0.55 + 0.45 * Math.sin(p.ph));
        }
        // respawn once fully off any edge (rising embers exit the top)
        if (
          p.y < -12 ||
          p.y > h + 12 ||
          p.x < -12 ||
          p.x > w + 12
        ) {
          particles[i] = mk(true);
        }
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    let raf = 0;
    if (moving) {
      const loop = () => {
        step();
        draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } else {
      draw();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, density, driftSpeed, opacity, moving, colors]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ pointerEvents: "none", ...style }}
      aria-hidden
    />
  );
}
