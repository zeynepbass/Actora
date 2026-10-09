/** @type {import('tailwindcss').Config} */

const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        subtle: token("subtle"),
        line: {
          DEFAULT: token("line"),
          strong: token("line-strong"),
        },
        ink: {
          DEFAULT: token("ink"),
          muted: token("ink-muted"),
        },
        brand: {
          DEFAULT: token("brand"),
          hover: token("brand-hover"),
          soft: token("brand-soft"),
          ink: token("brand-ink"),
        },
        danger: {
          DEFAULT: token("danger"),
          soft: token("danger-soft"),
          ink: token("danger-ink"),
        },
        success: {
          soft: token("success-soft"),
          ink: token("success-ink"),
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)",
        overlay: "0 12px 32px rgb(0 0 0 / 0.18)",
      },
      maxWidth: {
        shell: "90rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 180ms ease-out",
      },
    },
  },
  plugins: [],
};
