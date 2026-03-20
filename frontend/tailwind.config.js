/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1c3d5a", // Deep Blue
        secondary: "#14b8a6", // Teal
        background: "#f3f4f6", // Light Gray
        alert: "#ef4444", // Red
      }
    },
  },
  plugins: [],
}

