/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'loom-purple': '#625DF5',
        'loom-light': '#8B87FF',
        'loom-dark': '#4C46E3',
      },
    },
  },
  plugins: [],
}