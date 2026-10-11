import type { Config } from "tailwindcss";

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
        // Neutral, white-first palette. Legacy token names are kept so every screen maps cleanly.
        ink: { DEFAULT: "#111111", 2: "#1C1C1C", 3: "#2A2A2A" },
        ivory: { DEFAULT: "#F6F6F5", 2: "#EFEFED", 3: "#E4E4E1" },
        surface: "#F6F6F5",
        line: "#E8E8E6",
        muted: "#6B6B6B",
        // Single brand accent: saffron
        accent: { DEFAULT: "#EA580C", soft: "#FFF1E8", deep: "#C2410C" },
        maroon: { DEFAULT: "#C2410C", deep: "#9A3412", soft: "#EA580C" },
        gold: { DEFAULT: "#EA580C", bright: "#F97316", deep: "#C2410C", pale: "#FFF1E8" },
        sindoor: "#DC2626",
        tulsi: "#16A34A",
      },
      fontFamily: {
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        deva: ["var(--font-deva)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.32,0.72,0,1)",
        spring: "cubic-bezier(0.34,1.56,0.64,1)",
      },
      boxShadow: {
        aura: "0 12px 32px -12px rgba(234,88,12,0.35)",
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
