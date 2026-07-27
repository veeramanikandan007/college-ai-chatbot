import Sidebar from '../components/Sidebar';

export default function AdminDashboardPage() {
  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[280px_1fr]">
      <Sidebar active="/admin" />
      <main className="space-y-8 rounded-[32px] border border-slate-800/80 bg-slate-950/75 p-8 shadow-glass backdrop-blur-xl">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">Admin dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Campus operations overview</h1>
          <p className="mt-3 text-slate-400">Manage content, review documents, and monitor student interactions across the CollegeMate AI platform.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { title: 'Students', subtitle: 'Manage student accounts, attendance, and results.' },
            { title: 'Documents', subtitle: 'Upload PDFs, approve certificates, and organize resources.' },
            { title: 'Notices', subtitle: 'Publish campus notices and event bulletins.' },
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
              <h2 className="text-xl font-semibold text-white">{card.title}</h2>
              <p className="mt-3 text-slate-400">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
