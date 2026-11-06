import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            950: "#060714",
            900: "#0B0D21",
            850: "#10122E",
            800: "#15173B",
            700: "#1A1B41", // User specific brand navy
            600: "#24265A",
            500: "#31347A",
          },
          cyan: {
            DEFAULT: "#00E5FF",
            glow: "#33EAFF",
            dim: "#00B8CC",
            dark: "#00838F",
            deep: "#00363A",
          },
          yellow: {
            DEFAULT: "#FFD700",
            glow: "#FFE44D",
            amber: "#FFB703",
            dark: "#CCAC00",
          },
          surface: {
            glass: "rgba(26, 27, 65, 0.65)",
            glassHover: "rgba(36, 38, 90, 0.8)",
            card: "rgba(16, 18, 46, 0.75)",
            border: "rgba(0, 229, 255, 0.15)",
            borderActive: "rgba(0, 229, 255, 0.45)",
          },
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 20px -2px rgba(0, 229, 255, 0.45)",
        "neon-cyan-lg": "0 0 35px 2px rgba(0, 229, 255, 0.35)",
        "neon-cyan-pill": "0 0 15px rgba(0, 229, 255, 0.5)",
        "neon-yellow": "0 0 20px -2px rgba(255, 215, 0, 0.45)",
        "glass-card": "0 20px 40px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
        "3d-card": "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(0, 229, 255, 0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyan-pill": "linear-gradient(135deg, #00E5FF 0%, #0099FF 100%)",
        "cyan-pill-hover": "linear-gradient(135deg, #33EAFF 0%, #00B4D8 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
        "hero-glow": "radial-gradient(circle at 50% 30%, rgba(0, 229, 255, 0.18) 0%, rgba(26, 27, 65, 0.4) 45%, transparent 75%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
