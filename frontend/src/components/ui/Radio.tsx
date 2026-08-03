import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, checked, id, className = '', ...props }, ref) => {
    const generatedId = id || React.useId();
    return (
      <label htmlFor={generatedId} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={generatedId}
            type="radio"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="w-5 h-5 rounded-full border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] peer-checked:border-[#0E2A6D] dark:peer-checked:border-[#1E4DB7] peer-focus:ring-2 peer-focus:ring-[#0E2A6D]/30 transition-all duration-200 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0E2A6D] dark:bg-[#1E4DB7] scale-0 peer-checked:scale-100 transition-transform duration-200" />
          </div>
        </div>
        {label && <span className="text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC]">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
