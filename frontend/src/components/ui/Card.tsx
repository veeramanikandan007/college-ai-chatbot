import React, { HTMLAttributes, forwardRef } from 'react';

export type CardVariant = 'default' | 'dashboard' | 'statistics' | 'upload' | 'feature';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-sm',
  dashboard: 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-sm p-6',
  statistics: 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-sm p-5 relative overflow-hidden',
  upload: 'bg-[#FFFFFF] dark:bg-[#181818] border-2 border-dashed border-[#D1D5DB] dark:border-[#3F3F46] hover:border-[#111827] dark:hover:border-[#FAFAFA] p-8 text-center cursor-pointer',
  feature: 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-sm p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverable = false, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-[16px] transition-all duration-200 ${hoverable ? 'hover:shadow-lg hover:-translate-y-0.5' : ''} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
