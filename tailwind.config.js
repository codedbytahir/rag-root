/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,jsx,mdx}",
      "./components/**/*.{js,jsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          // These match your HTML exactly
          primary: "#39E079", 
          "primary-hover": "#0bcbcb", 
          "background-dark": "#122017",
          "surface-dark": "#182121",
        },
        fontFamily: {
          // We will load Inter in the layout file
          sans: ['var(--font-inter)', 'sans-serif'], 
        },
      },
    },
    plugins: [],
  };