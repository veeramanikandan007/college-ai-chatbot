import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-900/95 p-8 shadow-glass backdrop-blur-xl">
      <div className="mb-6 space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">CollegeMate AI</p>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="text-slate-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
