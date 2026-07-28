import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sun, Moon, MessageSquare, Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [handsFreeActive, setHandsFreeActive] = useState(false);

  useEffect(() => {
    const checkSettings = () => {
      const saved = localStorage.getItem('voice_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHandsFreeActive(!!parsed.handsFree);
        } catch (e) {}
      }
    };
    checkSettings();
    window.addEventListener('storage', checkSettings);
    const interval = setInterval(checkSettings, 1000);
    return () => {
      window.removeEventListener('storage', checkSettings);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-primary text-white dark:bg-secondary dark:text-slate-900 shadow-md shadow-primary/20 dark:shadow-secondary/20 scale-[1.02]'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-xl text-base font-semibold transition ${
      isActive
        ? 'bg-primary text-white dark:bg-secondary dark:text-slate-900'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/chat" className={navLinkClass}>
            AI Chat
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        {/* Action Button & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {handsFreeActive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/10 border border-secondary/30 text-amber-600 dark:text-secondary text-xs font-extrabold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Hands-Free
            </div>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition active:scale-95"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent dark:from-accent dark:to-primary text-white text-sm font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] transition-all duration-200 active:scale-95"
          >
            <MessageSquare size={16} />
            Start Chat
          </Link>
        </div>

        {/* Mobile menu and theme buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 transition-colors duration-300">
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              Home
            </NavLink>
            <NavLink
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              AI Chat
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              About
            </NavLink>
          </nav>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white dark:from-accent dark:to-primary text-base font-semibold shadow-md hover:opacity-95 transition"
            >
              <MessageSquare size={18} />
              Start Chat
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
