export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003366',
          light: '#00478f',
          dark: '#001f40',
        },
        secondary: {
          DEFAULT: '#FDB913',
          light: '#fec43f',
          dark: '#c99002',
        },
        accent: {
          DEFAULT: '#2563EB',
          light: '#60a5fa',
          dark: '#1d4ed8',
        },
      },
      boxShadow: {
        glass: '0 20px 60px rgba(0, 0, 0, 0.22)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(0, 51, 102, 0.15), transparent 45%), radial-gradient(circle at bottom right, rgba(253, 185, 19, 0.1), transparent 30%)',
      },
    },
  },
  plugins: [],
};
