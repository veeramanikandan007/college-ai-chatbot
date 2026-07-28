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
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileDrawer({ isOpen, onClose, onLogout }: ProfileDrawerProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

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
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-[#E2E8F0] bg-white p-6 shadow-2xl overflow-y-auto select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A2A6A] text-white">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#163D8C]">
                    Student Account
                  </p>
                  <h2 className="text-lg font-bold text-[#0A2A6A]">Profile Details</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[#0A2A6A] hover:bg-[#F1F5F9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Hero */}
            <div className="my-6 flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#F8FAFC] to-white p-4 shadow-xs">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-16 w-16 rounded-2xl border-2 border-[#163D8C] object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8B24D] text-2xl font-bold text-[#0A2A6A] shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-[#0A2A6A]">{user.name}</h3>
                <p className="text-xs font-semibold text-[#163D8C]">ID: {user.student_id || 'N/A'}</p>
                <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200">
                  {user.role === 'admin' ? 'Administrator' : 'Verified Student'}
                </span>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  <PieChart className="h-3 w-3 text-emerald-600" />
                  <span>Attendance</span>
                </div>
                <p className="text-xl font-bold text-[#0A2A6A]">94%</p>
                <span className="text-[10px] font-medium text-emerald-600">Excellent</span>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  <Award className="h-3 w-3 text-amber-500" />
                  <span>CGPA</span>
                </div>
                <p className="text-xl font-bold text-[#0A2A6A]">8.9</p>
                <span className="text-[10px] font-medium text-[#163D8C]">Top 5%</span>
              </div>
            </div>

            {/* Profile Info Details List */}
            <div className="flex-1 space-y-3 text-xs text-[#1F2937]">
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#64748B]">
                  <Building2 className="h-3.5 w-3.5 text-[#163D8C]" />
                  <span>Department</span>
                </div>
                <p className="mt-1 font-semibold text-[#0A2A6A]">{user.department || 'Not specified'}</p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#64748B]">
                  <Calendar className="h-3.5 w-3.5 text-[#163D8C]" />
                  <span>Year & Semester</span>
                </div>
                <p className="mt-1 font-semibold text-[#0A2A6A]">
                  {user.year ? `Year ${user.year}` : 'Not specified'}{' '}
                  {user.semester ? `• Semester ${user.semester}` : ''}
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#64748B]">
                  <Mail className="h-3.5 w-3.5 text-[#163D8C]" />
                  <span>Email Address</span>
                </div>
                <p className="mt-1 font-semibold text-[#0A2A6A]">{user.email}</p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#64748B]">
                  <Phone className="h-3.5 w-3.5 text-[#163D8C]" />
                  <span>Phone Number</span>
                </div>
                <p className="mt-1 font-semibold text-[#0A2A6A]">{user.phone || 'Not specified'}</p>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 space-y-2 border-t border-[#E2E8F0] pt-4">
              <button
                onClick={() => {
                  navigate('/settings');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs font-bold text-[#0A2A6A] hover:bg-[#F1F5F9] transition"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#163D8C]" />
                  <span>Edit Profile</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout Account</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

