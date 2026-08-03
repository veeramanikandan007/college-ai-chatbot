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

            {/* Right Sliding Drawer (Max Width 320px, Safe Area Insets) */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-[320px] flex-col border-l border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#111111] p-5 shadow-2xl overflow-y-auto select-none text-[#111827] dark:text-[#FAFAFA] pb-[env(safe-area-inset-bottom,16px)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                      Student Account
                    </p>
                    <h2 className="font-bold text-[18px] text-[#111827] dark:text-[#FAFAFA]">Profile Details</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-2 text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Profile Hero Card */}
              <div className="my-5 flex items-center gap-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#181818] p-4 shadow-xs">
                <UserAvatar user={user} size="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA] truncate">{user.name}</h3>
                  <p className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">ID: {user.student_id || 'STU23911'}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-[6px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                    <BadgeCheck size={12} className="shrink-0" />
                    <span>{user.role === 'admin' ? 'Administrator' : 'Verified Student'}</span>
                  </span>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#181818] p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                    <PieChart className="h-3.5 w-3.5" />
                    <span>Attendance</span>
                  </div>
                  <p className="font-bold text-[20px] text-[#111827] dark:text-[#FAFAFA] mt-0.5">94%</p>
                  <span className="text-[11px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Excellent</span>
                </div>
                <div className="rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#181818] p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                    <Award className="h-3.5 w-3.5" />
                    <span>CGPA</span>
                  </div>
                  <p className="font-bold text-[20px] text-[#111827] dark:text-[#FAFAFA] mt-0.5">8.9</p>
                  <span className="text-[11px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Top 5%</span>
                </div>
              </div>

              {/* Profile Info Details List */}
              <div className="flex-1 space-y-3 text-[14px]">
                <div className="rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Department</span>
                  </div>
                  <p className="mt-1 font-bold text-[#111827] dark:text-[#FAFAFA]">{user.department || 'Computer Science'}</p>
                </div>

                <div className="rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Year & Semester</span>
                  </div>
                  <p className="mt-1 font-bold text-[#111827] dark:text-[#FAFAFA]">
                    {user.year ? `Year ${user.year}` : '3rd Year'}{' '}
                    {user.semester ? `• Semester ${user.semester}` : '• Semester 6'}
                  </p>
                </div>

                <div className="rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email Address</span>
                  </div>
                  <p className="mt-1 font-bold text-[#111827] dark:text-[#FAFAFA] truncate">{user.email}</p>
                </div>

                <div className="rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Phone Number</span>
                  </div>
                  <p className="mt-1 font-bold text-[#111827] dark:text-[#FAFAFA]">{user.phone || '+91 98765 43210'}</p>
                </div>
              </div>
            </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
