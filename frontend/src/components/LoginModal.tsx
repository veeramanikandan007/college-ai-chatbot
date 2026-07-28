import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, User, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, isLoading, error } = useAuth();

  const [studentId, setStudentId] = useState('24CSE001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setLocalError('Please enter your Student ID.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }
    setLocalError('');
    const success = await login(studentId.trim(), password);
    if (success) {
      if (rememberMe) {
        localStorage.setItem('collegemate_remember_id', studentId.trim());
      }
      onClose();
    }
  };

  const displayError = localError || error;

  return (
    <AnimatePresence>
      {isOpen && (
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
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="relative w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl overflow-hidden"
          >
            {/* Gold accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0A2A6A] via-[#163D8C] to-[#E8B24D]" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4 mb-5 mt-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2A6A] text-white shadow-md shadow-[#0A2A6A]/25">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#163D8C]">
                    Student Portal
                  </p>
                  <h2 className="text-xl font-bold text-[#0A2A6A]">CollegeMate AI Login</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0A2A6A] transition"
                aria-label="Close login modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error Banner */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-xs font-semibold text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{displayError}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student ID */}
              <div>
                <label htmlFor="login-student-id" className="block text-xs font-bold text-[#0A2A6A] mb-1.5">
                  Student ID
                </label>
                <div className="relative">
                  <input
                    id="login-student-id"
                    type="text"
                    required
                    autoComplete="username"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 24CSE001"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-3.5 py-2.5 text-sm text-[#1F2937] outline-none transition focus:border-[#163D8C] focus:bg-white focus:ring-2 focus:ring-[#163D8C]/10"
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-bold text-[#0A2A6A] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-10 py-2.5 text-sm text-[#1F2937] outline-none transition focus:border-[#163D8C] focus:bg-white focus:ring-2 focus:ring-[#163D8C]/10"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#64748B] hover:text-[#0A2A6A] transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[#E2E8F0] accent-[#0A2A6A]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert('Please contact the Student Affairs Office or College Registrar to reset your password.')
                  }
                  className="font-semibold text-[#163D8C] hover:text-[#0A2A6A] hover:underline transition"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2A6A] py-3 text-sm font-bold text-white shadow-lg shadow-[#0A2A6A]/25 transition hover:bg-[#163D8C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </motion.button>

              {/* Demo Hint */}
              <p className="text-center text-[11px] text-[#94A3B8]">
                Demo: Student ID <strong>24CSE001</strong> / Password <strong>password123</strong>
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
