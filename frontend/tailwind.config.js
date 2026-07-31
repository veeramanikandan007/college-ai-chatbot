export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Matches CSS --font-heading variable
        heading: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Matches CSS --font-body variable
        body:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Matches CSS --font-code variable
        code:    ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
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
      letterSpacing: {
        tightest: '-0.03em',
        tighter:  '-0.02em',
        tight:    '-0.01em',
        normal:   '0',
        wide:     '0.01em',
        wider:    '0.02em',
      },
      lineHeight: {
        tight:    '1.25',
        snug:     '1.4',
        normal:   '1.6',
        relaxed:  '1.75',
      },
    },
  },
  plugins: [],
};
