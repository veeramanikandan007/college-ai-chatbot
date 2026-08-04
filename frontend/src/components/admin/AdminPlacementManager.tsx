import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PageContainer } from '../ui/PageContainer';
import { DashboardCard } from '../ui/DashboardCard';

export const AdminPlacementManager: React.FC = () => {
  const navigate = useNavigate();

  const mockDrives = [
    { id: 1, company: 'TCS Digital', role: 'Software Engineer', cpa: '7.5 LPA', eligibleDepts: 'CSE, IT', date: '2026-08-25', status: 'Upcoming', applicants: 84 },
    { id: 2, company: 'Zoho Corporation', role: 'Member Technical Staff', cpa: '8.4 LPA', eligibleDepts: 'All BE/BTech', date: '2026-09-02', status: 'Upcoming', applicants: 112 },
    { id: 3, company: 'Infosys Specialist Program', role: 'System Engineer Specialist', cpa: '9.5 LPA', eligibleDepts: 'CSE, IT, ECE', date: '2026-09-10', status: 'Open', applicants: 96 },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Placement Hub & Recruitment Control"
        description="Manage campus placement drives, company offers, eligibility criteria, and applicant logs."
        icon={Briefcase}
        actionText="Launch Placement Hub"
        actionIcon={ExternalLink}
        onActionClick={() => navigate('/placement')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockDrives.map((d) => (
          <DashboardCard
            key={d.id}
            className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={d.status === 'Open' ? 'success' : 'neutral'}>
                  {d.status}
                </Badge>
                <span className="font-heading font-bold text-sm text-amber-600 dark:text-amber-500">{d.cpa}</span>
              </div>

              <div>
                <h4 className="font-heading font-bold text-lg text-zinc-900 dark:text-zinc-100">{d.company}</h4>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{d.role}</p>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Eligible: {d.eligibleDepts} · Drive Date: {d.date}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Applicants: <strong className="text-zinc-900 dark:text-zinc-100">{d.applicants}</strong></span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/placement')} rightIcon={<ExternalLink size={14} />}>
                Details
              </Button>
            </div>
          </DashboardCard>
        ))}
      </div>
    </PageContainer>
  );
};
