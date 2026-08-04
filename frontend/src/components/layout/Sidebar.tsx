import React, { useState } from 'react';
import { SidebarContent } from './SidebarContent';
import { motion } from 'framer-motion';
import { AdminTabId } from './adminNav';

interface SidebarProps {
  activeTab: AdminTabId;
  onTabChange: (id: AdminTabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="hidden md:flex flex-col h-[100dvh] shrink-0 bg-white dark:bg-[#0A0A0A] select-none border-r border-[#E2E8F0] dark:border-[#2A2A2A] relative z-40"
    >
      <SidebarContent 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
    </motion.aside>
  );
};
