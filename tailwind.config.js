// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#393B65", // Dark, for headers, primary buttons
        accent: "#A294C7", // Mid, for secondary text, borders, highlights
        light: "#F1E3F0", // Light, for backgrounds
      },
    },
  },
  plugins: [],
};