import { useState } from 'react';
import { Bell, Loader2, Check } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationCard } from '../../components/notifications/NotificationCard';

export default function NotificationsPage() {
  const [filterType, setFilterType] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications(filterType, unreadOnly);

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'academic', label: 'Academic' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'ai', label: 'AI Updates' },
    { value: 'alert', label: 'Alerts' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] custom-scrollbar font-body">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row gap-6">
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
                <Bell className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
                Notifications
              </h1>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Manage and view all your campus alerts.</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-small font-btn bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0E2A6D] dark:text-[#60A5FA] px-4 py-2 rounded-xl hover:bg-[#F5F7FB] dark:hover:bg-[#111827] flex items-center gap-2 transition"
              >
                <Check size={16} /> Mark all as read
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#334155] overflow-hidden divide-y divide-[#E2E8F0] dark:divide-[#334155] min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="animate-spin text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-[#64748B] dark:text-[#94A3B8]">
                <Bell size={48} className="mb-4 text-[#64748B]/40" />
                <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">No notifications</h3>
                <p className="text-small">You are all caught up!</p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationCard 
                  key={notification.id}
                  notification={notification}
                  onRead={(id) => markAsRead(id)}
                  onDelete={(id) => deleteNotification(id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#334155] p-4">
            <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] mb-4">Filters</h3>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-small text-[#475569] dark:text-[#CBD5E1] cursor-pointer p-2 rounded-xl hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] transition">
                <input 
                  type="checkbox" 
                  checked={unreadOnly} 
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded text-[#0E2A6D] focus:ring-[#0E2A6D]"
                />
                Unread only
              </label>
            </div>

            <div className="mt-6">
              <h4 className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#64748B] dark:text-[#94A3B8] mb-3">Categories</h4>
              <div className="space-y-1">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-small transition font-medium ${
                      filterType === option.value 
                        ? 'bg-[#0E2A6D] text-white shadow-xs font-semibold' 
                        : 'text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
