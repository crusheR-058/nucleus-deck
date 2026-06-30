import type { Config } from "tailwindcss";

/**
 * Nucleus Deck — strictly monochrome liquid-glass design system.
 * Elegance comes from contrast + translucency, never hue.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Monochrome scale: deep ink -> charcoal -> graphite -> steel -> silver -> mist -> frost
        ink: {
          DEFAULT: "#09090B",
          950: "#050506",
          900: "#0B0B0E",
          800: "#141417",
          700: "#1B1B1F",
        },
        charcoal: {
          DEFAULT: "#18181B",
          light: "#222226",
          dark: "#0F0F12",
        },
        graphite: "#3F3F46",
        steel: "#71717A",
        silver: "#A1A1AA",
        mist: "#D4D4D8",
        frost: "#ECECEF",
      },
      fontFamily: {
        sans: ["Satoshi", "General Sans", "SF Pro Display", "system-ui", "sans-serif"],
        display: ["General Sans", "Satoshi", "SF Pro Display", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "28px",
        "4xl": "32px",
        "5xl": "40px",
      },
      boxShadow: {
        glass: "0 24px 70px -28px rgba(8,8,12,0.55), 0 8px 24px -16px rgba(8,8,12,0.35)",
        "glass-lg": "0 40px 120px -36px rgba(8,8,12,0.6), 0 12px 40px -20px rgba(8,8,12,0.4)",
        "glass-sm": "0 12px 36px -18px rgba(8,8,12,0.45)",
        glow: "0 0 0 1px rgba(255,255,255,0.5), 0 0 30px -4px rgba(255,255,255,0.55)",
        "inner-highlight":
          "inset 0 1px 1px rgba(255,255,255,0.85), inset 0 -22px 40px -34px rgba(8,8,12,0.25)",
        "charcoal-glow": "0 30px 90px -30px rgba(0,0,0,0.7), 0 0 28px -10px rgba(255,255,255,0.12)",
      },
      backdropBlur: {
        glass: "40px",
        "glass-sm": "20px",
        "glass-lg": "64px",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spring-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) translateZ(0)" },
          "50%": { transform: "translateY(-12px) translateZ(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "33%": { transform: "translate3d(10px,-16px,0)" },
          "66%": { transform: "translate3d(-12px,-6px,0)" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(40px,-30px,0) scale(1.06)" },
          "100%": { transform: "translate3d(0,0,0) scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(28px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "aura-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.12)", opacity: "0.85" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "float-slow": "float-slow 18s ease-in-out infinite",
        drift: "drift 26s ease-in-out infinite",
        shimmer: "shimmer 2.4s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3.5s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        "rise-in": "rise-in 0.9s cubic-bezier(0.16,1,0.3,1) both",
        "aura-breathe": "aura-breathe 4.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
