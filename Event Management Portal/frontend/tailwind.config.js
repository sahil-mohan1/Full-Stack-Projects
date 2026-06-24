/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // emerald-500
          600: '#059669', // emerald-600
          700: '#047857', // emerald-700
          800: '#065f46',
          900: '#064e3b',
        },
        darkbg: '#0f172a',    // slate-900
        darkcard: '#1e293b',  // slate-800
        darkborder: '#334155',// slate-700
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
