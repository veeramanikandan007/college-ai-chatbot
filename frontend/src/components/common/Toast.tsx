import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { toastVariants } from '../../lib/animations';

const toastStyles: Record<string, { bar: string; icon: React.ReactNode; bg: string; border: string }> = {
  success: {
    bg: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    border: 'border-emerald-300 dark:border-emerald-700',
    bar: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
  },
  error: {
    bg: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    border: 'border-red-300 dark:border-red-700',
    bar: 'bg-red-500',
    icon: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />,
  },
  warning: {
    bg: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    border: 'border-amber-300 dark:border-amber-700',
    bar: 'bg-amber-500',
    icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
  },
  info: {
    bg: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    border: 'border-blue-300 dark:border-blue-700',
    bar: 'bg-blue-500',
    icon: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
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
              className={`pointer-events-auto relative flex min-w-[280px] max-w-sm items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-xl shadow-black/10 ${style.bg} ${style.border}`}
            >
              {/* Colour progress bar */}
              <motion.span
                className={`absolute bottom-0 left-0 h-[3px] ${style.bar}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                onAnimationComplete={() => removeToast(toast.id)}
              />

              {style.icon}
              <span className="flex-1 text-xs font-semibold leading-relaxed">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
