/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f7f2',
        surface: '#ffffff',
        forest: '#315c4b',
        'forest-dark': '#24483a',
        'forest-light': '#3d6f5c',
        sage: '#e5eee7',
        'sage-light': '#f0f5f1',
        slate: '#e8eef4',
        ink: '#24332e',
        'ink-muted': '#6c7771',
        clinical: {
          border: '#e2e8f0',
          teal: '#0d9488',
          blue: '#2563eb',
          purple: '#7c3aed',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
