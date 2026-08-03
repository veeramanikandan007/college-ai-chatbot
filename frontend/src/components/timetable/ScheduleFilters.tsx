import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
import { TimetableItem } from './types';

interface FiltersProps {
  entries: TimetableItem[];
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function ScheduleFilters({ entries, activeFilter, setActiveFilter, searchQuery, setSearchQuery }: FiltersProps) {
  
  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('timetable-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getCounts = () => {
    return {
      All: entries.length,
      Theory: entries.filter(e => e.subject_type === 'Theory').length,
      Lab: entries.filter(e => e.subject_type === 'Lab').length,
      Upcoming: entries.filter(e => e.status === 'Upcoming').length,
      Completed: entries.filter(e => e.status === 'Completed').length,
    };
  };

  const counts = getCounts();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
        {(['All', 'Theory', 'Lab', 'Upcoming', 'Completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`h-10 px-5 rounded-full text-[14px] font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeFilter === f
                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                : 'bg-transparent text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] hover:bg-[#F3F4F6] dark:hover:bg-[#2A2A2A]'
            }`}
          >
            {f}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeFilter === f
                ? 'bg-[#FFFFFF]/20 dark:bg-[#111111]/20'
                : 'bg-[#F3F4F6] dark:bg-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]'
            }`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="relative w-full md:w-80 group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors group-focus-within:text-[#111827] dark:group-focus-within:text-[#FAFAFA]" />
        <input
          id="timetable-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search timetable..."
          className="w-full h-11 pl-11 pr-14 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] focus:ring-1 focus:ring-[#111827] dark:focus:ring-[#FAFAFA] transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[12px] font-medium text-[#9CA3AF]">
          <kbd className="px-1.5 py-0.5 rounded border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F9FAFB] dark:bg-[#111111]">Ctrl</kbd>
          <kbd className="px-1.5 py-0.5 rounded border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F9FAFB] dark:bg-[#111111]">K</kbd>
        </div>
      </div>
    </div>
  );
}
