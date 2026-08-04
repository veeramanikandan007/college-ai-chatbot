import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Search, Menu, Download, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { AdminTabId, ADMIN_TABS } from './adminNav';

const contentVariants = {
  initial: { opacity: 0, y: 8  },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.14 } },
};

interface AdminLayoutProps {
  activeTab: AdminTabId;
  onTabChange: (id: AdminTabId) => void;
  onExport: () => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  children: React.ReactNode;
}

export default function AdminLayout({
  activeTab,
  onTabChange,
  onExport,
  searchQuery,
  onSearchChange,
  children,
}: AdminLayoutProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active label resolution
  const activeLabel = ADMIN_TABS.find((t: any) => t.id === activeTab)?.label ?? 'Dashboard';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FFFFFF] dark:bg-[#09090B] text-[#111827] dark:text-[#FAFAFA] transition-colors duration-200">
      
      {/* ── Desktop Sidebar ── */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* ── Mobile Sidebar ── */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* ── RIGHT SIDE — Header + Scrollable Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        
        {/* ── Admin Top Header ── */}
        <header className="sticky top-0 z-30 h-[64px] w-full shrink-0 bg-[#FFFFFF] dark:bg-[#111111] border-b border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center px-4 sm:px-6 gap-3 transition-colors duration-150">
          
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-white dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors shrink-0"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>

          {/* Page title */}
          <h1 className="hidden sm:block text-[15px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight shrink-0">
            {activeLabel}
          </h1>

          {/* Search */}
          <div className="flex flex-1 items-center max-w-md px-1">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search users, courses, departments…"
                className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 dark:focus:ring-[#FAFAFA]/20 focus:border-[#111827] dark:focus:border-[#FAFAFA] transition-all"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-white dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors shrink-0"
            >
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications */}
            <button
              title="Notifications"
              className="flex h-10 w-10 relative items-center justify-center rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-white dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors shrink-0"
            >
              <Bell size={17} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white dark:border-[#181818]"></span>
            </button>

            {/* Export button */}
            <button
              onClick={onExport}
              className="h-10 px-3.5 flex items-center gap-2 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-white dark:bg-[#181818] text-[13px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors shrink-0"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        {/* ── Animated Content Area ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
