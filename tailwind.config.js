/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess-light': '#D2B48C',
        'chess-dark': '#8B4513',
        'highlight-blue': '#4A90E2',
        'valid-move': '#7ED321',
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}