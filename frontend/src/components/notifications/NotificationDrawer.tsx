import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  Pin,
  Archive,
  Mail,
  X,
  ExternalLink,
  Loader2,
  Settings,
  Sparkles,
  FileText,
  UserCheck,
  HelpCircle,
  Briefcase,
  Scan,
  BookOpen,
  FilePlus,
  MessageSquare,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification } from '../../api/notifications';

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabCategory = 'all' | 'unread' | 'mentions' | 'system';

interface CategoryConfig {
  icon: React.ReactNode;
  label: string;
}

const categoryConfigs: Record<string, CategoryConfig> = {
  assignments: { icon: <FileText size={16} />, label: 'Assignments' },
  attendance: { icon: <UserCheck size={16} />, label: 'Attendance' },
  quiz: { icon: <HelpCircle size={16} />, label: 'Quiz' },
  placement: { icon: <Briefcase size={16} />, label: 'Placement' },
  ocr: { icon: <Scan size={16} />, label: 'OCR' },
  notes: { icon: <BookOpen size={16} />, label: 'AI Notes' },
  resume: { icon: <FilePlus size={16} />, label: 'Resume' },
  chat: { icon: <MessageSquare size={16} />, label: 'Chat' },
  admin: { icon: <Shield size={16} />, label: 'Admin' },
  faculty: { icon: <GraduationCap size={16} />, label: 'Faculty' },
  system: { icon: <Bell size={16} />, label: 'System' },
};

function formatTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, togglePin, clearAll, deleteNotification } =
    useNotifications();

  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [archivedIds, setArchivedIds] = useState<number[]>([]);

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];

    return notifications.filter((item) => {
      if (archivedIds.includes(item.id)) return false;
      if (activeTab === 'unread') return !item.is_read;
      if (activeTab === 'system') return item.type === 'system' || item.type === 'admin';
      if (activeTab === 'mentions') return item.type === 'chat' || item.type === 'faculty';
      return true;
    });
  }, [notifications, activeTab, archivedIds]);

  const handleArchive = (id: number) => {
    setArchivedIds((prev) => [...prev, id]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Panel Container (Monochrome Drawer 400px) */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full sm:w-[400px] md:w-[420px] bg-[#FFFFFF] dark:bg-[#181818] shadow-2xl border border-[#D1D5DB] dark:border-[#3F3F46] sm:rounded-b-[16px] flex flex-col z-10 overflow-hidden h-[90vh] sm:h-[620px] sm:mt-16 sm:mr-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818]">
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-[18px] text-[#111827] dark:text-[#FAFAFA]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-[6px] text-[12px] font-bold bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="p-1.5 rounded-[6px] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition text-[12px] font-medium flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                onClick={() => {
                  onClose();
                  navigate('/settings?tab=notifications');
                }}
                className="p-1.5 rounded-[6px] text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                title="Notification Settings"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-[6px] text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center px-4 gap-2 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[13px] font-medium">
            {(['all', 'unread', 'mentions', 'system'] as TabCategory[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-3 capitalize border-b-2 transition-all cursor-pointer -mb-[1px] ${
                  activeTab === tab
                    ? 'border-[#111827] dark:border-[#FAFAFA] text-[#111827] dark:text-[#FAFAFA] font-bold'
                    : 'border-transparent text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notification List Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
            {isLoading ? (
              <div className="py-20 text-center text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#111827] dark:text-[#FAFAFA]" />
                <p className="mt-2.5 font-medium">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                  <Sparkles size={24} />
                </div>
                <h4 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA]">
                  You&apos;re all caught up!
                </h4>
                <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] max-w-xs">
                  No new notifications right now. Enjoy your day!
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const catConfig = categoryConfigs[notif.type.toLowerCase()] || categoryConfigs.system;

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) markAsRead(notif.id);
                      if (notif.action_url) {
                        onClose();
                        navigate(notif.action_url);
                      }
                    }}
                    className={`group relative p-4 transition-all cursor-pointer flex items-start gap-3.5 ${
                      notif.is_read
                        ? 'bg-transparent hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                        : 'bg-[#F8FAFC] dark:bg-[#111111]'
                    }`}
                  >
                    {/* Category Icon */}
                    <div className="p-2 rounded-[8px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] shrink-0 mt-0.5">
                      {catConfig.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]">
                            {catConfig.label}
                          </span>
                          <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                            {formatTimeAgo(notif.created_at)}
                          </span>
                        </div>
                      </div>

                      <h5 className="font-bold text-[14px] text-[#111827] dark:text-[#FAFAFA] mt-1 leading-snug">
                        {notif.title}
                      </h5>

                      <p className="text-[13px] text-[#4B5563] dark:text-[#D4D4D4] mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      {notif.action_url && (
                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#111827] dark:text-[#FAFAFA] hover:underline mt-2">
                          View details <ExternalLink size={12} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
