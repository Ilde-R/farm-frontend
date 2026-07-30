/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#181F3B",
        backgroundElement: {
          DEFAULT: "#F0F0F3",
          dark: "#212225",
        },
        backgroundSelected: {
          DEFAULT: "#E0E1E6",
          dark: "#2E3135",
        },
        text: "#ffffff",
        textSecondary: "#B0B4BA",
        textError: "#FF0000",
      },
    },
  },
  plugins: [],
};
