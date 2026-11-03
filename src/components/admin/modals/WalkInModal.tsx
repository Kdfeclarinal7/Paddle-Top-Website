import React, { useState } from 'react';
import { UserPlus, TriangleAlert, X } from 'lucide-react';
import { CourtId } from '../../../types';
import { AdminPaymentMethod } from '../../../types/admin';
import { adminService, formatCurrencyPHP } from '../../../services/adminService';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCourtId?: CourtId;
}

export const WalkInModal: React.FC<WalkInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCourtId = 'court-1'
}) => {
  const [courtId, setCourtId] = useState<CourtId>(initialCourtId);
  const [hours, setHours] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<AdminPaymentMethod>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto calculate current whole hour
  const now = new Date();
  const currentHour = now.getHours();
  const clampedHour = Math.max(6, Math.min(22, currentHour));
  const [startTime, setStartTime] = useState<string>(`${String(clampedHour).padStart(2, '0')}:00`);

  if (!isOpen) return null;

  const hourlyRate = adminService.getSettings().courtHourlyRatePHP;
  const totalAmount = hourlyRate * hours;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Please enter player or team leader name.');
      return;
    }

    const res = adminService.addWalkIn({
      courtId,
      hours,
      startTime,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || 'Walk-in Desk',
      paymentMethod,
      notes: notes.trim()
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to register walk-in.');
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0B1528] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50/50 dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus size={18} strokeWidth={1.75} className="text-[#84CC16]" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Register Court Walk-In
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Instant player check-in & counter payment collection
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <TriangleAlert size={16} strokeWidth={1.75} className="text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Court Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Select Court
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['court-1', 'court-2', 'court-3', 'court-4'] as CourtId[]).map((cId, idx) => {
                const isSelected = courtId === cId;
                return (
                  <button
                    type="button"
                    key={cId}
                    onClick={() => setCourtId(cId)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#84CC16]/10 border-[#84CC16] text-[#65A30D] dark:text-[#A3E635] shadow-sm'
                        : 'border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-white/20'
                    }`}
                  >
                    Court {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
              >
                {Array.from({ length: 17 }).map((_, i) => {
                  const h = i + 6;
                  const val = `${String(h).padStart(2, '0')}:00`;
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  const disp = `${h % 12 === 0 ? 12 : h % 12}:00 ${ampm}`;
                  return (
                    <option key={val} value={val}>
                      {disp}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((h) => (
                  <button
                    type="button"
                    key={h}
                    onClick={() => setHours(h)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      hours === h
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-sm'
                        : 'border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-white/20'
                    }`}
                  >
                    {h} hr{h > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Player Name & Contact */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Primary Player Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Marco Valenzuela"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Contact Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 0917-123-4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Payment Method (Demo Options)
              </label>
              <span className="text-[10px] text-neutral-400">Desk record only</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CASH', label: 'Cash Counter' },
                { id: 'GCASH', label: 'GCash QR' },
                { id: 'CARD', label: 'POS Terminal' }
              ].map((p) => {
                const isSelected = paymentMethod === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id as AdminPaymentMethod)}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all ${
                      isSelected
                        ? 'border-[#84CC16] bg-[#84CC16]/10 text-neutral-900 dark:text-white font-semibold'
                        : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-white/20'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total & Summary Box */}
          <div className="p-4 rounded-xl bg-neutral-100 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">Total Due & Recorded</span>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-300">
                {hours} hour{hours > 1 ? 's' : ''} × {formatCurrencyPHP(hourlyRate)}/hr
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-mono font-extrabold text-[#65A30D] dark:text-[#A3E635]">
                {formatCurrencyPHP(totalAmount)}
              </span>
            </div>
          </div>

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
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Confirm & Check In Walk-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
