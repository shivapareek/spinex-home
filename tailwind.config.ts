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
        ink: { DEFAULT: "#140A0C", 2: "#1E1013", 3: "#2A161A" },
        maroon: { DEFAULT: "#5E1224", deep: "#3A0A15", soft: "#7A2236" },
        gold: { DEFAULT: "#C9A24A", bright: "#E9CC7A", deep: "#94701F", pale: "#F3E6C2" },
        ivory: { DEFAULT: "#F7F0E3", 2: "#EFE4CF", 3: "#E4D6BB" },
        sindoor: "#D2431F",
        tulsi: "#3F6B4A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        deva: ["var(--font-deva)", "serif"],
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.32,0.72,0,1)",
        spring: "cubic-bezier(0.34,1.56,0.64,1)",
      },
      boxShadow: {
        aura: "0 30px 80px -30px rgba(201,162,74,0.45)",
        soft: "0 24px 60px -28px rgba(20,10,12,0.28)",
        lift: "0 40px 90px -40px rgba(20,10,12,0.45)",
        inset: "inset 0 1px 1px rgba(255,255,255,0.18)",
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
