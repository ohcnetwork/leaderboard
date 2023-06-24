/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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
          50: '#f8f5fc',
          100: '#f0eafb',
          200: '#d3bff3',
          300: '#b08ee6',
          400: '#976ae2',
          500: '#6025c0',
          600: '#4d1e9a',
          700: '#380d80',
          800: '#35156b',
          900: '#1f0d40',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
