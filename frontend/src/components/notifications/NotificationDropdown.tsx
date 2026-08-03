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
      className="absolute right-0 top-14 w-80 sm:w-96 bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] shadow-2xl border border-[#D1D5DB] dark:border-[#3F3F46] overflow-hidden z-50 flex flex-col max-h-[85vh]"
    >
      <div className="p-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#111111]">
        <h2 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
              {unreadCount} new
            </span>
          )}
        </h2>
        
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllAsRead()}
            className="text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin text-[#6B7280] dark:text-[#A3A3A3]" />
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
          <div className="p-8 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">
            You're all caught up!
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-center">
        <button 
          onClick={() => { onClose(); navigate('/notifications'); }}
          className="text-[13px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:underline cursor-pointer"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
