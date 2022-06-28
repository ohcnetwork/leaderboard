module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        spacemono:
          '"Space Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        montserrat:
          'Montserrat, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";',
      },
      colors: {
        primary: {
          50: "#F1FFF7",
          100: "#CDFEE1",
          200: "#ABFECE",
          300: "#8EFCBC",
          400: "#75F8AC",
          500: "#5DF59C",
          600: "#5BEC97",
          700: "#48E086",
          800: "#27D36D",
          900: "#1FC061",
        },
        gray: {
          50: "#DADADD",
          100: "#C7C8CC",
          200: "#ABADB4",
          300: "#90939C",
          400: "#6C6F79",
          500: "#595B63",
          600: "#494950",
          700: "#3A3B41",
          800: "#28292D",
          900: "#232326",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
