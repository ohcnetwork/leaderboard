/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: [
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";',
        ],
      },
      colors: {
        primary: {
          50: "#f8f5fc",
          100: "#f0eafb",
          200: "#d3bff3",
          300: "#b08ee6",
          400: "#976ae2",
          500: "#6025c0",
          600: "#4d1e9a",
          700: "#380d80",
          800: "#35156b",
          900: "#1f0d40",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        "circular-shadow": "circular-shadow-motion 8s linear infinite",
      },
      keyframes: {
        "circular-shadow-motion": {
          "0%, 100%": {
            "box-shadow": "8px 0 12px -3px, 3px 0 5px -3px",
          },
          "12.5%": {
            "box-shadow": "5.6px 5.6px 12px -3px, 2.1px 2.1px 5px -3px",
          },
          "25%": {
            "box-shadow": "0 8px 12px -3px, 0 3px 5px -3px",
          },
          "37.5%": {
            "box-shadow": "-5.6px 5.6px 12px -3px, -2.1px 2.1px 5px -3px",
          },
          "50%": {
            "box-shadow": "-8px 0 12px -3px, -3px 0 5px -3px",
          },
          "62.5%": {
            "box-shadow": "-5.6px -5.6px 12px -3px, -2.1px -2.1px 5px -3px",
          },
          "75%": {
            "box-shadow": "0 -8px 12px -3px, 0 -3px 5px -3px",
          },
          "87.5%": {
            "box-shadow": "5.6px -5.6px 12px -3px, 2.1px -2.1px 5px -3px",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
