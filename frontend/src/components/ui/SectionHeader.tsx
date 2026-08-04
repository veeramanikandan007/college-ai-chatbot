import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-blue-500',
  badge,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 ${className}`}>
      <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        {Icon && <Icon className={iconColor} size={20} />}
        {title}
        {badge && <span className="ml-1">{badge}</span>}
      </h3>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};
