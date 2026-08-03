import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = ''
}) => {
  return (
    <div className={`p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 font-heading tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>
        )}
      </div>
      {trend && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-xs">
          <span className={`font-medium ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};
