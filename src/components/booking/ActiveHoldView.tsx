import React, { useEffect, useRef, useState } from 'react';
import { Clock, ShieldCheck, XCircle } from 'lucide-react';
import type { LiveBookingHold } from '../../services/bookingService';

interface ActiveHoldViewProps {
  hold: LiveBookingHold;
  releasing: boolean;
  onRelease: () => void;
  onExpired: () => void;
}

function remainingSeconds(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}

export const ActiveHoldView: React.FC<ActiveHoldViewProps> = ({
  hold, releasing, onRelease, onExpired,
}) => {
  // This countdown is display-only. Server expiry and slot claims are authoritative.
  const [seconds, setSeconds] = useState(() => remainingSeconds(hold.expires_at));
  const expiryNotifiedFor = useRef<string | null>(null);

  useEffect(() => {
    expiryNotifiedFor.current = null;
    const tick = () => {
      const next = remainingSeconds(hold.expires_at);
      setSeconds(next);
      if (next <= 0 && expiryNotifiedFor.current !== hold.id) {
        expiryNotifiedFor.current = hold.id;
        onExpired();
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [hold.id, hold.expires_at, onExpired]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainder = String(seconds % 60).padStart(2, '0');
  const start = new Date(hold.starts_at);
  const end = new Date(hold.ends_at);
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila', weekday: 'short',
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(start);
  const displayTime = (value: Date) => new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(value);
  const duration = Math.max(1,
    Math.round((new Date(hold.expires_at).getTime() - new Date(hold.created_at).getTime()) / 1000));
  const progress = Math.max(0, Math.min(100, seconds / duration * 100));

  return (
    <section aria-label="Active court hold"
      className="bg-white dark:bg-[#0E172A] border border-amber-300/80 dark:border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Temporary Hold Active
            </div>
            <h2 className="font-display font-bold text-xl text-neutral-900 dark:text-white">
              {hold.court_name}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Time remaining</div>
            <strong className="text-xl font-mono text-amber-700 dark:text-amber-300">
              {minutes}:{remainder}
            </strong>
          </div>
        </div>
      </div>

      <div className="h-2 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#84CC16] transition-all duration-1000" style={{ width: progress + '%' }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5 text-sm">
        <div><span className="block text-xs text-neutral-400">Court</span><strong>{hold.court_name}</strong></div>
        <div><span className="block text-xs text-neutral-400">Date</span><strong>{date}</strong></div>
        <div><span className="block text-xs text-neutral-400">Session</span>
          <strong>{displayTime(start)} – {displayTime(end)}</strong></div>
        <div><span className="block text-xs text-neutral-400">Total (PHP)</span>
          <strong>₱{hold.total_price_php.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></div>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        These hours are temporarily held in the booking system. This is not a confirmed
        reservation and no payment has been taken.
      </p>

      <button type="button" disabled={releasing || seconds <= 0} onClick={onRelease}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-50">
        <XCircle className="w-4 h-4" />
        {releasing ? 'Releasing…' : 'Release Hold'}
      </button>

      {seconds <= 0 && (
        <p role="status" className="text-xs text-amber-700 dark:text-amber-300">
          Hold time has ended. Refreshing availability…
        </p>
      )}
    </section>
  );
};
