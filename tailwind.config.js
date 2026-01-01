/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Element colors
        fire: '#E53935',
        earth: '#43A047',
        air: '#FFB300',
        water: '#5C6BC0',
        // Dark theme
        dark: {
          DEFAULT: '#0B0F14',
          lighter: '#141B24',
          card: '#1A222D',
        },
        // Accent colors
        accent: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          gold: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
