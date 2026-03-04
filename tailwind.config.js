import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.njk",
    "./**/*.md",
    "./_includes/**/*.njk",
    "./content/**/*.md",
    "./lib/**/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Warm stone — surfaces, text, structure
        surface: {
          50: "#faf8f5",
          100: "#f4f2ee",
          200: "#e8e5df",
          300: "#d5d0c8",
          400: "#a09a90",
          500: "#7a746a",
          600: "#5c5750",
          700: "#3f3b35",
          800: "#2a2722",
          900: "#1c1b19",
          950: "#0f0e0d",
        },
        // Warm amber — default interactive, CTAs, focus rings
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        // Legacy — kept for compatibility, not used in templates
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SF Mono",
          "Monaco",
          "Cascadia Code",
          "monospace",
        ],
      },
      maxWidth: {
        content: "720px",
        wide: "1200px",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "--tw-prose-links": theme("colors.accent.600"),
            maxWidth: "none",
          },
        },
        invert: {
          css: {
            "--tw-prose-links": theme("colors.accent.400"),
          },
        },
      }),
    },
  },
  plugins: [typography],
};
