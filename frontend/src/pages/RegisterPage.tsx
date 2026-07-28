import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
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
        body: JSON.stringify({ name, email, password }),
      });
      login(data.access_token);
      showToast('Account created! Welcome to CampusMate AI.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#0A2A6A] flex items-center justify-center shadow-lg mb-4">
            <GraduationCap className="w-9 h-9 text-[#E8B24D]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0A2A6A]">{APP_NAME}</h1>
          <p className="text-sm text-slate-500 mt-1">{COLLEGE_NAME}</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 soft-ring">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 mb-6">Join CampusMate AI — your smart campus companion.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none transition focus:border-[#0A2A6A] focus:ring-2 focus:ring-[#0A2A6A]/10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@mzce.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none transition focus:border-[#0A2A6A] focus:ring-2 focus:ring-[#0A2A6A]/10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none transition focus:border-[#0A2A6A] focus:ring-2 focus:ring-[#0A2A6A]/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none transition focus:border-[#0A2A6A] focus:ring-2 focus:ring-[#0A2A6A]/10"
                  required
                />
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0A2A6A] text-white font-semibold text-sm shadow-md shadow-[#0A2A6A]/20 hover:bg-[#163D8C] transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#0A2A6A] hover:text-[#163D8C] transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
