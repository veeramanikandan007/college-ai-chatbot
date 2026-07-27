import Sidebar from '../components/Sidebar';

export default function ProfilePage() {
  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[280px_1fr]">
      <Sidebar active="/profile" />
      <main className="space-y-8 rounded-[32px] border border-slate-800/80 bg-slate-950/75 p-8 shadow-glass backdrop-blur-xl">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">Student profile</p>
              <h1 className="text-3xl font-semibold text-white">Welcome back, Student</h1>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { label: 'Department', value: 'Computer Science' },
              { label: 'Year', value: '3rd Year' },
              { label: 'Email', value: 'student@example.edu' },
              { label: 'Phone', value: '+1 555 123 4567' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-slate-950/80 p-5 text-slate-300 shadow-inner">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { title: 'Attendance', value: '87%' },
            { title: 'Fees paid', value: '$4,200' },
            { title: 'CGPA', value: '8.9' },
          ].map((metric) => (
            <div key={metric.title} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{metric.title}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{metric.value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
