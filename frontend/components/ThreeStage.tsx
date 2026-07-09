"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ThreeStage — shared Three.js canvas wrapper.
 *
 * Owns the renderer/RAF/resize/dispose boilerplate every 3D room repeats plus the
 * mobile-perf traps that are easy to get wrong. Consumers (E2, E3) supply only their
 * scene contents + an `onFrame` tick.
 *
 * Guarantees:
 *   - WebGLRenderer(antialias, powerPreference:"high-performance"), DPR capped ≤2.
 *   - ResizeObserver → renderer + camera aspect stay in sync; fills width, never
 *     x-overflows (canvas is width:100% of the container; set a height via className).
 *   - ONE shared requestAnimationFrame loop; `onFrame(dt, ctx)` gets delta seconds.
 *   - Portrait-first framing: pass `setup().radius` and the camera is auto-fit to a
 *     sphere of that radius on mount AND every resize (the tighter of h/v FOV wins, so
 *     tall/portrait viewports back the camera off correctly). Or call `framePortrait`.
 *   - Full dispose on unmount: geometries, materials, their textures, and the renderer.
 *   - Respects `prefers-reduced-motion`: renders one static frame, no RAF loop, no
 *     `onFrame` (a designed still state).
 *
 * Props:
 *   setup    — called once after the renderer exists; returns the scene + camera to
 *              render (+ optional `radius`/`center` for auto-framing, `dispose` for
 *              extra cleanup). Everything added to the returned scene is auto-disposed.
 *   onFrame  — per-frame tick, `dt` in seconds. Skipped under reduced motion.
 *   className/style — sized/positioned by the caller (give the container a height).
 */

export interface ThreeStageContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
}

export interface ThreeStageSetup {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Auto-fit the camera to a sphere of this radius on mount + resize (portrait-safe). */
  radius?: number;
  /** Sphere center for auto-fit (default origin). */
  center?: THREE.Vector3;
  /** Extra cleanup beyond auto-disposing scene contents + renderer. */
  dispose?: () => void;
}

export interface ThreeStageProps {
  setup: (ctx: {
    renderer: THREE.WebGLRenderer;
    width: number;
    height: number;
  }) => ThreeStageSetup;
  onFrame?: (dt: number, ctx: ThreeStageContext) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Position a PerspectiveCamera on +Z so a sphere of `radius` at `center` fits in the
 * frame. Uses the tighter of the horizontal/vertical FOV, so portrait (aspect < 1)
 * viewports — where horizontal FOV is the limiter — back the camera off correctly.
 */
export function framePortrait(
  camera: THREE.PerspectiveCamera,
  radius: number,
  center: THREE.Vector3 = new THREE.Vector3(),
): void {
  const vFov = (camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  const distV = radius / Math.sin(vFov / 2);
  const distH = radius / Math.sin(hFov / 2);
  const dist = Math.max(distV, distH) * 1.1; // padding so the sphere never kisses the edge
  camera.position.set(center.x, center.y, center.z + dist);
  camera.lookAt(center);
  camera.near = Math.max(0.01, dist - radius * 2);
  camera.far = dist + radius * 2;
  camera.updateProjectionMatrix();
}

function disposeScene(scene: THREE.Scene): void {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const mat = mesh.material;
    const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
    for (const m of mats) {
      for (const v of Object.values(m)) {
        if (v && (v as THREE.Texture).isTexture) (v as THREE.Texture).dispose();
      }
      m.dispose();
    }
  });
}

export default function ThreeStage({ setup, onFrame, className, style }: ThreeStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the latest callbacks without re-initializing the renderer on every render.
  const setupRef = useRef(setup);
  const onFrameRef = useRef(onFrame);
  setupRef.current = setup;
  onFrameRef.current = onFrame;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // ponytail: DPR>2 is invisible on-screen, halves mobile fps
    renderer.setSize(width, height, false);
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const { scene, camera, radius, center, dispose } = setupRef.current({ renderer, width, height });
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (radius != null) framePortrait(camera, radius, center);

    const ctx: ThreeStageContext = { scene, camera, renderer, width, height };

    // ponytail: read reduced-motion once at mount — it effectively never toggles mid-session
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ro = new ResizeObserver(() => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (radius != null) framePortrait(camera, radius, center);
      ctx.width = w;
      ctx.height = h;
      if (reducedMotion) renderer.render(scene, camera); // keep the still frame crisp on resize
    });
    ro.observe(container);

    let raf = 0;
    let last = performance.now();
    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      const loop = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;
        onFrameRef.current?.(dt, ctx);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dispose?.();
      disposeScene(scene);
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} className={className} style={style} />;
}
