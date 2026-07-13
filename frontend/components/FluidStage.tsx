import type { ElementType, ReactNode, CSSProperties } from "react";

/**
 * FluidStage — full-width responsive container primitive.
 *
 * The "no dead L/R gutters, no horizontal scroll" wrapper. Spans the available
 * width from the smallest to the largest viewport with `clamp()`-based adaptive
 * padding (never a fixed narrow column), and clips the x-axis so no child can
 * introduce a horizontal scrollbar at 320 / 768 / 1440px+.
 *
 * Server Component (no interactivity) — compose it, don't re-derive gutter math.
 *
 * Props:
 *   children  — content to span the stage.
 *   maxWidth  — optional CSS max-width cap (e.g. "72rem"); omit for edge-to-edge.
 *   padding   — CSS inline-padding override; default `clamp(1rem, 4vw, 3rem)`.
 *   fill      — also fill the available *height* (min-h-full flex column): the
 *               full-bleed / WebGL-room mode so a ThreeStage (or Phaser) canvas
 *               parented here spans the viewport instead of collapsing to content
 *               height. Width behaviour is unchanged.
 *   as        — element/component to render as (default "div").
 *   className / style — merged onto the container.
 */
export interface FluidStageProps {
  children: ReactNode;
  maxWidth?: string;
  padding?: string;
  fill?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export default function FluidStage({
  children,
  maxWidth,
  padding = "clamp(1rem, 4vw, 3rem)",
  fill = false,
  as: Tag = "div",
  className = "",
  style,
}: FluidStageProps) {
  return (
    <Tag
      className={`w-full mx-auto box-border overflow-x-clip ${
        fill ? "flex min-h-full flex-1 flex-col" : ""
      } ${className}`}
      style={{ maxWidth, paddingInline: padding, ...style }}
    >
      {children}
    </Tag>
  );
}
