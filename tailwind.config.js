/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./client/src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
        },
      },
      fontFamily: {
        mono: ["Fira Code", "JetBrains Mono", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
