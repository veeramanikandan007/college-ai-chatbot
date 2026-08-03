import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = FolderSearch,
  actionText,
  onActionClick,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
        <Icon size={28} />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs shadow-xs transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
