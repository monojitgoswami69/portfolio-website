/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        averia: ['"Averia Serif Libre"', 'serif'],
        geo: ['"Geo"', 'sans-serif'],
        quantico: ['"Quantico"', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      }
    },
  },
  plugins: [],
}
