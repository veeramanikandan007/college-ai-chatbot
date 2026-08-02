# 🎨 CollegeMate AI — Centralized CSS Variable Theme Guide

**Project**: CollegeMate AI  
**Theme System**: Centralized CSS Variables (`:root` & `:root.dark`) in [`index.css`](file:///c:/Users/PANDIYARAJAN/OneDrive/Desktop/campus-ai-original/college-ai-chatbot/frontend/src/index.css)  
**Context Provider**: [`ThemeContext.tsx`](file:///c:/Users/PANDIYARAJAN/OneDrive/Desktop/campus-ai-original/college-ai-chatbot/frontend/src/context/ThemeContext.tsx)  
**Modes**: `Light Mode`, `Dark Mode`, `System Theme`  
**Storage**: `localStorage.getItem('themeMode')`  
**Date**: July 31, 2026  

---

## 🎨 Theme Palette & CSS Variable Specification

### ☀️ Light Mode (`:root`)
| Variable | Hex Value | Application Target |
|----------|-----------|--------------------|
| `--bg-primary` | `#F8FAFC` | Page Body background |
| `--bg-secondary` | `#EEF2F7` | Inner sections & container background |
| `--bg-sidebar` | `#FFFFFF` | Sidebar panel |
| `--bg-header` | `#FFFFFF` | Sticky Header bar |
| `--bg-card` | `#FFFFFF` | Action & Chat Cards |
| `--color-primary-blue` | `#1E40AF` | Primary Brand Blue |
| `--color-secondary-blue` | `#2563EB` | Secondary Brand Accent |
| `--color-accent-gold` | `#EAB308` | Accent Gold Highlights |
| `--text-primary` | `#0F172A` | Headings & Primary Text |
| `--text-secondary` | `#64748B` | Subtitles & Muted Metadata |
| `--border-color` | `#E2E8F0` | Dividers & Container Borders |
| `--input-bg` | `#FFFFFF` | Input Textarea Background |
| `--hover-bg` | `#EFF6FF` | Hover State Background |
| `--status-success` | `#22C55E` | Verified Badges & Success Toast |
| `--status-warning` | `#F59E0B` | Warning Badges & Notices |
| `--status-error` | `#EF4444` | Error Messages & Delete Actions |

---

### 🌙 Dark Mode (`:root.dark`)
| Variable | Hex Value | Application Target |
|----------|-----------|--------------------|
| `--bg-primary` | `#0B1120` | Page Body background |
| `--bg-secondary` | `#111827` | Inner sections background |
| `--bg-sidebar` | `#111827` | Sidebar panel |
| `--bg-header` | `#0F172A` | Sticky Header bar |
| `--bg-card` | `#1E293B` | Action & Chat Cards |
| `--color-primary-blue` | `#3B82F6` | Primary Brand Blue (Dark Accent) |
| `--color-secondary-blue` | `#60A5FA` | Secondary Brand Accent |
| `--color-accent-gold` | `#FBBF24` | Accent Gold Highlights |
| `--text-primary` | `#F8FAFC` | Headings & Primary Text |
| `--text-secondary` | `#CBD5E1` | Subtitles & Muted Metadata |
| `--border-color` | `#334155` | Dividers & Container Borders |
| `--input-bg` | `#1E293B` | Input Textarea Background |
| `--hover-bg` | `#293548` | Hover State Background |
| `--status-success` | `#22C55E` | Verified Badges & Success Toast |
| `--status-warning` | `#F59E0B` | Warning Badges & Notices |
| `--status-error` | `#EF4444` | Error Messages & Delete Actions |

---

## 🔤 Typography Specification

- **Heading Font**: `Poppins`, `Inter`, sans-serif (SemiBold / Bold)
- **Body Font**: `Inter`, sans-serif (Regular / Medium)
- **Code Font**: `JetBrains Mono`, monospace

---

## 🎛️ Component Styling Rules

- **Buttons**: `rounded-xl` (14px radius), `hover:scale-105 active:scale-95 transition-all duration-200`
- **Cards**: `rounded-2xl` (18px radius), border `border-slate-200 dark:border-slate-800`, backdrop blur `backdrop-blur-md`
- **Inputs**: `rounded-2xl` (16px radius), `focus:ring-2 focus:ring-[#0A2A6A] dark:focus:ring-secondary`
- **User Chat Bubble**: Gradient `from-[#0A2A6A] to-[#163D8C]` (Light) / `bg-slate-800` (Dark)
- **AI Chat Bubble**: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800`

---

## 💻 React Hook Context Usage

```tsx
import { useTheme } from '../context/ThemeContext';

export function ThemeSwitcher() {
  const { isDarkMode, themeMode, setThemeMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  );
}
```

---

## 🔍 Verification & Compliance

- **Instant Switching**: Switches class `dark` on `document.documentElement` without page reload.
- **System Theme Sync**: Automatically adapts to system dark/light preferences when `themeMode = 'system'`.
- **TypeScript Check**: `npx tsc --noEmit` passed with **0 errors**.
