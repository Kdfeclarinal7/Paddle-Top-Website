import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const BookingLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Date selector skeleton */}
      <div className="bg-white dark:bg-[#0E172A] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="min-w-[64px] h-[72px] rounded-xl shrink-0" />
          ))}
        </div>
      </div>

      {/* Schedule Grid Table Skeleton */}
      <div className="rounded-2xl border border-neutral-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0E172A] p-4 space-y-4">
        <div className="grid grid-cols-5 gap-3 border-b border-neutral-100 dark:border-white/5 pb-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>

        {[1, 2, 3, 4, 5, 6, 7].map((row) => (
          <div key={row} className="grid grid-cols-5 gap-3 py-1">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};
