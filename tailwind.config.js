/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#39E079", 
          "primary-hover": "#0bcbcb", 
          "background-dark": "#122017",
          "surface-dark": "#182121",
        },
        fontFamily: {
          sans: ['var(--font-inter)', 'sans-serif'], 
        },
      },
    },
    plugins: [],
  };
