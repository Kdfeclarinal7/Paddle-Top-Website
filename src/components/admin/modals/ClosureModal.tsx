import React, { useState, useMemo } from 'react';
import { Ban, TriangleAlert, CircleCheckBig, X } from 'lucide-react';
import { CourtId } from '../../../types';
import { ClosureScope, ClosureReason, CourtClosure, AdminReservation } from '../../../types/admin';
import { adminService, getTodayDateString, formatTimeDisplay } from '../../../services/adminService';

interface ClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (closure: CourtClosure, affectedCount: number) => void;
  initialCourtId?: CourtId;
}

export const ClosureModal: React.FC<ClosureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCourtId = 'court-1'
}) => {
  const [scope, setScope] = useState<ClosureScope>('single_court');
  const [courtId, setCourtId] = useState<CourtId>(initialCourtId);
  const [reason, setReason] = useState<ClosureReason>('Maintenance');
  const [customNote, setCustomNote] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(getTodayDateString());
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endDate, setEndDate] = useState<string>(getTodayDateString());
  const [endTime, setEndTime] = useState<string>('18:00');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute affected reservations dynamically in real-time
  const affectedReservations = useMemo<AdminReservation[]>(() => {
    if (!startDate || !endDate || !startTime || !endTime) return [];
    const courtName = scope === 'all_courts' ? 'All Courts (Facility)' : `Court ${courtId.replace('court-', '')}`;
    const hypothetical: CourtClosure = {
      id: 'preview',
      scope,
      courtId: scope === 'single_court' ? courtId : undefined,
      courtName,
      reason,
      customNote,
      startDate,
      startTime,
      endDate,
      endTime,
      active: true,
      createdAt: ''
    };
    return adminService.findReservationsOverlappingClosure(hypothetical);
  }, [scope, courtId, reason, customNote, startDate, startTime, endDate, endTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const startH = parseInt(startTime.split(':')[0], 10);
    const endH = parseInt(endTime.split(':')[0], 10);

    if (startDate === endDate && startH >= endH) {
      setErrorMsg('End time must be later than start time.');
      return;
    }

    const courtName = scope === 'all_courts' ? 'All Courts (Facility)' : `Court ${courtId.replace('court-', '')}`;

    const res = adminService.addClosure({
      scope,
      courtId: scope === 'single_court' ? courtId : undefined,
      courtName,
      reason,
      customNote: customNote.trim() || undefined,
      startDate,
      startTime,
      endDate,
      endTime
    });

    onSuccess(res.closure, res.affectedReservations.length);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0B1528] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50/50 dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <Ban size={18} strokeWidth={1.75} className="text-amber-500" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Add Court Closure / Maintenance
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Temporarily take courts out of public and walk-in rotation
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Closure Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('single_court')}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  scope === 'single_court'
                    ? 'bg-[#84CC16]/10 border-[#84CC16] text-[#65A30D] dark:text-[#A3E635]'
                    : 'border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                Specific Court
              </button>
              <button
                type="button"
                onClick={() => setScope('all_courts')}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  scope === 'all_courts'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 font-bold'
                    : 'border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                Entire Facility (All 4 Courts)
              </button>
            </div>
          </div>

          {/* Court Picker (if single court) */}
          {scope === 'single_court' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Select Court
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['court-1', 'court-2', 'court-3', 'court-4'] as CourtId[]).map((cId, idx) => (
                  <button
                    type="button"
                    key={cId}
                    onClick={() => setCourtId(cId)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      courtId === cId
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-sm'
                        : 'border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Court {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Reason for Closure
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ClosureReason)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            >
              <option value="Maintenance">Court Surface / Net Maintenance</option>
              <option value="Rain / Weather">Rain / Wet Weather Notice</option>
              <option value="Private Event">Private Tournament / Event Booking</option>
              <option value="Staff / Cleaning">Deep Sanitation & Cleaning</option>
              <option value="Other">Other Operational Reason</option>
            </select>
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Time Window
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-1/2 px-2 py-2 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-xs text-neutral-900 dark:text-white"
                >
                  {Array.from({ length: 17 }).map((_, i) => {
                    const h = i + 6;
                    const val = `${String(h).padStart(2, '0')}:00`;
                    return <option key={val} value={val}>{formatTimeDisplay(val)}</option>;
                  })}
                </select>
                <span className="text-xs text-neutral-400">to</span>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-1/2 px-2 py-2 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-xs text-neutral-900 dark:text-white"
                >
                  {Array.from({ length: 17 }).map((_, i) => {
                    const h = i + 7;
                    const val = `${String(h).padStart(2, '0')}:00`;
                    return <option key={val} value={val}>{formatTimeDisplay(val)}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              {reason === 'Other' ? 'Specific Operational Reason (Custom)' : 'Operator / Public Note (Optional)'}
            </label>
            <input
              type="text"
              placeholder={reason === 'Other' ? 'Describe the specific operational reason...' : 'e.g. Resurfacing line repaint, estimated 3 hours'}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>

          {/* Overlap Warning Box */}
          {affectedReservations.length > 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                <TriangleAlert size={16} strokeWidth={1.75} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Attention: {affectedReservations.length} Active Booking{affectedReservations.length > 1 ? 's' : ''} Overlap With This Closure</span>
              </div>
              <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 pl-5 list-disc">
                {affectedReservations.map(r => (
                  <li key={r.id}>
                    <span className="font-semibold">{r.customerName}</span> ({r.referenceCode}) · {r.courtName} at {r.displayTimeWindow}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-600 dark:text-amber-400/80 italic pt-1">
                You can still proceed with closure, but you may need to reschedule or contact these players.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CircleCheckBig size={15} strokeWidth={1.75} className="text-emerald-500 shrink-0" />
              <span>No existing bookings overlap with this scheduled window.</span>
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
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Confirm & Apply Closure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
