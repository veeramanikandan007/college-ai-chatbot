export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Headings — League Spartan (Weight 700)
        heading: ['"League Spartan"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Body, UI, Navigation, Chat, Buttons — Inter
        body:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        code:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        // Audit SaaS Typography Scale
        'hero':    ['2.625rem',  { lineHeight: '1.2',  letterSpacing: '-0.02em', fontWeight: '700' }], // 42px
        'page':    ['1.875rem',  { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }], // 30px
        'section': ['1.375rem',  { lineHeight: '1.3',  letterSpacing: '0',       fontWeight: '700' }], // 22px
        'card':    ['1rem',      { lineHeight: '1.4',  letterSpacing: '0',       fontWeight: '700' }], // 16px
        'nav':     ['0.875rem',  { lineHeight: '1.4',  letterSpacing: '0',       fontWeight: '600' }], // 14px
        'body':    ['0.875rem',  { lineHeight: '1.5',  letterSpacing: '0',       fontWeight: '500' }], // 14px
        'caption': ['0.75rem',   { lineHeight: '1.4',  letterSpacing: '0',       fontWeight: '400' }], // 12px
        'small':   ['0.6875rem', { lineHeight: '1.4',  letterSpacing: '0',       fontWeight: '400' }], // 11px
      },
      colors: {
        navy: {
          DEFAULT: '#0E2A6D',
          hover:   '#153B8A',
        },
        royal: {
          DEFAULT: '#1E4DB7',
        },
        gold: {
          DEFAULT: '#D9A441',
        },
        primary: {
          DEFAULT: '#0E2A6D',
          hover:   '#153B8A',
          royal:   '#1E4DB7',
        },
        accent: {
          DEFAULT: '#D9A441',
          hover:   '#C4902E',
        },
        success:  { DEFAULT: '#22C55E' },
        warning:  { DEFAULT: '#F59E0B' },
        danger:   { DEFAULT: '#EF4444' },

        bg: {
          DEFAULT: 'var(--bg-primary)',
          primary: 'var(--bg-primary)',
          sidebar: 'var(--bg-sidebar)',
          card:    'var(--bg-card)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
        heading: 'var(--color-heading)',
        body:    'var(--color-body)',
        muted:   'var(--color-muted)',
      },
      borderRadius: {
        'btn':  '12px',
        'card': '16px',
        'xl':   '12px',
        '2xl':  '16px',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(14,42,109,0.04), 0 4px 16px rgba(14,42,109,0.03)',
        'card-lg':'0 8px 28px rgba(14,42,109,0.06), 0 2px 6px rgba(14,42,109,0.03)',
        'blue':   '0 8px 24px rgba(14,42,109,0.18)',
        'gold':   '0 8px 24px rgba(217,164,65,0.22)',
      },
    },
  },
  plugins: [],
};
