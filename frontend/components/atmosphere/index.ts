// Shared spectral-atmosphere primitives (F1). Rooms compose these — never
// re-implement particles / ornaments / fog. See each file for its prop contract
// and `.done.md` for the ≤1-loop-per-viewport composition guidance.

export { default as ParticleField } from "./ParticleField";
export type { ParticleFieldProps, ParticleKind } from "./ParticleField";

export { default as AmbientGlow } from "./AmbientGlow";
export type { AmbientGlowProps } from "./AmbientGlow";

export { default as Ornament } from "./Ornament";
export type { OrnamentProps, OrnamentVariant, OrnamentTreatment } from "./Ornament";

export { default as GrainFog } from "./GrainFog";
export type { GrainFogProps } from "./GrainFog";

export { useReducedMotion } from "./useReducedMotion";
export { withAlpha } from "./color";
