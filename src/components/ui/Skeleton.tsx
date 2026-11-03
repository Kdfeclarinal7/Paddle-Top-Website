import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-neutral-200/80 dark:bg-white/10 ${className}`}
      {...props}
    />
  );
};

export const CourtCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0E172A] border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden p-6 space-y-4 shadow-xs">
      <Skeleton className="w-full aspect-[16/10] rounded-xl" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="pt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
};

export const SlotGridSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
};
