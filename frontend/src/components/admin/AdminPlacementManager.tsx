import React from 'react';
import { Briefcase, Building2, ExternalLink, CheckCircle2, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminPlacementManager: React.FC = () => {
  const navigate = useNavigate();

  const mockDrives = [
    { id: 1, company: 'TCS Digital', role: 'Software Engineer', cpa: '7.5 LPA', eligibleDepts: 'CSE, IT', date: '2026-08-25', status: 'Upcoming', applicants: 84 },
    { id: 2, company: 'Zoho Corporation', role: 'Member Technical Staff', cpa: '8.4 LPA', eligibleDepts: 'All BE/BTech', date: '2026-09-02', status: 'Upcoming', applicants: 112 },
    { id: 3, company: 'Infosys Specialist Program', role: 'System Engineer Specialist', cpa: '9.5 LPA', eligibleDepts: 'CSE, IT, ECE', date: '2026-09-10', status: 'Open', applicants: 96 },
  ];

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div>
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Placement Hub & Recruitment Control</h3>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Manage campus placement drives, company offers, eligibility criteria, and applicant logs.</p>
        </div>

        <button
          onClick={() => navigate('/placement')}
          className="h-10 px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition shrink-0"
        >
          <ExternalLink size={16} /> Launch Placement Hub
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mockDrives.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4 hover:border-[#D9A441]/40 transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-caption font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {d.status}
                </span>
                <span className="font-heading font-bold text-caption text-[#D9A441]">{d.cpa}</span>
              </div>

              <h4 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">{d.company}</h4>
              <p className="text-caption font-semibold text-[#0E2A6D] dark:text-[#60A5FA]">{d.role}</p>
              <p className="text-caption text-[#64748B] dark:text-[#94A3B8]">
                Eligible: {d.eligibleDepts} · Drive Date: {d.date}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-caption font-bold text-[#64748B]">
              <span>Applicants: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{d.applicants}</strong></span>
              <button onClick={() => navigate('/placement')} className="text-[#1E4DB7] dark:text-[#60A5FA]">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
