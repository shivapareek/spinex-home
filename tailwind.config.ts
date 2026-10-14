import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", md: "2rem", xl: "3rem" },
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1440px" },
    },
    extend: {
      colors: {
        // Every token reads a CSS variable so admin-selected themes recolour the store (see src/lib/themes.ts).
        // Legacy token names (ivory, maroon, gold) map onto the same variables.
        ink: { DEFAULT: v("ink"), 2: v("ink-2"), 3: v("ink-3") },
        ivory: { DEFAULT: v("surface"), 2: v("surface-2"), 3: v("line") },
        page: v("page"),
        surface: { DEFAULT: v("surface"), 2: v("surface-2") },
        line: v("line"),
        muted: v("muted"),
        accent: { DEFAULT: v("accent"), soft: v("accent-soft"), deep: v("accent-deep"), on: v("on-accent") },
        maroon: { DEFAULT: v("accent-deep"), deep: v("accent-deep"), soft: v("accent") },
        gold: { DEFAULT: v("accent"), bright: v("accent"), deep: v("accent-deep"), pale: v("accent-soft") },
        tile: { 1: v("tile-1"), 2: v("tile-2"), 3: v("tile-3") },
        sindoor: "#DC2626",
        tulsi: "#16A34A",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        deva: ["var(--font-deva)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.32,0.72,0,1)",
        spring: "cubic-bezier(0.34,1.56,0.64,1)",
      },
      boxShadow: {
        aura: "0 12px 32px -12px rgb(var(--c-accent) / 0.35)",
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.12)",
        lift: "0 24px 60px -24px rgba(0,0,0,0.25)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
        card: "0 1px 2px rgba(0,0,0,0.04)",
      },
      keyframes: {
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        marquee: { to: { transform: "translateX(-50%)" } },
        flicker: {
          "0%,100%": { transform: "scaleY(1) translateY(0)", opacity: "1" },
          "25%": { transform: "scaleY(1.08) translateY(-1px) skewX(2deg)", opacity: ".92" },
          "50%": { transform: "scaleY(.94) skewX(-2deg)", opacity: "1" },
          "75%": { transform: "scaleY(1.04) translateY(-1px)", opacity: ".95" },
        },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        ember: {
          "0%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translate3d(var(--dx,20px),-110vh,0) scale(.4)", opacity: "0" },
        },
        shimmer: { to: { backgroundPosition: "200% 0" } },
        swing: { "0%,100%": { transform: "rotate(-4deg)" }, "50%": { transform: "rotate(4deg)" } },
      },
      animation: {
        "spin-slow": "spin-slow 60s linear infinite",
        "spin-slower": "spin-slow 120s linear infinite",
        marquee: "marquee 40s linear infinite",
        flicker: "flicker 1.6s ease-in-out infinite",
        float: "float 6s cubic-bezier(0.45,0,0.55,1) infinite",
        shimmer: "shimmer 2.4s linear infinite",
        swing: "swing 3.2s cubic-bezier(0.45,0,0.55,1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
