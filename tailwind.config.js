module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
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
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
