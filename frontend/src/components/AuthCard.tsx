import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-lg">
      <div className="mb-6 space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-[#163D8C]">CollegeMate AI</p>
        <h1 className="text-3xl font-semibold text-[#0A2A6A]">{title}</h1>
        <p className="text-[#64748B]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
