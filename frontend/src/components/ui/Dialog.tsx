import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthMap: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        className={`relative w-full ${maxWidthMap[maxWidth]} bg-white dark:bg-[#1E293B] rounded-[20px] shadow-lg border border-[#E2E8F0] dark:border-[#334155] p-6 z-10 transition-all duration-200 overflow-hidden`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          {title && <h3 className="text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC]">{title}</h3>}
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-1 h-auto rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="py-4 text-sm text-[#475569] dark:text-[#CBD5E1]">{children}</div>

        {footer && <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};
