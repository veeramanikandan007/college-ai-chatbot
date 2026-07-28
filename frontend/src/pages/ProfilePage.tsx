import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  Building2,
  Calendar,
  PieChart,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();

  const profileData = user ?? {
    name: 'Guest User',
    studentId: 'N/A',
    email: 'guest@college.edu',
    phone: 'N/A',
    department: 'N/A',
    year: 'N/A',
    semester: 'N/A',
    attendancePercent: 0,
    cgpa: 0,
    initials: 'GU',
  };

  const stats = [
    { Icon: PieChart, label: 'Attendance', value: `${profileData.attendancePercent}%`, color: 'text-emerald-600' },
    { Icon: Award, label: 'CGPA', value: `${profileData.cgpa} / 10`, color: 'text-[#163D8C]' },
  ];

  const details = [
    { Icon: GraduationCap, label: 'Student ID', value: profileData.studentId },
    { Icon: Building2, label: 'Department', value: profileData.department },
    { Icon: Calendar, label: 'Year & Semester', value: `${profileData.year} • ${profileData.semester}` },
    { Icon: Mail, label: 'Email', value: profileData.email },
    { Icon: Phone, label: 'Phone', value: profileData.phone },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#0A2A6A] shadow-sm hover:bg-[#F1F5F9] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-[#E2E8F0] bg-white shadow-lg overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-[#0A2A6A] to-[#163D8C] p-6 text-white">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#E8B24D] text-3xl font-bold text-[#0A2A6A] shadow-lg shadow-black/20">
                {profileData.initials}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-300">
                  {isLoggedIn ? 'Verified Student' : 'Guest Mode'}
                </p>
                <h1 className="mt-1 text-2xl font-bold">{profileData.name}</h1>
                <p className="text-sm text-blue-200">{profileData.department}</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {stats.map(({ Icon, label, value, color }) => (
                <div key={label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </div>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#163D8C]">
              Student Information
            </h2>
            <div className="space-y-3">
              {details.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#163D8C]/8">
                    <Icon className="h-4 w-4 text-[#163D8C]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#0A2A6A]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
