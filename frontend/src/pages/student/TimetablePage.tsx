import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = ['9:00 AM', '10:00 AM', '11:15 AM', '12:15 PM', '2:00 PM', '3:00 PM'];

const mockTimetable: Record<string, any> = {
  'Monday-9:00 AM': { subject: 'Data Structures', faculty: 'Dr. Smith', room: 'Room 302' },
  'Monday-10:00 AM': { subject: 'Operating Systems', faculty: 'Prof. Johnson', room: 'Room 305' },
  'Monday-2:00 PM': { subject: 'Lab: Data Structures', faculty: 'Dr. Smith', room: 'Lab 1', span: 2 },
  'Tuesday-9:00 AM': { subject: 'Computer Networks', faculty: 'Dr. Brown', room: 'Room 201' },
  'Tuesday-11:15 AM': { subject: 'Database Systems', faculty: 'Prof. Davis', room: 'Room 105' },
  'Wednesday-10:00 AM': { subject: 'Machine Learning', faculty: 'Dr. Wilson', room: 'Room 401' },
  'Wednesday-2:00 PM': { subject: 'Lab: Networks', faculty: 'Dr. Brown', room: 'Lab 3', span: 2 },
  'Thursday-9:00 AM': { subject: 'Operating Systems', faculty: 'Prof. Johnson', room: 'Room 305' },
  'Thursday-12:15 PM': { subject: 'Data Structures', faculty: 'Dr. Smith', room: 'Room 302' },
  'Friday-11:15 AM': { subject: 'Database Systems', faculty: 'Prof. Davis', room: 'Room 105' },
  'Friday-2:00 PM': { subject: 'Machine Learning', faculty: 'Dr. Wilson', room: 'Room 401' },
};

export default function TimetablePage() {
  const [currentDay, setCurrentDay] = useState('Monday');

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-[#0A2A6A]" />
            Weekly Timetable
          </h1>
          
          <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700 w-full sm:w-auto overflow-x-auto">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  currentDay === day 
                    ? 'bg-[#0A2A6A] text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {periods.map((time, index) => {
            const key = `${currentDay}-${time}`;
            const cls = mockTimetable[key];

            // If it's a break (1:15 PM)
            if (index === 4) {
              return (
                <div key="lunch" className="flex items-center gap-4 py-2">
                  <div className="w-24 shrink-0 text-sm font-bold text-slate-400 text-right">1:15 PM</div>
                  <div className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-sm font-medium text-slate-500 uppercase tracking-widest">
                    Lunch Break
                  </div>
                </div>
              );
            }

            return (
              <div key={time} className="flex items-stretch gap-4">
                <div className="w-24 shrink-0 flex flex-col justify-center text-sm font-bold text-slate-500 dark:text-slate-400 text-right pt-4">
                  {time}
                </div>
                
                <div className="flex-1">
                  {cls ? (
                    <div className="h-full rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-l-4 border-slate-100 border-l-[#163D8C] dark:border-slate-700 transition hover:shadow-md">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">{cls.subject}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-md">
                          <User size={14} className="text-[#E8B24D]" />
                          <span>{cls.faculty}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-md">
                          <MapPin size={14} className="text-emerald-500" />
                          <span>{cls.room}</span>
                        </div>
                        {cls.span > 1 && (
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-md text-[#163D8C] font-medium">
                            <Clock size={14} />
                            <span>{cls.span} Hours</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700 p-5 flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-400">Free Period</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
