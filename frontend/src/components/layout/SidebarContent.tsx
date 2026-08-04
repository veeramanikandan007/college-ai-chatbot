import React from 'react';
import { GraduationCap, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../UserAvatar';
import { ADMIN_TABS, AdminTabId } from './adminNav';

interface SidebarContentProps {
  activeTab: AdminTabId;
  onTabChange: (id: AdminTabId) => void;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  activeTab,
  onTabChange,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { user, logout } = useAuth();

  const handleTabClick = (id: AdminTabId) => {
    onTabChange(id);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-transparent text-zinc-900 dark:text-[#FAFAFA] select-none py-3 px-3 box-border relative">
      {/* Brand Header */}
      <div className={`flex items-center h-[60px] shrink-0 border-b border-[#E2E8F0] dark:border-[#2A2A2A] ${isCollapsed ? 'justify-center px-0' : 'px-3 justify-between'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex w-[34px] h-[34px] items-center justify-center rounded-xl bg-[#0F172A] text-white dark:bg-zinc-100 dark:text-zinc-900 shrink-0 shadow-sm">
            <GraduationCap size={18} strokeWidth={2} />
          </div>
          <AnimatePresence mode="popLayout">
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }} 
                transition={{ duration: 0.15 }}
                className="min-w-0 whitespace-nowrap"
              >
                <p className="font-heading font-bold text-[16px] tracking-tight text-[#0F172A] dark:text-[#FAFAFA] truncate">
                  CollegeMate AI
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors ${isCollapsed ? 'hidden' : ''}`}
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={18} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* When collapsed, show expand button below the logo or keep logo only. The user's screenshot shows PanelLeftClose. For collapsed mode, the user can click the logo? Wait, if we hide the toggle button in collapsed mode, they can't expand! So if it's collapsed, we should show the PanelLeft icon. */}
      {isCollapsed && onToggleCollapse && (
         <div className="flex justify-center mt-2">
           <button
             onClick={onToggleCollapse}
             className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
             title="Expand Sidebar"
           >
             <PanelLeft size={18} strokeWidth={1.75} />
           </button>
         </div>
      )}

      {/* Nav Items */}
      <nav className={`flex-1 overflow-y-auto py-2 space-y-1 no-scrollbar ${isCollapsed ? 'px-0' : 'px-1'}`}>
        {!isCollapsed && (
          <p className="px-2 mb-2 text-[11px] font-semibold text-zinc-400 dark:text-[#737373] uppercase tracking-widest">
            Management
          </p>
        )}
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as AdminTabId)}
              title={isCollapsed ? tab.label : undefined}
              className={`
                w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 px-3'} h-[36px] rounded-lg text-[13.5px] transition-all duration-150 text-left shrink-0
                ${isActive
                  ? 'bg-zinc-100 dark:bg-[#1A1A1A] text-zinc-900 dark:text-[#FAFAFA] font-semibold'
                  : 'text-zinc-600 dark:text-[#A3A3A3] font-medium hover:bg-zinc-100/70 dark:hover:bg-[#1A1A1A]/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.75} className={`shrink-0 ${isActive ? 'text-zinc-900 dark:text-[#FAFAFA]' : 'text-zinc-500 dark:text-[#A3A3A3]'}`} />
              <AnimatePresence mode="popLayout">
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }} 
                    transition={{ duration: 0.15 }}
                    className="truncate whitespace-nowrap"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Footer — User Info + Logout */}
      <div className={`shrink-0 py-3 border-t border-[#E2E8F0] dark:border-[#2A2A2A] mt-2 ${isCollapsed ? 'px-0' : 'px-1'}`}>
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between gap-2'} p-1.5 rounded-[14px]`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} min-w-0 w-full`}>
            <div title={isCollapsed ? (user?.name || 'Admin') : undefined}>
              <UserAvatar user={user} size="sm" />
            </div>
            <AnimatePresence mode="popLayout">
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }} 
                  transition={{ duration: 0.15 }}
                  className="flex flex-col min-w-0 whitespace-nowrap"
                >
                  <span className="truncate text-[15px] font-normal text-[#1F2937] dark:text-[#F8FAFC]">
                    {user?.name || 'Admin'}
                  </span>
                  <span className="truncate text-[13px] text-[#64748B] dark:text-[#A3A3A3]">
                    Administrator
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={logout}
            className="w-[36px] h-[36px] rounded-xl flex items-center justify-center shrink-0 text-[#64748B] dark:text-[#A3A3A3] hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-[#EF4444] transition-all duration-250"
            title="Sign Out"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Removed the absolute toggle button from here because it is now inside the brand header */}
    </div>
  );
};
