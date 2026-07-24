/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: '#000000',
        background: '#ffffff',
        backgroundElement: '#F0F0F3',
        backgroundSelected: '#E0E1E6',
        textSecondary: '#60646C',
      },
    },
  },
  plugins: [],
}
