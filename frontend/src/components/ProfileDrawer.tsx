import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  UserCheck,
  X,
  Building2,
  Calendar,
  Mail,
  Phone,
  PieChart,
  Award,
  Settings,
  LogOut,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileDrawer({ isOpen, onClose, onLogout }: ProfileDrawerProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0A2A6A]/30 backdrop-blur-xs"
          />

          {/* Right Sliding Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl overflow-y-auto select-none text-slate-900 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A2A6A] dark:bg-secondary text-white dark:text-slate-950 shadow-xs">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#163D8C] dark:text-secondary">
                    Student Account
                  </p>
                  <h2 className="text-lg font-bold text-[#0A2A6A] dark:text-slate-100">Profile Details</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-2 text-[#0A2A6A] dark:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Hero */}
            <div className="my-6 flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-900 dark:to-slate-900/60 p-4 shadow-xs">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-16 w-16 rounded-2xl border-2 border-[#163D8C] dark:border-secondary object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8B24D] text-2xl font-bold text-[#0A2A6A] shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-[#0A2A6A] dark:text-slate-100">{user.name}</h3>
                <p className="text-xs font-semibold text-[#163D8C] dark:text-secondary">ID: {user.student_id || 'N/A'}</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <BadgeCheck size={13} strokeWidth={1.75} className="shrink-0" />
                  <span>{user.role === 'admin' ? 'Administrator' : 'Verified Student'}</span>
                </span>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <PieChart className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Attendance</span>
                </div>
                <p className="text-xl font-bold text-[#0A2A6A] dark:text-slate-100">94%</p>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Excellent</span>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Award className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                  <span>CGPA</span>
                </div>
                <p className="text-xl font-bold text-[#0A2A6A] dark:text-slate-100">8.9</p>
                <span className="text-[10px] font-medium text-[#163D8C] dark:text-secondary">Top 5%</span>
              </div>
            </div>

            {/* Profile Info Details List */}
            <div className="flex-1 space-y-3 text-xs text-slate-800 dark:text-slate-200">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  <Building2 className="h-3.5 w-3.5 text-[#163D8C] dark:text-secondary" />
                  <span>Department</span>
                </div>
                <p className="mt-1 font-semibold text-[#0A2A6A] dark:text-slate-100">{user.department || 'Not specified'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-[#163D8C] dark:text-secondary" />
                  <span>Year & Semester</span>
                </div>
                <p className="mt-1 font-semibold text-[#0A2A6A] dark:text-slate-100">
                  {user.year ? `Year ${user.year}` : 'Not specified'}{' '}
                  {user.semester ? `• Semester ${user.semester}` : ''}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5 text-[#163D8C] dark:text-secondary" />
                  <span>Email Address</span>
                </div>
                <p className="mt-1 font-semibold text-[#0A2A6A] dark:text-slate-100">{user.email}</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  <Phone className="h-3.5 w-3.5 text-[#163D8C] dark:text-secondary" />
                  <span>Phone Number</span>
                </div>
                <p className="mt-1 font-semibold text-[#0A2A6A] dark:text-slate-100">{user.phone || 'Not specified'}</p>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

