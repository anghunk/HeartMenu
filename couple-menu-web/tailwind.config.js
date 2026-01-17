import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d97757',
        secondary: '#6b6b6b',
        accent: '#da7756',
        background: '#fcf7f1',
        surface: '#ffffff',
        text: '#383838',
        muted: '#9e9e9e',
        success: '#4d8b55',
        warning: '#d49e2a',
        error: '#d15648',
        info: '#4a8bb3',
      },
      fontFamily: {
        heading: ['Merriweather', ...defaultTheme.fontFamily.serif],
        body: ['"DM Sans"', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: '1rem',
      },
    },
  },
  plugins: [],
};
