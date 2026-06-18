import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#faf5f0",
          100: "#f0e6d8",
          200: "#e0ccb0",
          300: "#c4a882",
          400: "#a8885e",
          500: "#8b6940",
          600: "#6f5030",
          700: "#5a3f25",
          800: "#3d2a18",
          900: "#241810",
        },
        accent: {
          gold: "#c9a84c",
          rose: "#c65f5f",
          sage: "#8a9a7b",
          ink: "#1a1a2e",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Manrope", "sans-serif"],
        alt: ["Noto Serif Bengali", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "gold-pulse": "goldPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        goldPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
