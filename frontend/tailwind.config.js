/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', 
    './src/**/*.{js,jsx,ts,tsx}',
    '../packages/notification-widget/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          DEFAULT: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
          border: '#334155',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
    },
  },
  plugins: [],
};
