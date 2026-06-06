/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#021B3A",
          deep: "#0A2A52",
          accent: "#00D4FF",
          glow: "#00f2ff",
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'hero-gradient': 'radial-gradient(circle at center, #0A2A52 0%, #021B3A 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 212, 255, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
}
