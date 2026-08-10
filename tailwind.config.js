/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: 'rgb(var(--color-pink) / <alpha-value>)',
          pinkDark: 'rgb(var(--color-pink-dark) / <alpha-value>)',
          lilac: 'rgb(var(--color-lilac) / <alpha-value>)',
          lilacDark: 'rgb(var(--color-lilac-dark) / <alpha-value>)',
          teal: 'rgb(var(--color-teal) / <alpha-value>)',
          tealDark: 'rgb(var(--color-teal-dark) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          raised: 'rgb(var(--color-surface-raised) / <alpha-value>)',
          sunken: 'rgb(var(--color-surface-sunken) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        content: {
          DEFAULT: 'rgb(var(--color-content) / <alpha-value>)',
          muted: 'rgb(var(--color-content-muted) / <alpha-value>)',
        },
        status: {
          paid: 'rgb(var(--color-status-paid) / <alpha-value>)',
          pending: 'rgb(var(--color-status-pending) / <alpha-value>)',
          late: 'rgb(var(--color-status-late) / <alpha-value>)',
          canceled: 'rgb(var(--color-status-canceled) / <alpha-value>)',
        },
      },
      borderRadius: {
        card: '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
