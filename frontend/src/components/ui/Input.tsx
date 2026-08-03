import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variantType?: 'text' | 'search' | 'password';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, variantType = 'text', type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = variantType === 'password';
    const isSearch = variantType === 'search';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {isSearch && !leftIcon && (
            <Search className="absolute left-3.5 w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0" />
          )}
          {!isSearch && leftIcon && (
            <div className="absolute left-3.5 text-[#64748B] dark:text-[#94A3B8] shrink-0">{leftIcon}</div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={`w-full h-10 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-[10px] text-sm text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all duration-200 ${
              isSearch || leftIcon ? 'pl-10' : 'pl-3.5'
            } ${isPassword || rightIcon ? 'pr-10' : 'pr-3.5'} ${error ? 'border-[#EF4444] focus:ring-[#EF4444]/30' : ''} ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-[#64748B] hover:text-[#1F2937] dark:hover:text-[#F8FAFC] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {!isPassword && rightIcon && (
            <div className="absolute right-3.5 text-[#64748B] dark:text-[#94A3B8] shrink-0">{rightIcon}</div>
          )}
        </div>
        {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
