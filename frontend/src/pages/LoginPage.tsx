import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthCard from '../components/AuthCard';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      navigate('/dashboard');
    }
  };

  const displayError = localError || error;

  return (
    <div className="container flex min-h-[calc(100vh-3rem)] items-center py-12">
      <div className="mx-auto w-full max-w-xl">
        <AuthCard
          title="Welcome back"
          subtitle="Sign in to access your CollegeMate AI dashboard."
        >
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

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2A6A] py-3 text-sm font-bold text-white shadow-lg shadow-[#0A2A6A]/25 transition hover:bg-[#163D8C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span>Authenticating</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-[#94A3B8]">
              Demo: Student ID <strong>24CSE001</strong> / Password <strong>password123</strong>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            New to CollegeMate AI?{' '}
            <Link to="/register" className="font-semibold text-[#0A2A6A] hover:text-[#163D8C]">
              Create an account
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
