/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020817',
          900: '#0a1628',
          800: '#0f2040',
          700: '#1a3055',
        },
        cyber: {
          cyan: '#06b6d4',
          green: '#00ff88',
          red: '#ff2d55',
          orange: '#ff6b35',
          yellow: '#ffd60a',
        }
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(6,182,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}