import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-neutral-800/80 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="w-full divide-y divide-neutral-800/60">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-3.5 px-4">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Skeleton key={cIdx} className={`h-4 ${cIdx === 0 ? 'w-28' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  );
};
