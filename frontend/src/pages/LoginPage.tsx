import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { fetchApi, ApiError } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { APP_NAME, COLLEGE_NAME } from '../lib/constants';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const data = await fetchApi('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      await login(data.access_token);
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-200 font-body">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] flex items-center justify-center shadow-md mb-4 border border-[#D9A441]/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-section font-extrabold tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">{APP_NAME}</h1>
          <p className="font-heading text-caption font-bold tracking-[0.02em] uppercase text-[#64748B] dark:text-[#94A3B8] mt-1">{COLLEGE_NAME}</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-8 border border-[#E2E8F0] dark:border-[#334155] shadow-xs transition-colors duration-200">
          <h2 className="font-heading text-card font-bold tracking-[0.02em] text-[#1F2937] dark:text-[#F8FAFC] mb-1">Welcome back</h2>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8] mb-6">Sign in to access your campus AI dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="ty-label text-[#1F2937] dark:text-[#F8FAFC]">
                Email address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-[#64748B] pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@mzce.edu"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] text-body outline-none transition duration-180 focus:border-[#1E4DB7] focus:ring-2 focus:ring-[#1E4DB7]/10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="ty-label text-[#1F2937] dark:text-[#F8FAFC]">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#64748B] pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-11 pr-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] text-body outline-none transition duration-180 focus:border-[#1E4DB7] focus:ring-2 focus:ring-[#1E4DB7]/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#64748B] hover:text-[#1F2937] dark:hover:text-[#F8FAFC] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-btn shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-small text-[#64748B] dark:text-[#94A3B8]">
            New to {APP_NAME}?{' '}
            <Link to="/register" className="font-semibold text-[#0E2A6D] dark:text-[#D9A441] hover:underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
