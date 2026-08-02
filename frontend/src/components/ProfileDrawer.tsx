import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import {
  UserCheck,
  X,
  Building2,
  Calendar,
  Mail,
  Phone,
  PieChart,
  Award,
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
        <div className="fixed inset-0 z-50 overflow-hidden font-body">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0E2A6D]/40 backdrop-blur-xs"
          />

          {/* Right Sliding Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827] p-6 shadow-2xl overflow-y-auto select-none text-[#1F2937] dark:text-[#F8FAFC]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E2A6D] text-white shadow-xs border border-[#D9A441]/30">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">
                    Student Account
                  </p>
                  <h2 className="font-heading font-bold text-card text-[#0E2A6D] dark:text-[#F8FAFC]">Profile Details</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#1E293B] p-2 text-[#0E2A6D] dark:text-[#F8FAFC] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Hero */}
            <div className="my-6 flex items-center gap-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#1E293B] p-4 shadow-xs">
              <UserAvatar user={user} size="lg" />
              <div>
                <h3 className="font-heading font-bold text-card text-[#0E2A6D] dark:text-[#F8FAFC]">{user.name}</h3>
                <p className="text-small font-semibold text-[#1E4DB7] dark:text-[#D9A441]">ID: {user.student_id || 'STU23911'}</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-caption font-bold text-[#22C55E] border border-[#22C55E]/20">
                  <BadgeCheck size={13} strokeWidth={1.75} className="shrink-0" />
                  <span>{user.role === 'admin' ? 'Administrator' : 'Verified Student'}</span>
                </span>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#1E293B] p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-caption font-heading font-bold uppercase tracking-[0.02em] text-[#64748B] dark:text-[#94A3B8]">
                  <PieChart className="h-3.5 w-3.5 text-[#22C55E]" />
                  <span>Attendance</span>
                </div>
                <p className="font-heading font-bold text-section text-[#0E2A6D] dark:text-[#F8FAFC]">94%</p>
                <span className="text-caption font-medium text-[#22C55E]">Excellent</span>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#1E293B] p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-caption font-heading font-bold uppercase tracking-[0.02em] text-[#64748B] dark:text-[#94A3B8]">
                  <Award className="h-3.5 w-3.5 text-[#D9A441]" />
                  <span>CGPA</span>
                </div>
                <p className="font-heading font-bold text-section text-[#0E2A6D] dark:text-[#F8FAFC]">8.9</p>
                <span className="text-caption font-medium text-[#1E4DB7] dark:text-[#D9A441]">Top 5%</span>
              </div>
            </div>

            {/* Profile Info Details List */}
            <div className="flex-1 space-y-3 text-small text-[#475569] dark:text-[#CBD5E1]">
              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3">
                <div className="flex items-center gap-1.5 text-caption font-heading font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  <Building2 className="h-3.5 w-3.5 text-[#0E2A6D] dark:text-[#60A5FA]" />
                  <span>Department</span>
                </div>
                <p className="mt-1 font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC]">{user.department || 'Computer Science'}</p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3">
                <div className="flex items-center gap-1.5 text-caption font-heading font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  <Calendar className="h-3.5 w-3.5 text-[#0E2A6D] dark:text-[#60A5FA]" />
                  <span>Year & Semester</span>
                </div>
                <p className="mt-1 font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC]">
                  {user.year ? `Year ${user.year}` : '3rd Year'}{' '}
                  {user.semester ? `• Semester ${user.semester}` : '• Semester 6'}
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3">
                <div className="flex items-center gap-1.5 text-caption font-heading font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  <Mail className="h-3.5 w-3.5 text-[#0E2A6D] dark:text-[#60A5FA]" />
                  <span>Email Address</span>
                </div>
                <p className="mt-1 font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC] truncate">{user.email}</p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3">
                <div className="flex items-center gap-1.5 text-caption font-heading font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  <Phone className="h-3.5 w-3.5 text-[#0E2A6D] dark:text-[#60A5FA]" />
                  <span>Phone Number</span>
                </div>
                <p className="mt-1 font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC]">{user.phone || '+91 98765 43210'}</p>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
