/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fifa: {
          dark: '#07020E',      // Brand dark violet
          darker: '#030107',    // Near black
          purple: '#120A2A',    // Medium violet
          card: 'rgba(18, 10, 42, 0.45)', // Glassmorphism backdrop
          blue: '#4285F4',      // Google Blue
          green: '#34A853',     // Google Green
          gold: '#F59E0B',      // FIFA Gold
          pink: '#EC4899',      // FIFA Pink
          red: '#E11D48',       // FIFA Red
          teal: '#00F2FE',      // Neon Teal accent
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'fifa-gradient': 'linear-gradient(135deg, #07020E 0%, #120A2A 50%, #0F0A1E 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00F2FE 0%, #EC4899 50%, #F59E0B 100%)',
      },
      boxShadow: {
        'neon-teal': '0 0 15px rgba(0, 242, 254, 0.4)',
        'neon-pink': '0 0 15px rgba(236, 72, 153, 0.4)',
        'neon-gold': '0 0 15px rgba(245, 158, 11, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 25s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
