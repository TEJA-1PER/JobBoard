/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#5B8CFF", dark: "#3667E9" }
      },
      boxShadow: {
        glass: "0 8px 30px rgba(0,0,0,0.12)"
      }
    }
  },
  plugins: []
};
