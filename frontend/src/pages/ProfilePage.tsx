import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_80px_rgba(10,42,106,0.08)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80" alt="Student avatar" className="h-20 w-20 rounded-full border-4 border-[#163D8C] object-cover" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#163D8C]">Student Profile</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#0A2A6A]">Ariana Patel</h2>
              <p className="text-sm text-[#64748B]">Computer Science • 3rd Year</p>
            </div>
          </div>
          <Link to="/dashboard" className="rounded-full bg-[#E8B24D] px-4 py-2 text-sm font-semibold text-[#0A2A6A] shadow-md shadow-[#E8B24D]/20">
            Back to chat
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#163D8C]">Student ID</p>
            <p className="mt-2 text-lg font-semibold text-[#0A2A6A]">STU23911</p>
          </div>
          <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#163D8C]">Email</p>
            <p className="mt-2 text-lg font-semibold text-[#0A2A6A]">ariana.patel@campusmail.edu</p>
          </div>
          <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#163D8C]">Phone</p>
            <p className="mt-2 text-lg font-semibold text-[#0A2A6A]">+1 555 0123</p>
          </div>
          <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#163D8C]">Attendance</p>
            <p className="mt-2 text-lg font-semibold text-[#0A2A6A]">94%</p>
          </div>
          <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#163D8C]">CGPA</p>
            <p className="mt-2 text-lg font-semibold text-[#0A2A6A]">8.9 / 10</p>
          </div>
          <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#163D8C]">Semester</p>
            <p className="mt-2 text-lg font-semibold text-[#0A2A6A]">6th Semester</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
