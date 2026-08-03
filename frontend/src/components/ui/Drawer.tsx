import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  width = 'w-80 sm:w-96',
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

  const positionClass = position === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="fixed inset-0 z-[9990] flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 bottom-0 ${positionClass} ${width} bg-white dark:bg-[#1E293B] shadow-lg border-l border-[#E2E8F0] dark:border-[#334155] flex flex-col z-10 transition-transform duration-200`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          {title && <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC]">{title}</h3>}
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-1 h-auto rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};
