/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#F5F7FA',
          dark: '#121212',
        },
        backgroundElement: {
          DEFAULT: "#F0F0F3",
          dark: "#212225",
        },
        backgroundSelected: {
          DEFAULT: "#E0E1E6",
          dark: "#2E3135",
        },
        text:{
          DEFAULT: '#181F3B',
          dark: "#ffffff", 
        },
        textSecondary: {
          DEFAULT: '#60646A',
          dark: "#B0B4BA",
        },   
        textError: {
          DEFAULT: '#B42318',
          dark: "#FF0000",
        } 
        
        
      },
    },
  },
  plugins: [],
};
