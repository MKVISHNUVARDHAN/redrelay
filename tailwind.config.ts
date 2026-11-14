import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#090F19",
          900: "#0F1A2A",
          850: "#132135",
          800: "#152338",
          700: "#1E314D",
          600: "#2B4366",
          500: "#3B5C8C",
        },
        crimson: {
          900: "#701022",
          800: "#961930",
          700: "#B9233D",
          600: "#D33D56",
          500: "#E35A71",
          400: "#F28294",
          100: "#FFE4E8",
          50: "#FFF0F2",
        },
        medical: {
          green: "#177A63",
          greenLight: "#E6F6F2",
          amber: "#D97706",
          amberLight: "#FEF3C7",
          blue: "#2563EB",
          blueLight: "#EFF6FF",
          purple: "#7C3AED",
        },
        ivory: "#F8FAFC",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        'glow-crimson': '0 0 20px -3px rgba(211, 61, 86, 0.35)',
        'glow-emerald': '0 0 20px -3px rgba(23, 122, 99, 0.35)',
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;
