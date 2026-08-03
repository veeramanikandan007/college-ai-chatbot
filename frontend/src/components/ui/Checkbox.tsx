import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, className = '', id, ...props }, ref) => {
    const generatedId = id || React.useId();
    return (
      <label htmlFor={generatedId} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={generatedId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="w-5 h-5 rounded-[4px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] peer-checked:bg-[#0E2A6D] peer-checked:border-[#0E2A6D] peer-focus:ring-2 peer-focus:ring-[#0E2A6D]/30 transition-all duration-200 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        {label && <span className="text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC]">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
