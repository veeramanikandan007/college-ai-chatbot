import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full p-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-[10px] text-sm text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all duration-200 resize-y min-h-[100px] ${
            error ? 'border-[#EF4444] focus:ring-[#EF4444]/30' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
