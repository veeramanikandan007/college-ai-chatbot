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
    <div className="space-y-6 font-sans">
      {/* ── Top Hero Header Card ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
        <div className="space-y-1">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Placement Hub & Recruitment Control</h3>
          <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Manage campus placement drives, company offers, eligibility criteria, and applicant logs.</p>
        </div>

        <button
          onClick={() => navigate('/placement')}
          className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <ExternalLink size={16} /> Launch Placement Hub
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockDrives.map((d) => (
          <div
            key={d.id}
            className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4 hover:border-[#111827]/30 dark:hover:border-[#FAFAFA]/30 transition flex flex-col justify-between group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {d.status}
                </span>
                <span className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA]">{d.cpa}</span>
              </div>

              <h4 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-snug">{d.company}</h4>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">{d.role}</p>
              <p className="text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                Eligible: {d.eligibleDepts} · Date: {d.date}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-[13px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">
              <span>Applicants: <strong className="text-[#111827] dark:text-[#FAFAFA] font-semibold">{d.applicants}</strong></span>
              <button onClick={() => navigate('/placement')} className="text-[#111827] hover:underline dark:text-[#FAFAFA] transition cursor-pointer">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
