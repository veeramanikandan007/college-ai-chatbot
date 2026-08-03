import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {variant === 'danger' && (
          <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#EF4444] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <div>
          <h4 className="font-bold text-base text-[#1F2937] dark:text-[#F8FAFC]">{title}</h4>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">{message}</p>
        </div>
      </div>
    </Dialog>
  );
};
