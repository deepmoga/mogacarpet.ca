/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1212ff',      // Logo Royal Blue
          blueDark: '#0a0ad8',
          blueDeep: '#060680',
          blueLight: '#4d4dff',
          blueSoft: '#eef0ff',
          red: '#ff0000',       // Logo Vibrant Red
          redDark: '#cc0000',
          redDeep: '#990000',
          redLight: '#ff4d4d',
          redSoft: '#fff0f0',
          navy: '#0b1026',      // Premium dark navy background
          navySurface: '#121838',
          darkCard: '#182046',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      boxShadow: {
        'brand': '0 10px 30px -10px rgba(18, 18, 255, 0.15), 0 4px 12px -2px rgba(255, 0, 0, 0.10)',
        'brand-hover': '0 20px 40px -12px rgba(18, 18, 255, 0.25), 0 8px 20px -4px rgba(255, 0, 0, 0.20)',
        'blue-glow': '0 0 25px rgba(18, 18, 255, 0.35)',
        'red-glow': '0 0 25px rgba(255, 0, 0, 0.40)',
      }
    },
  },
  plugins: [],
};

export default config;
