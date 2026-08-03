import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface FilterBarProps {
  options: FilterOption[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  activeId,
  onSelect,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg shrink-0 overflow-x-auto ${className}`}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = activeId === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {Icon && <Icon size={14} />}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
              }`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
