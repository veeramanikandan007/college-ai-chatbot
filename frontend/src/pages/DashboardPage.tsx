import { motion } from 'framer-motion';

const chatMessages = [
  {
    id: 'm1',
    role: 'assistant',
    text: 'Hello! I’m CollegeMate AI, your smart campus assistant. How can I help you with attendance, timetable, fees, or college services today?',
    time: '09:12 AM',
  },
  {
    id: 'm2',
    role: 'user',
    text: 'What are the library hours and exam preparation resources available?',
    time: '09:14 AM',
  },
  {
    id: 'm3',
    role: 'assistant',
    text: 'The library is open from 8:00 AM to 10:00 PM daily. You can access the study room, digital journals, and request reference support at the front desk.',
    time: '09:15 AM',
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <header className="border-b border-[#E5E7EB] bg-[#0A2A6A] text-white shadow-sm shadow-slate-900/10">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#E8B24D]">CollegeMate AI</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Student Dashboard</h1>
          </div>
          <div className="inline-flex items-center gap-3 rounded-[20px] border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-slate-950/10 backdrop-blur-xl">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#163D8C]/90 text-lg">🎓</span>
            Premium college assistant experience
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <section className="space-y-6 rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(10,42,106,0.08)]">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80"
                alt="Student avatar"
                className="h-20 w-20 rounded-full border-4 border-[#163D8C] object-cover"
              />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#163D8C]">Student Profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#0A2A6A]">Ariana Patel</h2>
                <p className="text-sm text-[#6B7280]">Student ID: STU23911</p>
              </div>
            </div>

            <div className="space-y-4 rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[18px] bg-white p-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#163D8C]">Department</p>
                  <p className="mt-3 text-lg font-semibold">Computer Science</p>
                </div>
                <div className="rounded-[18px] bg-white p-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#163D8C]">Year</p>
                  <p className="mt-3 text-lg font-semibold">3rd Year</p>
                </div>
              </div>

              <div className="rounded-[18px] bg-white p-4 shadow-sm shadow-slate-900/5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#163D8C]">Email</p>
                <p className="mt-3 text-lg font-semibold">ariana.patel@campusmail.edu</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm shadow-slate-900/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.24em] text-[#163D8C]">Attendance</p>
                  <span className="rounded-full bg-[#E8B24D]/10 px-3 py-1 text-xs font-semibold text-[#B07524]">Excellent</span>
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <p className="text-4xl font-semibold text-[#0A2A6A]">94%</p>
                  <p className="text-sm text-[#6B7280]">This semester</p>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div className="h-full w-[94%] rounded-full bg-[#163D8C]" />
                </div>
              </div>

              <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm shadow-slate-900/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.24em] text-[#163D8C]">CGPA</p>
                  <span className="text-sm font-semibold text-[#6B7280]">Cumulative</span>
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <p className="text-4xl font-semibold text-[#0A2A6A]">8.9</p>
                  <p className="text-sm text-[#6B7280]">out of 10</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-h-[720px] flex-col rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(10,42,106,0.08)]">
            <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-5 shadow-sm shadow-slate-900/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#163D8C]">🤖 CollegeMate AI</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#0A2A6A]">Your Smart College Assistant</h2>
                </div>
                <button className="inline-flex items-center gap-2 rounded-[16px] bg-[#E8B24D] px-4 py-3 text-sm font-semibold text-[#0A2A6A] shadow-lg shadow-[#E8B24D]/20 transition hover:bg-[#d7a33d]">
                  <span>Live</span>
                  <span className="text-xs">Active</span>
                </button>
              </div>
              <p className="text-sm leading-6 text-[#475569]">Ask anything about your college services, timetable, attendance, certificates, and campus life.</p>
            </div>

            <div className="flex-1 overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 shadow-inner shadow-slate-900/5">
              <div className="flex h-full flex-col gap-4 overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2">
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className={`max-w-[92%] ${
                        message.role === 'assistant'
                          ? 'self-start rounded-[24px] bg-[#0A2A6A] px-5 py-4 text-white shadow-lg shadow-slate-900/10'
                          : 'self-end rounded-[24px] bg-[#E8B24D]/15 px-5 py-4 text-[#0A2A6A] shadow-lg shadow-slate-900/10'
                      }`}
                    >
                      <p className="text-sm leading-6">{message.text}</p>
                      <span className="mt-3 block text-right text-[11px] font-medium uppercase tracking-[0.24em] text-[#94A3B8]">
                        {message.time}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-4 shadow-sm shadow-slate-900/5">
                  <div className="flex flex-wrap items-center gap-3">
                    <button className="inline-flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#0A2A6A] transition hover:border-[#163D8C] hover:bg-[#EFF6FF]">
                      🎙 Voice
                    </button>
                    <button className="inline-flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#0A2A6A] transition hover:border-[#163D8C] hover:bg-[#EFF6FF]">
                      📎 Attachment
                    </button>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      aria-label="Ask anything about your college"
                      placeholder="Ask anything about your college..."
                      className="w-full rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4 text-base text-[#1F2937] outline-none transition focus:border-[#163D8C] focus:bg-white"
                    />
                    <button className="inline-flex shrink-0 items-center justify-center rounded-[18px] bg-[#E8B24D] px-6 py-4 text-sm font-semibold text-[#0A2A6A] transition hover:bg-[#d7a33d]">
                      Send
                    </button>
                  </div>
                  <div className="mt-3 text-right text-xs uppercase tracking-[0.24em] text-[#94A3B8]">
                    Typing…
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
