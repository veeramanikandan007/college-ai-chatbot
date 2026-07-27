import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function HomePage() {
  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[280px_1fr]">
      <Sidebar active="/" />
      <main className="space-y-10 rounded-[32px] border border-slate-800/80 bg-slate-950/75 p-8 shadow-glass backdrop-blur-xl">
        <section className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-400/80">Your AI campus guide</p>
            <h1 className="text-5xl font-semibold leading-tight text-white">CollegeMate AI makes campus life easier.</h1>
            <p className="max-w-2xl text-slate-400">Chat with a modern assistant for attendance, timetable, fees, certificates, notices, and exam info — built for students, staff, and admins.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/chat" className="inline-flex items-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-400">
                Launch chat
              </Link>
              <Link to="/register" className="inline-flex items-center rounded-2xl border border-slate-700 px-6 py-3 text-sm text-slate-200 transition hover:border-slate-500">
                Create account
              </Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="rounded-[32px] border border-slate-800/80 bg-slate-900/80 p-8 shadow-glass"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">What you can ask</p>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li>🧑‍🎓 Attendance status and timetable</li>
              <li>💰 Fee payment and semester reports</li>
              <li>📚 Library rules, hostel updates, exam schedule</li>
              <li>🧠 Intelligent responses with trusted college documents</li>
            </ul>
          </motion.div>
        </section>
        <section className="grid gap-6 lg:grid-cols-3">
          {[
            { title: 'AI Chat', description: 'Ask college questions, get real-time answers with RAG context.' },
            { title: 'Student Portal', description: 'View attendance, fees, results, certificates and notices.' },
            { title: 'Admin Tools', description: 'Manage students, approve certificates, and upload documents.' },
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-glass">
              <h2 className="text-xl font-semibold text-white">{card.title}</h2>
              <p className="mt-3 text-slate-400">{card.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
