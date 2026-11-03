import React, { useState, useEffect } from 'react';
import type { BookingHold } from '../../types/booking';
import { Clock, ShieldCheck, CreditCard, XCircle, ArrowRight } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateUtils';

interface MockHoldViewProps {
  hold: BookingHold;
  onProceedToPayment: () => void;
  onReleaseHold: () => void;
}

export const MockHoldView: React.FC<MockHoldViewProps> = ({
  hold,
  onProceedToPayment,
  onReleaseHold,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, Math.floor((hold.expiresAt - Date.now()) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((hold.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [hold.expiresAt]);

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isExpired = secondsRemaining <= 0;
  const totalDurationSeconds = 10 * 60;
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / totalDurationSeconds) * 100));

  return (
    <div className="bg-white dark:bg-[#0E172A] border border-amber-300/80 dark:border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                Temporary Hold Active
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                {hold.holdId}
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-neutral-900 dark:text-white">
              Court Reserved for {hold.userName || 'Player'}
            </h3>
          </div>
        </div>

        {/* Countdown Pill */}
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-900/40">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 block leading-none">
              Time Remaining
            </span>
            <span className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300">
              {formatCountdown(secondsRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            secondsRemaining < 60 ? 'bg-rose-500' : secondsRemaining < 120 ? 'bg-amber-500' : 'bg-[#84CC16]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Reservation Details */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5 text-sm">
        <div>
          <span className="text-xs text-neutral-400 block font-mono">Court</span>
          <span className="font-bold text-neutral-900 dark:text-white">{hold.draft.courtName}</span>
        </div>
        <div>
          <span className="text-xs text-neutral-400 block font-mono">Date</span>
          <span className="font-bold text-neutral-900 dark:text-white">{formatDisplayDate(hold.draft.date)}</span>
        </div>
        <div>
          <span className="text-xs text-neutral-400 block font-mono">Reserved Blocks</span>
          <span className="font-bold text-neutral-900 dark:text-white font-mono">
            {hold.draft.displayTimeWindow} ({hold.draft.selectedHours} {hold.draft.selectedHours === 1 ? 'hr' : 'hrs'})
          </span>
        </div>
        <div>
          <span className="text-xs text-neutral-400 block font-mono">Amount (Mock)</span>
          <span className="font-bold text-[#2A4408] dark:text-[#A3E635] font-mono">₱{hold.draft.priceEstimatePhp}</span>
        </div>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
        This continuous hourly session is held exclusively for you. Other players will see this court as <em>Held</em>. If payment is not completed before the countdown expires, the hold will automatically release back to public availability.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onReleaseHold}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          <span>Release / Cancel Hold</span>
        </button>

        <button
          type="button"
          disabled={isExpired}
          onClick={onProceedToPayment}
          className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] active:scale-[0.98] rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
        >
          <CreditCard className="w-4 h-4" />
          <span>Proceed to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isExpired && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center">
          Your 10-minute hold has expired. Please select an available slot to reserve again.
        </div>
      )}
    </div>
  );
};
