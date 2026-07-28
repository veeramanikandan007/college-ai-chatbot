import { Calendar, MapPin, Clock } from 'lucide-react';

const mockEvents = [
  { id: 1, title: 'Tech Symposium 2026', date: 'Oct 15, 2026', time: '9:00 AM', location: 'Main Auditorium', category: 'Technical', type: 'upcoming' },
  { id: 2, title: 'Campus Recruitment Drive', date: 'Oct 18, 2026', time: '10:00 AM', location: 'Placement Cell', category: 'Career', type: 'upcoming' },
  { id: 3, title: 'Diwali Celebrations', date: 'Oct 22, 2026', time: '5:00 PM', location: 'Open Grounds', category: 'Cultural', type: 'upcoming' },
  { id: 4, title: 'Guest Lecture: AI in Healthcare', date: 'Sep 30, 2026', time: '2:00 PM', location: 'Seminar Hall 2', category: 'Academic', type: 'past' },
];

export default function EventsPage() {
  const upcomingEvents = mockEvents.filter(e => e.type === 'upcoming');
  const pastEvents = mockEvents.filter(e => e.type === 'past');

  const renderEvent = (event: any) => (
    <div key={event.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
      <div className="flex flex-col items-center justify-center bg-[#0A2A6A]/5 dark:bg-slate-900/50 rounded-xl w-20 h-20 shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-[#163D8C] dark:text-blue-400">
          {event.date.split(' ')[0]}
        </span>
        <span className="text-2xl font-black text-[#0A2A6A] dark:text-white">
          {event.date.split(' ')[1].replace(',', '')}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8B24D] bg-[#E8B24D]/10 px-2 py-0.5 rounded-full">
            {event.category}
          </span>
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{event.title}</h3>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-[#163D8C]" />{event.time}</div>
          <div className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" />{event.location}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="text-[#0A2A6A]" />
            Campus Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">Discover what's happening around the campus.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Upcoming Events
          </h2>
          <div className="grid gap-4">
            {upcomingEvents.map(renderEvent)}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            Past Events
          </h2>
          <div className="grid gap-4 opacity-75">
            {pastEvents.map(renderEvent)}
          </div>
        </div>
      </div>
    </div>
  );
}
