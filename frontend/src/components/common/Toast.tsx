import React from 'react';
import { useToast } from '../../hooks/useToast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        let bgColor = 'bg-slate-800 text-white';
        if (toast.type === 'success') bgColor = 'bg-green-600 text-white';
        if (toast.type === 'error') bgColor = 'bg-red-600 text-white';
        if (toast.type === 'warning') bgColor = 'bg-yellow-500 text-white';

        return (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded shadow-lg flex items-center justify-between min-w-[250px] animate-fade-in ${bgColor}`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-white opacity-70 hover:opacity-100 focus:outline-none"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};
