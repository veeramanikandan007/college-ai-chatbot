import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageSquare, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300">
      <Header />

      <main className="flex-1 container flex items-center justify-center py-12">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Page Not Found
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-7">
            The page you are looking for does not exist or has been removed. You can return back to the chatbot or home page using the links below.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition"
            >
              <Home size={16} />
              Home Page
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white dark:bg-secondary dark:text-slate-900 text-sm font-semibold transition hover:opacity-95"
            >
              <MessageSquare size={16} />
              Start Chat
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
