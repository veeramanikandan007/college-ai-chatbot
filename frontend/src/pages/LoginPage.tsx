import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { fetchApi, ApiError } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { APP_NAME, COLLEGE_NAME } from '../lib/constants';
import { getDefaultHomeForRole } from '../config/navigation';

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
      const userData = await login(data.access_token);
      showToast('Welcome back!', 'success');
      const roleHome = getDefaultHomeForRole(userData?.role);
      navigate(roleHome, { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] transition-colors duration-200 font-sans select-none">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link to="/" className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shadow-md transition-transform hover:scale-105">
            <Bot size={24} />
          </Link>
          <div className="space-y-1">
            <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight">
              {APP_NAME}
            </h1>
            <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
              {COLLEGE_NAME}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] p-6 sm:p-8 border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Welcome back</h2>
            <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Sign in to access your campus AI dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                Email address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-[#6B7280] dark:text-[#A1A1AA] pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@mzce.edu"
                  className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none transition focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#6B7280] dark:text-[#A1A1AA] pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[40px] pl-10 pr-10 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none transition focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-[40px] flex items-center justify-center gap-2 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] pt-2 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
            New to {APP_NAME}?{' '}
            <Link to="/register" className="font-semibold text-[#111827] dark:text-[#FAFAFA] hover:underline transition">
              Create an account
            </Link>
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link to="/" className="text-[13px] font-medium text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">
            ← Back to Landing Page
          </Link>
        </div>

      </div>
    </div>
  );
}
