import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    path.resolve(__dirname, 'index.html'),
    path.resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        /* Softer pastel palette used across the app */
        primary: '#A5B4FC',   // pastel indigo
        secondary: '#6EE7B7', // pastel emerald
        accent: '#F9A8D4',    // pastel pink
        dark: '#1E293B',      // soft slate for headings
        light: '#F9FAFB',     // very light gray background
      },
    },
  },
  plugins: [],
}









