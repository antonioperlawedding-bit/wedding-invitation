/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#020d07',
          900: '#050d0a',
          800: '#0a1a12',
          700: '#0d2b1a',
          600: '#2d6a4f',
          500: '#40916c',
          400: '#52b788',
          300: '#74c69d',
        },
        gold: {
          DEFAULT: '#c9a84c',
          50: '#fdfaf0',
          100: '#faf3d6',
          200: '#f0d080',
          300: '#e8c96a',
          400: '#d4af37',
          500: '#c9a84c',
          600: '#b8943a',
          700: '#9a7828',
          800: '#7a5e1a',
          900: '#5a440f',
        },
        ivory: {
          DEFAULT: '#faf8f0',
          50: '#fffdf7',
          100: '#faf8f0',
          200: '#f5f0e8',
          300: '#ede6d6',
          400: '#e0d4be',
        },
        dark: '#050d0a',
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        jost: ['Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.5em',
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'draw-line': 'drawLine 1.5s ease-out forwards',
        fadeInUp: 'fadeInUp 0.8s ease-out forwards',
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 168, 76, 0.4)' },
          '50%': { boxShadow: '0 0 0 16px rgba(201, 168, 76, 0)' },
        },
        drawLine: {
          'from': { strokeDashoffset: '1000' },
          'to': { strokeDashoffset: '0' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
