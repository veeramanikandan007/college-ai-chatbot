import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#0E2A6D] hover:bg-[#153B8A] text-white shadow-sm focus:ring-[#0E2A6D]/30',
  secondary: 'bg-[#1E4DB7] hover:bg-[#183F99] text-white shadow-sm focus:ring-[#1E4DB7]/30',
  outline: 'border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[#1F2937] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400',
  ghost: 'bg-transparent text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:ring-slate-400',
  danger: 'bg-[#EF4444] hover:bg-red-600 text-white shadow-sm focus:ring-red-500/30',
  success: 'bg-[#22C55E] hover:bg-emerald-600 text-white shadow-sm focus:ring-emerald-500/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
          fullWidth ? 'w-full' : ''
        } ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : leftIcon}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
