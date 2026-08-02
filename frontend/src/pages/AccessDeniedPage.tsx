import React from 'react';
import { ShieldAlert, ArrowLeft, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDefaultHomeForRole } from '../config/navigation';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaultHome = getDefaultHomeForRole(user?.role);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F7FB] dark:bg-[#0F172A] p-6 font-body text-[#1F2937] dark:text-[#F8FAFC]">
      <div className="bg-white dark:bg-[#1E293B] p-8 md:p-12 rounded-3xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20 shadow-xs">
          <ShieldAlert size={36} strokeWidth={1.75} />
        </div>

        <div className="space-y-2">
          <span className="text-caption font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full bg-rose-500/10">
            HTTP 403 Forbidden
          </span>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#0E2A6D] dark:text-white pt-2">
            Access Denied
          </h1>
          <p className="text-body text-[#64748B] dark:text-[#94A3B8]">
            You do not have permission to view this resource. Your account role (<strong className="capitalize text-[#1F2937] dark:text-[#F8FAFC]">{user?.role || 'Guest'}</strong>) is restricted from accessing this portal.
          </p>
        </div>

        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
          <button
            onClick={() => navigate(defaultHome, { replace: true })}
            className="w-full h-11 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-heading font-bold text-caption flex items-center justify-center gap-2 transition shadow-xs"
          >
            <ArrowLeft size={16} /> Return to Your Portal
          </button>
        </div>
      </div>
    </div>
  );
}
