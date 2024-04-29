/** @type {import("tailwindcss").Config} */
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
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
        },
        secondary: {
          50: "var(--secondary-50)",
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
          700: "var(--secondary-700)",
          800: "var(--secondary-800)",
          900: "var(--secondary-900)",
          950: "var(--secondary-950)",
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
