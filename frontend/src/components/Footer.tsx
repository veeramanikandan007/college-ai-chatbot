import React from 'react';
import { Mail, Globe, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] dark:border-[#334155] bg-white/70 backdrop-blur-md dark:bg-[#111827]/70 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4 text-center space-y-4 font-body">
        <div className="flex flex-wrap justify-center gap-6 text-body text-[#64748B] dark:text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#0E2A6D] dark:text-[#60A5FA] shrink-0" />
            <span>Pudukkottai, Tamil Nadu, India</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-[#0E2A6D] dark:text-[#60A5FA] shrink-0" />
            <a href="mailto:info@mountzion.ac.in" className="hover:text-[#1E4DB7] dark:hover:text-[#D9A441] transition-colors">info@mountzion.ac.in</a>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[#0E2A6D] dark:text-[#60A5FA] shrink-0" />
            <a href="https://mountzion.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E4DB7] dark:hover:text-[#D9A441] transition-colors">mountzion.ac.in</a>
          </div>
        </div>
        <div className="text-small text-[#64748B] dark:text-[#94A3B8]">
          <p>© 2026 CollegeMate AI. All Rights Reserved.</p>
          <p className="mt-1 font-heading font-bold text-[#0E2A6D] dark:text-[#D9A441] tracking-[0.02em]">
            Mount Zion College of Engineering and Technology
          </p>
        </div>
      </div>
    </footer>
  );
}
