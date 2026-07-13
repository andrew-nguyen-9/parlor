import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // PARLOR semantic tokens — driven by CSS vars in globals.css so they
        // remap between dark (candlelight) and light (daylit) themes. RGB-channel
        // vars keep Tailwind's `/<alpha>` opacity modifiers working.
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        brass: "rgb(var(--c-brass) / <alpha-value>)",
        gold: "rgb(var(--c-gold) / <alpha-value>)",
        goldlite: "rgb(var(--c-goldlite) / <alpha-value>)",
        candle: "rgb(var(--c-candle) / <alpha-value>)",
        smoke: "rgb(var(--c-smoke) / <alpha-value>)",
        ember: "rgb(var(--c-ember) / <alpha-value>)",
        burgundy: "rgb(var(--c-burgundy) / <alpha-value>)",
        parchment: "rgb(var(--c-parchment) / <alpha-value>)",
        // Category jewel-INK — text-safe per-theme tones driven by --cat-* vars
        // (globals.css). Canonical *fills* stay in lib/types.ts CATEGORY_HEX for
        // SVG/inline glow; these classes (text-/bg-/border-{cat}) are for text/UI.
        history: "rgb(var(--cat-history) / <alpha-value>)",
        music: "rgb(var(--cat-music) / <alpha-value>)",
        sports: "rgb(var(--cat-sports) / <alpha-value>)",
        screen: "rgb(var(--cat-screen) / <alpha-value>)",
        geography: "rgb(var(--cat-geography) / <alpha-value>)",
        wildcard: "rgb(var(--cat-wildcard) / <alpha-value>)",
        // Per-game SKIN seam (f-design). RGB-channel --skin-* vars scoped by
        // [data-skin] in app/skins.css; each defaults to a global token, so
        // `bg-skin-*`/`text-skin-*`/`border-skin-*` are visually identical until
        // a room opts into its skin. Values + docs: lib/theme.ts, app/skins.css.
        skin: {
          bg: "rgb(var(--skin-bg) / <alpha-value>)",
          surface: "rgb(var(--skin-surface) / <alpha-value>)",
          accent: "rgb(var(--skin-accent) / <alpha-value>)",
          ink: "rgb(var(--skin-ink) / <alpha-value>)",
          muted: "rgb(var(--skin-muted) / <alpha-value>)",
        },
      },
      // Non-color skin seams as utilities (full CSS values, not alpha-composable).
      borderRadius: {
        skin: "var(--skin-radius)",
      },
      maxWidth: {
        skin: "var(--skin-maxw)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        skin: ["var(--skin-font-display)", "var(--font-display)", "Georgia", "serif"],
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        drift: "drift 18s ease-in-out infinite alternate",
        flicker: "flicker 4s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        drift: {
          "0%": { transform: "translate(-10%, -10%) scale(1)" },
          "100%": { transform: "translate(10%, 10%) scale(1.2)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "48%": { opacity: "0.92" },
          "50%": { opacity: "0.75" },
          "52%": { opacity: "0.95" },
          "75%": { opacity: "0.88" },
        },
      },
    },
  },
  safelist: [
    // category colors are composed dynamically (text-/bg-/border-{category})
    { pattern: /(text|bg|border)-(history|music|sports|screen|geography|wildcard)/ },
    // per-game skin seam utilities — composed dynamically by skinned rooms
    { pattern: /(text|bg|border)-skin-(bg|surface|accent|ink|muted)/ },
  ],
  plugins: [],
};

export default config;
