/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          peach: '#FAD6A5',
          pink: '#F6B3C4',
          lavender: '#BBAEE3',
          skyblue: '#77CAF3',
          navy: '#11476C',
        },
        primary: {
          DEFAULT: '#11476C',
          hover: '#0D3856',
          light: '#E0F2FE',
        },
        secondary: {
          DEFAULT: '#77CAF3',
          light: '#BBAEE3',
        },
        status: {
          normal: '#16A34A',
          normalBg: '#DCFCE7',
          warning: '#D97706',
          warningBg: '#FAD6A5',
          critical: '#DC2626',
          criticalBg: '#F6B3C4',
        },
        sos: {
          DEFAULT: '#EF4444',
          glow: '#F6B3C4',
        },
        neutral: {
          text: '#11476C',
          subtext: '#475569',
          border: '#E2E8F0',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
        },
      }
    },
  },
  plugins: [],
}
