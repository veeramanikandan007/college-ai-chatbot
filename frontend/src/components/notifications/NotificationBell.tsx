import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationDrawer } from './NotificationDrawer';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E2A6D]/50"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={1.75} className={unreadCount > 0 ? 'text-[#0E2A6D] dark:text-[#60A5FA]' : ''} />

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <NotificationDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
