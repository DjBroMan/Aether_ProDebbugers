/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        aether: {
          bg: '#0F172A',
          surface: '#1E293B',
          card: '#1A2740',
          primary: '#38BDF8',
          secondary: '#818CF8',
          accent: '#34D399',
          danger: '#F87171',
          warning: '#FBBF24',
          text: '#F1F5F9',
          muted: '#94A3B8',
          border: '#334155',
        },
      },
    },
  },
  plugins: [],
};
