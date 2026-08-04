import React from 'react';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, description, children, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="border-b border-[#E2E8F0] dark:border-[#2A2A2A] pb-3 mb-4">
          {title && <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</h4>}
          {description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
