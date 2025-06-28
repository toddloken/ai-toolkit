/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,jsx}",
    "./src/hooks/**/*.{js,jsx}",
    "./src/services/**/*.{js,jsx}",
    "./src/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}