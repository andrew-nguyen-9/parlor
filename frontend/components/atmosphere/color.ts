/**
 * Fold an alpha into a CSS color for the atmosphere layers.
 * `rgb(var(--x))` / `rgb(r g b)` → `rgb(r g b / a)` (modern space syntax);
 * `rgba(r,g,b,x)` → its alpha replaced; anything else returns unchanged.
 */
export function withAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha)).toFixed(3);
  const rgb = color.match(/^rgb\((.+)\)$/i);
  if (rgb) return `rgb(${rgb[1]} / ${a})`;
  const rgba = color.match(/^rgba\(([^)]+)\)$/i);
  if (rgba) {
    const parts = rgba[1].split(",").slice(0, 3).join(",");
    return `rgba(${parts}, ${a})`;
  }
  return color;
}
