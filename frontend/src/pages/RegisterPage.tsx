import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="container flex min-h-[calc(100vh-3rem)] items-center py-12">
      <div className="mx-auto w-full max-w-xl">
        <AuthCard title="Create your account" subtitle="Start using CollegeMate AI for campus assistance.">
          <form className="space-y-5">
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Full name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                className="w-full rounded-3xl border border-slate-800/90 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                placeholder="Jane Doe"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-3xl border border-slate-800/90 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                placeholder="you@example.edu"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="w-full rounded-3xl border border-slate-800/90 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                placeholder="Create password"
              />
            </label>
            <button type="submit" className="inline-flex w-full items-center justify-center rounded-3xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
              Sign up
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-100 hover:text-white">
              Sign in
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
