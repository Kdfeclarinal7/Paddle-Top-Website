import React, { useState, useEffect } from 'react';
import { Clock, CircleCheckBig, TriangleAlert, X } from 'lucide-react';
import { AdminPaymentMethod } from '../../../types/admin';
import { adminService, formatCurrencyPHP } from '../../../services/adminService';

interface ExtendSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reservationId: string;
}

export const ExtendSessionModal: React.FC<ExtendSessionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reservationId
}) => {
  const [hoursToAdd, setHoursToAdd] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<AdminPaymentMethod>('CASH');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reservation = adminService.getReservations().find(r => r.id === reservationId);

  // Check availability
  const check = reservation
    ? adminService.checkExtensionAvailability(reservationId, hoursToAdd)
    : { available: false, reason: 'Reservation not found' };

  useEffect(() => {
    setErrorMsg(null);
  }, [hoursToAdd, reservationId]);

  if (!isOpen || !reservation) return null;

  const handleConfirm = () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    const res = adminService.extendSession(reservationId, hoursToAdd, paymentMethod);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to extend session.');
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0B1528] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50/50 dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={18} strokeWidth={1.75} className="text-[#84CC16]" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Extend Court Session
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Add extra playing time to ongoing session
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Current Session Summary */}
          <div className="p-4 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#84CC16] uppercase">
                {reservation.courtName}
              </span>
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                {reservation.referenceCode}
              </span>
            </div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
              {reservation.customerName}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Current slot: <span className="font-mono text-neutral-700 dark:text-neutral-300 font-medium">{reservation.displayTimeWindow}</span> ({reservation.hours} hrs)
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Select Extension Length
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map(h => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setHoursToAdd(h)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                    hoursToAdd === h
                      ? 'bg-[#84CC16]/10 border-[#84CC16] text-[#65A30D] dark:text-[#A3E635]'
                      : 'border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                  }`}
                >
                  +{h} Hour{h > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Check Feedback */}
          {check.available ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CircleCheckBig size={15} strokeWidth={1.75} className="text-emerald-500" />
                <span>Court is Free & Available for Extension</span>
              </div>
              <div>
                New End Time: <span className="font-mono font-bold">{check.nextEndTime}</span>
              </div>
              <div>
                Additional Fee: <span className="font-mono font-bold">{formatCurrencyPHP(check.extraCostPHP || 0)}</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <TriangleAlert size={15} strokeWidth={1.75} className="text-amber-500" />
                <span>Cannot Extend Session</span>
              </div>
              <p className="leading-relaxed">
                {check.reason}
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Payment Method (only if available) */}
          {check.available && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Extension Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CASH', label: '💵 Cash' },
                  { id: 'GCASH', label: '📱 GCash' },
                  { id: 'CARD', label: '💳 Card' }
                ].map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id as AdminPaymentMethod)}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all ${
                      paymentMethod === p.id
                        ? 'border-[#84CC16] bg-[#84CC16]/10 text-neutral-900 dark:text-white font-semibold'
                        : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!check.available || isSubmitting}
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] disabled:opacity-40 disabled:pointer-events-none text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              {isSubmitting ? 'Extending...' : `Confirm Extension (${formatCurrencyPHP(check.extraCostPHP || 0)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
