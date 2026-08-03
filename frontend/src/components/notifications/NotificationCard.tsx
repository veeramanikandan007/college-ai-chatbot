import { Bell, CheckCircle2, AlertCircle, AlertTriangle, Info, Book, FileText, Calendar, DollarSign } from 'lucide-react';
import { Notification } from '../../api/notifications';

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export function NotificationCard({ notification, onRead, onDelete }: NotificationCardProps) {
  const getIcon = () => {
    let Icon = Info;
    if (notification.type.toLowerCase() === 'academic') Icon = Book;
    if (notification.type.toLowerCase() === 'administrative') Icon = DollarSign;
    if (notification.type.toLowerCase() === 'ai') Icon = CheckCircle2;
    if (notification.type.toLowerCase() === 'alert') Icon = AlertTriangle;
    if (notification.type.toLowerCase() === 'announcement') Icon = Calendar;

    if (notification.icon === 'alert-triangle') Icon = AlertTriangle;
    if (notification.icon === 'book') Icon = Book;
    if (notification.icon === 'file-text') Icon = FileText;
    if (notification.icon === 'dollar-sign') Icon = DollarSign;
    if (notification.icon === 'check-circle') Icon = CheckCircle2;

    return Icon;
  };

  const Icon = getIcon();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.round(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.round(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className={`p-4 flex gap-4 transition-colors hover:bg-[#F9FAFB] dark:hover:bg-[#232323] group cursor-pointer ${
        notification.is_read ? 'opacity-70 bg-transparent' : 'bg-[#F8FAFC] dark:bg-[#111111]'
      }`}
      onClick={() => !notification.is_read && onRead(notification.id)}
    >
      <div className="w-9 h-9 rounded-[8px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1 gap-2">
          <h3 className={`text-[14px] truncate ${notification.is_read ? 'font-medium text-[#4B5563] dark:text-[#A3A3A3]' : 'font-bold text-[#111827] dark:text-[#FAFAFA]'}`}>
            {notification.title}
          </h3>
          <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] whitespace-nowrap">{formatTime(notification.created_at)}</span>
        </div>
        <p className="text-[13px] text-[#4B5563] dark:text-[#D4D4D4] line-clamp-2">{notification.message}</p>
        
        {notification.action_url && (
          <a href={notification.action_url} className="text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] mt-2 inline-block hover:underline" onClick={e => e.stopPropagation()}>
            View Details
          </a>
        )}
      </div>

      <div className="flex flex-col items-end justify-between shrink-0">
        {!notification.is_read ? (
          <div className="w-2 h-2 rounded-full bg-[#111827] dark:bg-[#FAFAFA]" title="Unread"></div>
        ) : <div className="w-2 h-2"></div>}
        
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] opacity-0 group-hover:opacity-100 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
