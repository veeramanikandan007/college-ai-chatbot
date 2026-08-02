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
    <div key={event.id} className="bg-white dark:bg-[#1E293B] p-5 rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row gap-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
      <div className="flex flex-col items-center justify-center bg-[#0E2A6D]/5 dark:bg-[#0F172A] rounded-xl w-20 h-20 shrink-0 border border-[#0E2A6D]/10">
        <span className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#1E4DB7] dark:text-[#60A5FA]">
          {event.date.split(' ')[0]}
        </span>
        <span className="font-heading text-section font-extrabold text-[#0E2A6D] dark:text-[#F8FAFC]">
          {event.date.split(' ')[1].replace(',', '')}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#D9A441] bg-[#D9A441]/10 px-2 py-0.5 rounded-md">
            {event.category}
          </span>
        </div>
        <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] mb-2">{event.title}</h3>
        <div className="flex flex-wrap gap-4 text-small font-medium text-[#64748B] dark:text-[#94A3B8]">
          <div className="flex items-center gap-1.5"><Clock size={16} className="text-[#1E4DB7] dark:text-[#60A5FA]" />{event.time}</div>
          <div className="flex items-center gap-1.5"><MapPin size={16} className="text-[#22C55E]" />{event.location}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 font-body">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
            <Calendar className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
            Campus Events
          </h1>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Discover what's happening around the Mount Zion campus.</p>
        </div>

        <div>
          <h2 className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC] mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
            Upcoming Events
          </h2>
          <div className="grid gap-4">
            {upcomingEvents.map(renderEvent)}
          </div>
        </div>

        <div>
          <h2 className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC] mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]"></span>
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
