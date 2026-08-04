import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-[#0A0A0A] rounded-xl border border-[#E2E8F0] dark:border-[#2A2A2A] shadow-sm p-5 md:p-6 ${className}`}>
      {children}
    </div>
  );
};
