import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ─── LUXURY COLOR SYSTEM ───
      colors: {
        brand: {
          50: "#faf7f4",
          100: "#f0e8de",
          200: "#e0d0bc",
          300: "#c4a882",
          400: "#a8885e",
          500: "#8b6940",
          600: "#6f5030",
          700: "#5a3f25",
          800: "#3d2a18",
          900: "#241810",
          950: "#140e08",
        },
        accent: {
          gold: "#c9a84c",
          goldLight: "#e8d48b",
          goldDark: "#a88830",
          rose: "#c65f5f",
          roseLight: "#e08a8a",
          sage: "#8a9a7b",
          ink: "#1a1a2e",
          cream: "#fdf8f3",
        },
        luxe: {
          charcoal: "#1c1c1e",
          pewter: "#6b6b6b",
          ivory: "#f5f0eb",
          champagne: "#f7f0e6",
          bronze: "#cd7f32",
          platinum: "#e5e4e2",
        },
      },

      // ─── LUXURY TYPOGRAPHY ───
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["Manrope", "Inter", "sans-serif"],
        alt: ["Noto Serif Bengali", "serif"],
        editorial: ["Playfair Display", "Cormorant Garamond", "serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "display-1": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-2": ["3.75rem", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
        "display-3": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "heading-1": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "heading-2": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "heading-3": ["1.5rem", { lineHeight: "1.25", letterSpacing: "0" }],
        "heading-4": ["1.25rem", { lineHeight: "1.3", letterSpacing: "0" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-base": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "body-xs": ["0.75rem", { lineHeight: "1.4" }],
        caption: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.06em" }],
      },

      // ─── LETTER SPACING ───
      letterSpacing: {
        fashion: "0.15em",
        editorial: "0.05em",
        wide: "0.1em",
        wider: "0.2em",
        widest: "0.3em",
      },

      // ─── LUXURY SHADOWS ───
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        card: "0 2px 8px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)",
        elevated: "0 10px 40px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
        modal: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
        menu: "0 12px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        "gold-glow": "0 0 20px rgba(201,168,76,0.15)",
      },

      // ─── CUSTOM SPACING ───
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
      },

      // ─── LUXURY ANIMATION SYSTEM ───
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in-up": "fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in-down": "fadeInDown 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-down": "slideDown 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "gold-pulse": "goldPulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "image-reveal": "imageReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        goldPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        imageReveal: {
          "0%": { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0 0 0)" },
        },
      },

      // ─── TRANSITION TIMING ───
      transitionTimingFunction: {
        "luxe-out": "cubic-bezier(0.22, 1, 0.36, 1)",
        "luxe-in": "cubic-bezier(0.55, 0, 0.75, 0.25)",
      },

      // ─── BACKGROUND PATTERNS ───
      backgroundImage: {
        "luxe-gradient": "linear-gradient(135deg, #fdf8f3 0%, #f5f0eb 50%, #ede4d8 100%)",
        "dark-gradient": "linear-gradient(135deg, #1c1c1e 0%, #2d2d30 50%, #1a1a1c 100%)",
        "gold-gradient": "linear-gradient(135deg, #c9a84c 0%, #e8d48b 50%, #a88830 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
