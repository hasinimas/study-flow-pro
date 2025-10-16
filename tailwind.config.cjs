/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#06b6d4',
          600: '#7c3aed'
        }
      }
    },
  },
  plugins: [],
}
