import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { toastVariants } from '../../lib/animations';

const toastStyles: Record<string, { bar: string; icon: React.ReactNode; bg: string; border: string }> = {
  success: {
    bg: 'bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]',
    border: 'border-[#D1D5DB] dark:border-[#3F3F46]',
    bar: 'bg-[#111827] dark:bg-[#FAFAFA]',
    icon: <CheckCircle2 className="h-4 w-4 text-[#111827] dark:text-[#FAFAFA] shrink-0" />,
  },
  error: {
    bg: 'bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]',
    border: 'border-[#D1D5DB] dark:border-[#3F3F46]',
    bar: 'bg-[#111827] dark:bg-[#FAFAFA]',
    icon: <AlertCircle className="h-4 w-4 text-[#111827] dark:text-[#FAFAFA] shrink-0" />,
  },
  warning: {
    bg: 'bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]',
    border: 'border-[#D1D5DB] dark:border-[#3F3F46]',
    bar: 'bg-[#111827] dark:bg-[#FAFAFA]',
    icon: <AlertTriangle className="h-4 w-4 text-[#111827] dark:text-[#FAFAFA] shrink-0" />,
  },
  info: {
    bg: 'bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]',
    border: 'border-[#D1D5DB] dark:border-[#3F3F46]',
    bar: 'bg-[#111827] dark:bg-[#FAFAFA]',
    icon: <Info className="h-4 w-4 text-[#111827] dark:text-[#FAFAFA] shrink-0" />,
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false} mode="sync">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] ?? toastStyles.info;

          return (
            <motion.div
              key={toast.id}
              layout
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`pointer-events-auto relative flex min-w-[280px] max-w-sm items-start gap-3 overflow-hidden rounded-[12px] border px-4 py-3 shadow-lg ${style.bg} ${style.border}`}
            >
              {/* Progress bar */}
              <motion.span
                className={`absolute bottom-0 left-0 h-[3px] ${style.bar}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
              />

              <div className="mt-0.5">{style.icon}</div>

              <p className="flex-1 text-[13px] font-medium leading-snug">{toast.message}</p>

              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-[6px] p-0.5 text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
