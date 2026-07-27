import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (studentId: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [studentId, setStudentId] = useState('STU23911');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(studentId);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A2A6A]/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl overflow-hidden select-none"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4 mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#163D8C]">
                Student Portal
              </p>
              <h2 className="text-xl font-bold text-[#0A2A6A]">CollegeMate AI Login</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[#0A2A6A] hover:bg-[#F1F5F9]"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0A2A6A] mb-1.5">
                Student ID
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="STU23911"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#1F2937] outline-none transition focus:border-[#163D8C] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A2A6A] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#1F2937] outline-none transition focus:border-[#163D8C] focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E2E8F0] text-[#0A2A6A]"
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Please contact student administrator to reset password.')}
                className="font-semibold text-[#163D8C] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-[#0A2A6A] py-3 text-sm font-bold text-white shadow-lg shadow-[#0A2A6A]/20 transition hover:bg-[#163D8C] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
