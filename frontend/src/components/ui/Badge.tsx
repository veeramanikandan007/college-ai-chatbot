import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46]',
  warning: 'bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46]',
  error: 'bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46]',
  info: 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] border border-[#111827] dark:border-[#FAFAFA]',
  neutral: 'bg-[#F8FAFC] dark:bg-[#111111] text-[#6B7280] dark:text-[#A3A3A3] border border-[#E5E7EB] dark:border-[#2A2A2A]',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, icon, className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium ${variantStyles[variant]} ${className}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
};
