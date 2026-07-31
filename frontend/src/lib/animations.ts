/**
 * CollegeMate AI — Centralized Animation Variants
 * Framer Motion 60fps animation system
 * Respects prefers-reduced-motion via CSS media query on <html>
 */

// ─── Easing Presets ────────────────────────────────────────────────────────
export const ease = {
  smooth: [0.4, 0, 0.2, 1] as const,
  spring: { type: 'spring' as const, damping: 22, stiffness: 280 },
  springSnappy: { type: 'spring' as const, damping: 25, stiffness: 350 },
  springBouncy: { type: 'spring' as const, damping: 18, stiffness: 240 },
  easeOut: 'easeOut' as const,
  easeInOut: 'easeInOut' as const,
};

// ─── Page Transition ────────────────────────────────────────────────────────
export const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: ease.smooth } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2, ease: ease.smooth } },
};

// ─── Fade Up (general content) ─────────────────────────────────────────────
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.smooth } },
  exit:    { opacity: 0, y: 8,  transition: { duration: 0.18, ease: ease.smooth } },
};

// ─── Fade In Only ──────────────────────────────────────────────────────────
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: ease.easeOut } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: ease.smooth } },
};

// ─── Slide from Right (Drawers) ─────────────────────────────────────────────
export const slideFromRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: ease.spring },
  exit:    { x: '100%', opacity: 0, transition: { duration: 0.22, ease: ease.smooth } },
};

// ─── Slide from Left (Sidebar) ─────────────────────────────────────────────
export const slideFromLeft = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: ease.spring },
  exit:    { x: '-100%', opacity: 0, transition: { duration: 0.22, ease: ease.smooth } },
};

// ─── Scale In (Modals/Popovers) ────────────────────────────────────────────
export const scaleIn = {
  initial: { opacity: 0, scale: 0.94, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: ease.springSnappy },
  exit:    { opacity: 0, scale: 0.94, y: 4, transition: { duration: 0.18, ease: ease.smooth } },
};

// ─── Backdrop Fade ─────────────────────────────────────────────────────────
export const backdropFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

// ─── Toast Notification ────────────────────────────────────────────────────
export const toastVariants = {
  initial: { opacity: 0, y: -12, scale: 0.96 },
  animate: { opacity: 1, y: 0,   scale: 1, transition: ease.springSnappy },
  exit:    { opacity: 0, y: -8,  scale: 0.96, transition: { duration: 0.2 } },
};

// ─── Chat Messages ─────────────────────────────────────────────────────────
export const userMessageVariants = {
  initial: { opacity: 0, x: 20, scale: 0.97 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.24, ease: ease.smooth } },
  exit:    { opacity: 0, scale: 0.96,     transition: { duration: 0.15 } },
};

export const aiMessageVariants = {
  initial: { opacity: 0, x: -20, scale: 0.97 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.28, ease: ease.smooth } },
  exit:    { opacity: 0, scale: 0.96,     transition: { duration: 0.15 } },
};

// ─── Stagger Children ─────────────────────────────────────────────────────
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: ease.smooth } },
};

// ─── Card Hover ────────────────────────────────────────────────────────────
export const cardHover = {
  rest:  { y: 0,  scale: 1,    boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: { y: -4, scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', transition: { duration: 0.22, ease: ease.smooth } },
  tap:   { scale: 0.98 },
};

// ─── Button Hover ─────────────────────────────────────────────────────────
export const buttonHover = {
  rest:  { scale: 1 },
  hover: { scale: 1.03, transition: { duration: 0.18 } },
  tap:   { scale: 0.96 },
};

// ─── Icon Hover ───────────────────────────────────────────────────────────
export const iconHover = {
  rest:  { scale: 1, rotate: 0 },
  hover: { scale: 1.12, transition: { duration: 0.16 } },
  tap:   { scale: 0.9 },
};

// ─── Theme Toggle Rotate ──────────────────────────────────────────────────
export const themeToggleVariants = {
  initial: { rotate: -20, opacity: 0, scale: 0.7 },
  animate: { rotate: 0, opacity: 1, scale: 1, transition: { duration: 0.28, ease: ease.springSnappy } },
  exit:    { rotate: 20, opacity: 0, scale: 0.7, transition: { duration: 0.18 } },
};

// ─── Sidebar Item Hover ───────────────────────────────────────────────────
export const sidebarItemHover = {
  rest:  { x: 0, backgroundColor: 'rgba(0,0,0,0)' },
  hover: { x: 3, transition: { duration: 0.18 } },
  tap:   { scale: 0.98, x: 0 },
};

// ─── Typing Dots ──────────────────────────────────────────────────────────
export const typingDotVariants = {
  initial:  { y: 0, opacity: 0.4 },
  animate:  { y: -5, opacity: 1 },
};

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────
export const shimmerVariants = {
  initial: { x: '-100%' },
  animate: { x: '100%', transition: { duration: 1.4, ease: 'linear', repeat: Infinity } },
};

// ─── Notification Bell Bounce ─────────────────────────────────────────────
export const bellBounce = {
  animate: {
    rotate: [0, -12, 10, -8, 6, 0],
    transition: { duration: 0.6, ease: ease.smooth },
  },
};

// ─── Voice Pulse ──────────────────────────────────────────────────────────
export const voicePulse = {
  animate: {
    scale: [1, 1.18, 1],
    opacity: [0.6, 0.2, 0.6],
    transition: { duration: 1.4, ease: 'easeInOut', repeat: Infinity },
  },
};

// ─── Upload Progress ──────────────────────────────────────────────────────
export const progressBar = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: { duration: 0.35, ease: ease.smooth },
  }),
};

// ─── Success Checkmark ────────────────────────────────────────────────────
export const checkmark = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: ease.smooth } },
};
