import React from 'react';
import { AlertCircle, RefreshCw, CalendarX } from 'lucide-react';

interface BookingErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const BookingErrorState: React.FC<BookingErrorStateProps> = ({
  message = 'We could not load court availability right now.',
  onRetry,
}) => {
  return (
    <div className="bg-white dark:bg-[#0E172A] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold font-display text-neutral-900 dark:text-white">
          Availability Unavailable
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#A3E635] text-[#0A1120] text-sm font-bold transition-all shadow-xs cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry Availability Check</span>
      </button>
    </div>
  );
};

interface BookingEmptyStateProps {
  date: string;
  onChangeDate: () => void;
}

export const BookingEmptyState: React.FC<BookingEmptyStateProps> = ({
  onChangeDate,
}) => {
  return (
    <div className="bg-white dark:bg-[#0E172A] border border-neutral-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-white/10 text-neutral-400 mx-auto flex items-center justify-center">
        <CalendarX className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold font-display text-neutral-900 dark:text-white">
          All Courts Fully Booked
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          No remaining open slots are available for this date.
        </p>
      </div>

      <button
        type="button"
        onClick={onChangeDate}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A1120] hover:bg-[#14223C] dark:bg-white dark:text-[#0A1120] text-white text-sm font-bold transition-all cursor-pointer"
      >
        <span>Browse Next Available Date</span>
      </button>
    </div>
  );
};
