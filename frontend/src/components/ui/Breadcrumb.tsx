import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-[#64748B] ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />}
            {isLast ? (
              <span className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">{item.label}</span>
            ) : item.onClick || item.href ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-[#0E2A6D] dark:hover:text-[#60A5FA] transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
