/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Wix Madefor Display"', '"Noto Sans Devanagari"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Noto Sans Devanagari', 'Georgia', 'serif'],
        literary: ['Newsreader', 'Noto Sans Devanagari', 'Georgia', 'serif'],
        mono: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        scDisplay: ['"Wix Madefor Display"', '"Noto Sans Devanagari"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        scSerif: ['"Tiro Kannada"', 'Newsreader', '"Noto Sans Devanagari"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
