import { Link } from 'react-router-dom';

interface SidebarProps {
  active: string;
}

const links = [
  { path: '/chat', label: 'Chat' },
  { path: '/profile', label: 'Profile' },
];

export default function Sidebar({ active }: SidebarProps) {
  return (
    <aside className="hidden w-72 flex-col gap-3 rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-glass lg:flex">
      <div className="mb-6 rounded-3xl bg-slate-900/80 p-5 text-slate-100 shadow-inner">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-400/80">CollegeMate AI</p>
        <h2 className="mt-3 text-xl font-semibold">Smart campus assistant</h2>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
              active === link.path ? 'bg-slate-900 text-slate-100 shadow' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
