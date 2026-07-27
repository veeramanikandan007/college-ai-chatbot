import { motion, AnimatePresence } from 'framer-motion';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileDrawer({ isOpen, onClose, onLogout }: ProfileDrawerProps) {
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
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#163D8C]">
                  Student Account
                </p>
                <h2 className="text-xl font-bold text-[#0A2A6A]">Profile Details</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[#0A2A6A] hover:bg-[#F1F5F9]"
              >
                ✕
              </button>
            </div>

            {/* Profile Hero */}
            <div className="my-6 flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#F8FAFC] to-white p-4 shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80"
                alt="Ariana Patel"
                className="h-16 w-16 rounded-2xl border-2 border-[#163D8C] object-cover shadow-sm"
              />
              <div>
                <h3 className="text-lg font-bold text-[#0A2A6A]">Ariana Patel</h3>
                <p className="text-xs font-semibold text-[#163D8C]">ID: STU23911</p>
                <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200">
                  Verified Student
                </span>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Attendance
                </p>
                <p className="text-xl font-bold text-[#0A2A6A]">94%</p>
                <span className="text-[10px] font-medium text-emerald-600">Excellent</span>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  CGPA
                </p>
                <p className="text-xl font-bold text-[#0A2A6A]">8.9</p>
                <span className="text-[10px] font-medium text-[#163D8C]">Top 5%</span>
              </div>
            </div>

            {/* Profile Info Details List */}
            <div className="flex-1 space-y-3 text-xs text-[#1F2937]">
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-[#64748B]">Department</p>
                <p className="font-semibold text-[#0A2A6A]">Computer Science & Engineering</p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-[#64748B]">Year & Semester</p>
                <p className="font-semibold text-[#0A2A6A]">3rd Year • Semester 6</p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-[#64748B]">Email Address</p>
                <p className="font-semibold text-[#0A2A6A]">ariana.patel@campusmail.edu</p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-[#64748B]">Phone Number</p>
                <p className="font-semibold text-[#0A2A6A]">+1 (555) 019-2834</p>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 space-y-2 border-t border-[#E2E8F0] pt-4">
              <button
                onClick={() => alert('Profile Editing is managed by College Registrar.')}
                className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs font-bold text-[#0A2A6A] hover:bg-[#F1F5F9] transition"
              >
                <span>⚙️ Edit Profile</span>
                <span>→</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
              >
                <span>🚪 Logout Account</span>
                <span>→</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
