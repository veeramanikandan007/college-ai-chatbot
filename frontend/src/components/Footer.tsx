import React from 'react';
import { Mail, Globe, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4 text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="text-primary dark:text-secondary shrink-0" />
            <span>Pudukkottai, Tamil Nadu, India</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail size={16} className="text-primary dark:text-secondary shrink-0" />
            <a href="mailto:info@mountzion.ac.in" className="hover:underline">info@mountzion.ac.in</a>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={16} className="text-primary dark:text-secondary shrink-0" />
            <a href="https://mountzion.ac.in" target="_blank" rel="noopener noreferrer" className="hover:underline">mountzion.ac.in</a>
          </div>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 CollegeMate AI. All Rights Reserved.</p>
          <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
            Mount Zion College of Engineering and Technology
          </p>
        </div>
      </div>
    </footer>
  );
}
