/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#060608',
          900: '#0c0d11',
          850: '#12131a',
          800: '#191b24',
          750: '#202330',
          700: '#2a2e40',
          600: '#3c4159',
          500: '#52597a',
          400: '#757eab'
        },
        dossier: {
          bg: '#f6f1e3',
          card: '#fffef9',
          aged: '#eadeca',
          border: '#cfbf9f',
          ink: '#1c1917',
          stamp: '#991b1b',
          faded: '#78716c'
        },
        crt: {
          green: '#22c55e',
          amber: '#fbbf24',
          cyan: '#38bdf8',
          bg: '#050c07',
          text: '#4ade80'
        }
      },
      fontFamily: {
        mono: ['"Courier Prime"', 'Courier', 'monospace', '"Consolas"', '"JetBrains Mono"'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'lamp': '0 0 80px 25px rgba(245, 158, 11, 0.18)',
        'crt': 'inset 0 0 30px rgba(34, 197, 94, 0.15), 0 0 20px rgba(34, 197, 94, 0.25)',
        'paper': '0 4px 15px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.2)',
        'pin': '0 3px 6px rgba(0, 0, 0, 0.6)'
      }
    },
  },
  plugins: [],
}

