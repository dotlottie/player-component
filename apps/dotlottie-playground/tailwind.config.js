/**
 * Copyright 2023 Design Barn Inc.
 */

/** @type {import('tailwindcss').Config} */

const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#1e1e1e',
      },
    },
  },
  plugins: [],
};

export default config;
