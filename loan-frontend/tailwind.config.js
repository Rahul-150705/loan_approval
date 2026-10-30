/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        theme: {
          bg: '#FAFAF8',
          card: '#FFFFFF',
          muted: '#F4F2EE',
          border: '#E7E3DC',
          dark: '#1F1E1D',
          sub: '#6B6861',
        },
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'float': 'floatUp 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
