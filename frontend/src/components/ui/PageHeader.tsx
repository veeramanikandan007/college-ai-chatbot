import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  actionIcon?: LucideIcon;
  onActionClick?: () => void;
  badgeText?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  actionIcon: ActionIcon,
  onActionClick,
  badgeText,
  children
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] dark:bg-zinc-800 text-[#111827] dark:text-zinc-100 flex items-center justify-center border border-[#E5E7EB] dark:border-zinc-700 shrink-0">
            <Icon size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading font-bold text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight">
                {title}
              </h1>
              {badgeText && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium border border-zinc-200 dark:border-zinc-700">
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {actionText && onActionClick && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onActionClick}
              className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {ActionIcon && <ActionIcon size={16} />}
              <span>{actionText}</span>
            </button>
          </div>
        )}
      </div>
      {children && <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">{children}</div>}
    </div>
  );
};
