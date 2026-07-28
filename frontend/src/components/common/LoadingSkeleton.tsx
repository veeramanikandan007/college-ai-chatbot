import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="animate-pulse space-y-4 w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
      ))}
    </div>
  );
};
