import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarContent } from './SidebarContent';
import { Backdrop } from './Backdrop';
import { AdminTabId } from './adminNav';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AdminTabId;
  onTabChange: (id: AdminTabId) => void;
}

const mobileSidebarVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { x: '-100%', transition: { duration: 0.22, ease: 'easeOut' } }
};

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, activeTab, onTabChange }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClick={onClose} />
          <motion.div
            variants={mobileSidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-[#0A0A0A] border-r border-[#E2E8F0] dark:border-[#2A2A2A] shadow-2xl md:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <SidebarContent activeTab={activeTab} onTabChange={onTabChange} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
