/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#F7F8FA',
          dark: '#121212',
        },
        backgroundElement: {
          DEFAULT: "#FFFFFF",
          dark: "#212225",
        },
        backgroundSelected: {
          DEFAULT: "#E8EBEF",
          dark: "#2E3135",
        },
        border: {
          DEFAULT: "#E2E6EB",
          dark: "#2E3135",
        },
        text:{
          DEFAULT: '#181F3B',
          dark: "#ffffff", 
        },
        textSecondary: {
          DEFAULT: '#5B6169',
          dark: "#B0B4BA",
        },
        textTertiary: {
          DEFAULT: '#9AA1AC',
          dark: "#7A7F87",
        },
        textError: {
          DEFAULT: '#B42318',
          dark: "#FF0000",
        },
        primary: {
          DEFAULT: "#208AEF",
          dark: "#208AEF",
        },
        primaryForeground: {
          DEFAULT: "#FFFFFF",
          dark: "#FFFFFF",
        },
        success: {
          DEFAULT: "#059669",
          dark: "#34d399",
        },
        info: {
          DEFAULT: "#2563EB",
          dark: "#60a5fa",
        },
        warning: {
          DEFAULT: "#D97706",
          dark: "#fcd34d",
        },
        danger: {
          DEFAULT: "#DC2626",
          dark: "#f87171",
        },
      },
    },
  },
  plugins: [],
};
