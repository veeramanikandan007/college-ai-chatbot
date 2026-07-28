import { Bell, CheckCircle2, AlertCircle, AlertTriangle, Info, Book, FileText, Calendar, DollarSign } from 'lucide-react';
import { Notification } from '../../api/notifications';

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export function NotificationCard({ notification, onRead, onDelete }: NotificationCardProps) {
  const getIconAndColor = () => {
    let Icon = Info;
    let color = 'text-blue-500 bg-blue-500/10';

    // Type specific icons/colors
    if (notification.type.toLowerCase() === 'academic') { Icon = Book; color = 'text-[#163D8C] bg-[#163D8C]/10'; }
    if (notification.type.toLowerCase() === 'administrative') { Icon = DollarSign; color = 'text-purple-500 bg-purple-500/10'; }
    if (notification.type.toLowerCase() === 'ai') { Icon = CheckCircle2; color = 'text-emerald-500 bg-emerald-500/10'; }
    if (notification.type.toLowerCase() === 'alert') { Icon = AlertTriangle; color = 'text-amber-500 bg-amber-500/10'; }
    if (notification.type.toLowerCase() === 'announcement') { Icon = Calendar; color = 'text-indigo-500 bg-indigo-500/10'; }

    // Override by priority if high
    if (notification.priority === 'high') {
      color = 'text-rose-500 bg-rose-500/10';
    }

    // Override by explicit icon if provided
    if (notification.icon === 'alert-triangle') Icon = AlertTriangle;
    if (notification.icon === 'book') Icon = Book;
    if (notification.icon === 'file-text') Icon = FileText;
    if (notification.icon === 'dollar-sign') Icon = DollarSign;
    if (notification.icon === 'check-circle') Icon = CheckCircle2;

    return { Icon, color };
  };

  const { Icon, color } = getIconAndColor();

  // Format date relative to now
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
      className={`p-4 flex gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${notification.is_read ? 'opacity-70' : 'bg-blue-50/30 dark:bg-slate-800/20'}`}
      onClick={() => !notification.is_read && onRead(notification.id)}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      
      <div className="flex-1 min-w-0 cursor-pointer">
        <div className="flex items-start justify-between mb-1 gap-2">
          <h3 className={`text-sm truncate ${notification.is_read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
            {notification.title}
          </h3>
          <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(notification.created_at)}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{notification.message}</p>
        
        {notification.action_url && (
          <a href={notification.action_url} className="text-xs text-[#163D8C] dark:text-blue-400 mt-2 inline-block hover:underline" onClick={e => e.stopPropagation()}>
            View Details
          </a>
        )}
      </div>

      <div className="flex flex-col items-end justify-between shrink-0">
        {!notification.is_read ? (
          <div className="w-2.5 h-2.5 rounded-full bg-[#E8B24D]" title="Unread"></div>
        ) : <div className="w-2.5 h-2.5"></div>}
        
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          className="text-xs text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
