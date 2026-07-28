export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A2A6A',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#E8B24D',
          foreground: '#0A2A6A',
        },
        accent: {
          DEFAULT: '#163D8C',
          foreground: '#ffffff',
        }
      },
      boxShadow: {
        glass: '0 20px 60px rgba(0, 0, 0, 0.22)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(59,130,246,0.22), transparent 38%), radial-gradient(circle at bottom right, rgba(168,85,247,0.18), transparent 20%)',
      },
    },
  },
  plugins: [],
};
