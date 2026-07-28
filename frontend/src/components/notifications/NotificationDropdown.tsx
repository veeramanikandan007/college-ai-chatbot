import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationCard } from './NotificationCard';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications(undefined, false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-14 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 flex flex-col max-h-[85vh]"
    >
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-[#163D8C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h2>
        
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllAsRead()}
            className="text-xs text-[#163D8C] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 10).map((notif) => (
            <NotificationCard 
              key={notif.id}
              notification={notif}
              onRead={(id) => markAsRead(id)}
              onDelete={(id) => deleteNotification(id)}
            />
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            You're all caught up!
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-center">
        <button 
          onClick={() => { onClose(); navigate('/notifications'); }}
          className="text-sm font-medium text-[#163D8C] dark:text-blue-400 hover:underline"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
