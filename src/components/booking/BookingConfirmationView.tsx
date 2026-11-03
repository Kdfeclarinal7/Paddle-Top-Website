import React from 'react';
import type { ConfirmedBooking } from '../../types/booking';
import { CheckCircle, Calendar, Clock, ArrowRight } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateUtils';

interface BookingConfirmationViewProps {
  booking: ConfirmedBooking;
  onBookAnother: () => void;
  onReturnHome: () => void;
}

export const BookingConfirmationView: React.FC<BookingConfirmationViewProps> = ({
  booking,
  onBookAnother,
  onReturnHome,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-[#0E172A] border border-neutral-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-lg space-y-7 animate-in fade-in">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Booking Confirmed
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-neutral-900 dark:text-white">
          You're Ready to Play!
        </h2>

        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          A confirmation reference has been created for your session at PADDLE TOP.
        </p>
      </div>

      {/* Reference Code Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
            Booking Reference Code
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#2A4408] dark:text-[#A3E635] tracking-wide">
            {booking.referenceCode}
          </span>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold uppercase">
            Paid ({booking.paymentMethod})
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#0A1120] text-white dark:bg-white dark:text-[#0A1120] font-mono font-bold uppercase">
            Confirmed
          </span>
        </div>
      </div>

      {/* Details List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="p-4 rounded-xl border border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/[0.01] space-y-1">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>Court & Date</span>
          </div>
          <p className="font-bold text-neutral-900 dark:text-white font-display text-base">
            {booking.draft.courtName}
          </p>
          <p className="text-xs text-neutral-500">
            {formatDisplayDate(booking.draft.date)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/[0.01] space-y-1">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Reserved Session</span>
          </div>
          <p className="font-bold text-neutral-900 dark:text-white font-mono text-base">
            {booking.draft.displayTimeWindow}
          </p>
          <p className="text-xs text-neutral-500">
            {booking.draft.selectedHours} {booking.draft.selectedHours === 1 ? 'hour' : 'hours'} continuous play
          </p>
        </div>
      </div>

      {/* Player info */}
      <div className="text-xs text-neutral-500 dark:text-neutral-400 p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5 space-y-1">
        <div className="font-semibold text-neutral-800 dark:text-neutral-200">
          Player: {booking.customerName} ({booking.customerEmail})
        </div>
        <p>
          Please arrive 10 minutes prior to your start time. Bring your paddle or demo one at our pro counter.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onReturnHome}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-200 dark:border-white/10 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          Return to Homepage
        </button>

        <button
          type="button"
          onClick={onBookAnother}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#84CC16] hover:bg-[#A3E635] text-[#0A1120] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Book Another Session</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
