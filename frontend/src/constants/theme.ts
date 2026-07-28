// ─── CollegeMate AI — Global Color Theme ────────────────────────────────────
// Import this file in EVERY component. Never hardcode hex colors in components.

export const THEME_COLORS = {
  // Brand
  primaryNavy:    '#0A2A6A',
  secondaryBlue:  '#163D8C',
  accentGold:     '#E8B24D',

  // Surfaces
  white:          '#FFFFFF',
  background:     '#F5F7FA',
  surface:        '#F8FAFC',

  // Text
  textDark:       '#1F2937',
  subtext:        '#64748B',

  // Borders
  border:         '#E2E8F0',
  borderHover:    '#CBD5E1',

  // Status
  success:        '#10B981',
  warning:        '#F59E0B',
  danger:         '#EF4444',
} as const;

// ─── Tailwind className helpers (for dynamic class building) ─────────────────
export const THEME = {
  primaryBg:      'bg-[#0A2A6A]',
  primaryHoverBg: 'hover:bg-[#163D8C]',
  primaryText:    'text-[#0A2A6A]',
  primaryBorder:  'border-[#0A2A6A]',

  secondaryBg:    'bg-[#163D8C]',
  secondaryText:  'text-[#163D8C]',
  secondaryBorder:'border-[#163D8C]',

  accentBg:       'bg-[#E8B24D]',
  accentText:     'text-[#E8B24D]',
  accentBorder:   'border-[#E8B24D]',

  appBg:          'bg-[#F5F7FA]',
  surfaceBg:      'bg-[#F8FAFC]',
  cardBg:         'bg-white',
  textMain:       'text-[#1F2937]',
  subtext:        'text-[#64748B]',
  borderLight:    'border-[#E2E8F0]',
} as const;
