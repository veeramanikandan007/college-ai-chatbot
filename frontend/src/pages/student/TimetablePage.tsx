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
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 font-body">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
              <CalendarIcon className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
              Weekly Timetable
            </h1>
            <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Review your weekly lecture schedule and classroom locations.</p>
          </div>
          
          <div className="flex bg-white dark:bg-[#1E293B] rounded-xl p-1.5 shadow-xs border border-[#E2E8F0] dark:border-[#334155] w-full sm:w-auto overflow-x-auto">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={`px-4 py-2.5 text-small font-semibold rounded-xl transition-all duration-180 whitespace-nowrap ${
                  currentDay === day
                    ? 'bg-[#0E2A6D] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 pt-2">
          {periods.map((time, index) => {
            const key = `${currentDay}-${time}`;
            const cls = mockTimetable[key];

            // Lunch break
            if (index === 4) {
              return (
                <div key="lunch" className="flex items-center gap-4 py-2">
                  <div className="w-24 shrink-0 text-small font-bold text-[#64748B] text-right">1:15 PM</div>
                  <div className="flex-1 rounded-xl bg-white dark:bg-[#1E293B] border border-dashed border-[#E2E8F0] dark:border-[#334155] p-4 text-center text-small font-heading font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.02em]">
                    Lunch Break
                  </div>
                </div>
              );
            }

            return (
              <div key={time} className="flex items-stretch gap-4">
                <div className="w-24 shrink-0 flex flex-col justify-center text-small font-bold text-[#64748B] text-right pt-4">
                  {time}
                </div>
                
                <div className="flex-1">
                  {cls ? (
                    <div className="h-full rounded-xl bg-white dark:bg-[#1E293B] p-5 shadow-xs border border-l-4 border-[#E2E8F0] dark:border-[#334155] border-l-[#0E2A6D] dark:border-l-[#60A5FA] hover:shadow-md transition-all duration-180">
                      <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] mb-3">{cls.subject}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-small text-[#64748B] dark:text-[#94A3B8]">
                        <div className="flex items-center gap-1.5 bg-[#F5F7FB] dark:bg-[#0F172A] px-2.5 py-1 rounded-lg">
                          <User size={14} className="text-[#F59E0B]" />
                          <span>{cls.faculty}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#F5F7FB] dark:bg-[#0F172A] px-2.5 py-1 rounded-lg">
                          <MapPin size={14} className="text-[#22C55E]" />
                          <span>{cls.room}</span>
                        </div>
                        {cls.span > 1 && (
                          <div className="flex items-center gap-1.5 bg-[#F5F7FB] dark:bg-[#0F172A] px-2.5 py-1 rounded-lg text-[#0E2A6D] dark:text-[#60A5FA] font-bold">
                            <Clock size={14} />
                            <span>{cls.span} Hours</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full min-h-[80px] rounded-xl bg-white dark:bg-[#1E293B] border border-dashed border-[#E2E8F0] dark:border-[#334155] p-5 flex items-center justify-center">
                      <span className="text-small font-semibold text-[#64748B] dark:text-[#94A3B8]">Free Period</span>
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
