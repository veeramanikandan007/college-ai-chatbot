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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row gap-6">
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Bell className="text-[#0A2A6A] dark:text-blue-400" />
                Notifications
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage and view all your campus alerts.</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#163D8C] dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition"
              >
                <Check size={16} /> Mark all as read
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="animate-spin text-[#163D8C] dark:text-blue-400" size={32} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                <Bell size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No notifications</h3>
                <p className="text-sm">You are all caught up!</p>
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Filters</h3>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                <input 
                  type="checkbox" 
                  checked={unreadOnly} 
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded text-[#163D8C] focus:ring-[#163D8C]"
                />
                Unread only
              </label>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Categories</h4>
              <div className="space-y-1">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      filterType === option.value 
                        ? 'bg-[#163D8C] text-white font-medium shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
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
