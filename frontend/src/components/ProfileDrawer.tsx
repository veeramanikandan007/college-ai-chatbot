import { motion, AnimatePresence } from 'framer-motion';
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
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!user) return null;

  const attendanceColor =
    user.attendancePercent >= 85
      ? 'text-emerald-600'
      : user.attendancePercent >= 75
      ? 'text-amber-600'
      : 'text-rose-600';

  const attendanceLabel =
    user.attendancePercent >= 85 ? 'Excellent' :
    user.attendancePercent >= 75 ? 'Above Min' : 'Below Min';

  const cgpaColor =
    user.cgpa >= 8.5 ? 'text-[#163D8C]' :
    user.cgpa >= 7.5 ? 'text-emerald-600' : 'text-amber-600';

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
            className="absolute inset-0 bg-[#0A2A6A]/30 backdrop-blur-sm"
          />

          {/* Right Sliding Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-[#E2E8F0] bg-white shadow-2xl overflow-y-auto"
          >
            {/* Gold accent top border */}
            <div className="h-1 w-full bg-gradient-to-r from-[#0A2A6A] via-[#163D8C] to-[#E8B24D] shrink-0" />

            <div className="flex flex-col flex-1 p-5 gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A2A6A] text-white shadow-md shadow-[#0A2A6A]/20">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#163D8C]">
                      Student Account
                    </p>
                    <h2 className="text-base font-bold text-[#0A2A6A]">My Profile</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0A2A6A] transition"
                  aria-label="Close profile drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Profile Hero */}
              <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#0A2A6A] to-[#163D8C] p-4 text-white shadow-lg shadow-[#0A2A6A]/20">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E8B24D] text-2xl font-bold text-[#0A2A6A] shadow-md">
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold truncate">{user.name}</h3>
                  <p className="text-xs font-semibold text-blue-200">ID: {user.studentId}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                    Verified Student
                  </span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    <PieChart className="h-3 w-3 text-emerald-600" />
                    <span>Attendance</span>
                  </div>
                  <p className={`text-2xl font-bold ${attendanceColor}`}>{user.attendancePercent}%</p>
                  <span className={`text-[10px] font-semibold ${attendanceColor}`}>{attendanceLabel}</span>
                </div>
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    <Award className="h-3 w-3 text-[#E8B24D]" />
                    <span>CGPA</span>
                  </div>
                  <p className={`text-2xl font-bold ${cgpaColor}`}>{user.cgpa}</p>
                  <span className="text-[10px] font-semibold text-[#163D8C]">out of 10.0</span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-2">
                {[
                  { Icon: Building2, label: 'Department', value: user.department },
                  { Icon: Calendar, label: 'Year & Semester', value: `${user.year} • ${user.semester}` },
                  { Icon: Mail, label: 'Email', value: user.email },
                  { Icon: Phone, label: 'Phone', value: user.phone },
                  { Icon: GraduationCap, label: 'Student ID', value: user.studentId },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#163D8C]/8">
                      <Icon className="h-3.5 w-3.5 text-[#163D8C]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">{label}</p>
                      <p className="mt-0.5 text-xs font-semibold text-[#0A2A6A] truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2 mt-auto pt-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => alert('Profile editing is managed by the College Registrar Office.\nVisit the Student Portal at studentportal.college.edu')}
                  className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs font-bold text-[#0A2A6A] hover:bg-[#F1F5F9] transition"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#163D8C]" />
                    <span>Edit Profile</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#64748B]" />
                </button>

                <button
                  onClick={() => window.open('https://studentportal.college.edu', '_blank')}
                  className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs font-bold text-[#0A2A6A] hover:bg-[#F1F5F9] transition"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-[#163D8C]" />
                    <span>Student Portal</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#64748B]" />
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-between rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout Account</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
