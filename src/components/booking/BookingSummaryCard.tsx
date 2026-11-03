import React from 'react';
import type { BookingDraft } from '../../types/booking';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateUtils';
import { MOCK_HOURLY_RATE_PHP } from '../../services/bookingService';

interface BookingSummaryCardProps {
  draft: BookingDraft | null;
  onContinue: () => void;
  isLoading?: boolean;
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  draft,
  onContinue,
  isLoading = false,
}) => {
  if (!draft) {
    return (
      <div className="bg-white dark:bg-[#0E172A] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
          Reservation Summary
        </h3>
        <div className="p-6 border border-dashed border-neutral-200 dark:border-white/10 rounded-xl text-center space-y-2">
          <Clock className="w-6 h-6 text-neutral-400 mx-auto" />
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Select a court, date, and one or more consecutive 1-hour slots to view your reservation summary.
          </p>
        </div>
        <div className="text-[11px] text-neutral-400 text-center">
          10-minute hold will lock your court upon sign in
        </div>
      </div>
    );
  }

  const hoursLabel = draft.selectedHours === 1 ? '1 HOUR' : `${draft.selectedHours} HOURS`;

  return (
    <div className="bg-white dark:bg-[#0E172A] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#3F6212] dark:text-[#A3E635] font-bold">
            PADDLE TOP Venue
          </span>
          <h3 className="text-lg font-bold font-display text-neutral-900 dark:text-white">
            {draft.courtName}
          </h3>
        </div>
        <span className="text-xs font-mono font-bold bg-[#84CC16] text-[#0A1120] px-2.5 py-0.5 rounded-md shadow-xs">
          {hoursLabel}
        </span>
      </div>

      {/* Details list */}
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
          <Calendar className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-neutral-900 dark:text-white">
              {formatDisplayDate(draft.date)}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Single continuous session
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
          <Clock className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-neutral-900 dark:text-white font-mono">
              {draft.displayTimeWindow}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {draft.selectedHours} {draft.selectedHours === 1 ? 'hour' : 'hours'} continuous playing time
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
          <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-neutral-900 dark:text-white">
              PADDLE TOP
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Philippines · Dedicated Court
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="pt-3 border-t border-neutral-100 dark:border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>{draft.selectedHours} hr × ₱{MOCK_HOURLY_RATE_PHP}/hr</span>
          <span className="font-mono">₱{draft.priceEstimatePhp}</span>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm font-bold text-neutral-900 dark:text-white">
            Total Estimated
          </span>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-[#2A4408] dark:text-[#A3E635]">
              ₱{draft.priceEstimatePhp}
            </span>
            <span className="text-[10px] text-neutral-400 block font-mono">
              Provisional mock rate
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onContinue}
        disabled={isLoading}
        className="w-full py-3.5 px-4 text-center text-sm font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] active:scale-[0.98] rounded-xl transition-all shadow-md focus-visible:outline-2 focus-visible:outline-[#84CC16] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <span>Continue to Reserve</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center leading-normal">
        Requires sign-in to create 10-minute hold. No payment is charged until confirmed.
      </div>
    </div>
  );
};
