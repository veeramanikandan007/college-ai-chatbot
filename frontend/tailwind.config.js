export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      fontFamily: {
        heading: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        body: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          DEFAULT: '#111827',
          hover:   '#1F2937',
        },
        secondary: {
          DEFAULT: '#F3F4F6',
          hover:   '#E5E7EB',
        },
        accent: {
          DEFAULT: '#111827',
          hover:   '#1F2937',
        },
        navy: {
          DEFAULT: '#111827',
          hover:   '#1F2937',
        },
        royal: {
          DEFAULT: '#111827',
        },
        gold: {
          DEFAULT: '#111827',
        },
        success: { DEFAULT: '#16A34A' },
        warning: { DEFAULT: '#F59E0B' },
        danger:  { DEFAULT: '#DC2626' },
        info:    { DEFAULT: '#2563EB' },
      },
      borderRadius: {
        /* ── Premium Shape Tokens ─────────────────────────── */
        'none':   '0px',
        'xs':     '8px',    /* Checkbox, small chips, code blocks */
        'sm':     '10px',   /* Sidebar items, secondary buttons, inputs */
        'md':     '12px',   /* Primary buttons, inputs, search, dropdowns, tooltips, AI avatar */
        'lg':     '16px',   /* Cards, stat cards, command palette, tables, popovers */
        'xl':     '20px',   /* Modals, drawers, large panels */
        'xxl':    '24px',   /* Hero sections, feature cards */
        'pill':   '9999px', /* Badges, chips, tags */
        /* ── Legacy aliases for backward compat ──────────── */
        'btn':    '12px',
        'input':  '12px',
        'card':   '16px',
        'dialog': '20px',
        'modal':  '20px',
        /* ── Tailwind defaults preserved ─────────────────── */
        'DEFAULT': '0.25rem',
        'full':   '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        '200': '200ms',
      },
    },
  },
  plugins: [],
};
