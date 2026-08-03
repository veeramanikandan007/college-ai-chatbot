import React from 'react';

export interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  height = 'h-16',
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full ${height} bg-zinc-100 dark:bg-zinc-800/80 animate-pulse rounded-xl border border-zinc-200/50 dark:border-zinc-800`}
        />
      ))}
    </div>
  );
};
