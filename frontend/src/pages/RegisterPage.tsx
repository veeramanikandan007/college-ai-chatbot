import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Users } from 'lucide-react';
import { fetchApi, ApiError } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { APP_NAME, COLLEGE_NAME } from '../lib/constants';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      const userData = await login(data.access_token);
      showToast('Account created! Welcome to CollegeMate AI.', 'success');
      
      // Dynamically route to the correct dashboard based on role
      const { getDefaultHomeForRole } = await import('../config/navigation');
      const roleHome = getDefaultHomeForRole(userData?.role || role);
      navigate(roleHome, { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
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
            <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Create your account</h2>
            <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Join CollegeMate AI — your smart campus companion.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">Full name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#6B7280] dark:text-[#A1A1AA] pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none transition focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">Email address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-[#6B7280] dark:text-[#A1A1AA] pointer-events-none" />
                <input
                  id="reg-email"
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
            
            {/* Role */}
            <div className="space-y-1.5">
              <label htmlFor="reg-role" className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">Account Type</label>
              <div className="relative flex items-center">
                <Users className="absolute left-3.5 w-4 h-4 text-[#6B7280] dark:text-[#A1A1AA] pointer-events-none" />
                <select
                  id="reg-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none transition focus:border-[#111827] dark:focus:border-[#FAFAFA] appearance-none"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280] dark:text-[#A1A1AA]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#6B7280] dark:text-[#A1A1AA] pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">Confirm password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#6B7280] dark:text-[#A1A1AA] pointer-events-none" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none transition focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                  required
                />
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full h-[40px] flex items-center justify-center gap-2 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] pt-2 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#111827] dark:text-[#FAFAFA] hover:underline transition">
              Sign in
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
