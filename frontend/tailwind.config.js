export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
<<<<<<< HEAD
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
=======
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
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
      },
      boxShadow: {
        glass: '0 20px 60px rgba(0, 0, 0, 0.22)',
      },
      backgroundImage: {
<<<<<<< HEAD
        'hero-gradient': 'radial-gradient(circle at top, rgba(59,130,246,0.22), transparent 38%), radial-gradient(circle at bottom right, rgba(168,85,247,0.18), transparent 20%)',
=======
        'hero-gradient': 'radial-gradient(circle at top, rgba(0, 51, 102, 0.15), transparent 45%), radial-gradient(circle at bottom right, rgba(253, 185, 19, 0.1), transparent 30%)',
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
      },
    },
  },
  plugins: [],
};
