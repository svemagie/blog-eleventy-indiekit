import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.njk",
    "./**/*.md",
    "./_includes/**/*.njk",
    "./content/**/*.md",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
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
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
      },
      fontFamily: {
        sans: [
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
            "--tw-prose-links": theme("colors.primary.600"),
            maxWidth: "none",
          },
        },
        invert: {
          css: {
            "--tw-prose-links": theme("colors.primary.400"),
          },
        },
      }),
    },
  },
  plugins: [typography],
};
