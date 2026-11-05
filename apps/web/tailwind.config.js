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
          950: '#070709',
          900: '#0c0b0a',
          850: '#131211',
          800: '#1b1918',
          700: '#282523',
        },
        cork: {
          base: '#4c3321',
          dark: '#382215',
          border: '#2c1a11'
        },
        parchment: {
          DEFAULT: '#f4efe4',
          card: '#ede6d6',
          ink: '#22211f',
          muted: '#6b6357'
        },
        manila: {
          DEFAULT: '#dfc596',
          dark: '#c4a670',
          text: '#2d2417'
        },
        crimson: {
          DEFAULT: '#7a1d1d',
          dark: '#631515',
          text: '#fee2e2'
        },
        crt: {
          green: '#4ade80',
          dark: '#081009',
          border: '#14381b',
          dim: '#166534'
        }
      },
      fontFamily: {
        typewriter: ['"Special Elite"', '"Courier Prime"', 'Courier', 'monospace'],
        mono: ['"Courier Prime"', 'Courier', 'monospace'],
        digital: ['"Share Tech Mono"', '"Courier Prime"', 'monospace']
      }
    },
  },
  plugins: [],
}
