import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageSquare, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] font-body">
      <Header />

      <main className="flex-1 container mx-auto flex items-center justify-center py-12">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-950/30 text-[#EF4444]">
            <AlertCircle size={48} />
          </div>
          <h1 className="font-heading text-hero font-extrabold tracking-[0.02em] text-[#1F2937] dark:text-[#F8FAFC]">
            Page Not Found
          </h1>
          <p className="text-body text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            The page you are looking for does not exist or has been removed. You can return back to the chatbot or home page using the links below.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] text-small font-btn transition"
            >
              <Home size={18} />
              Home Page
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-small font-btn transition shadow-sm"
            >
              <MessageSquare size={18} />
              Start Chat
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
