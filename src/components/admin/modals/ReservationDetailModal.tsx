import React, { useState } from 'react';
import { CircleCheckBig, Clock, TriangleAlert, X } from 'lucide-react';
import { AdminReservation } from '../../../types/admin';
import { adminService, formatCurrencyPHP } from '../../../services/adminService';
import { ExtendSessionModal } from './ExtendSessionModal';

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  reservation: AdminReservation | null;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  reservation
}) => {
  const [showExtend, setShowExtend] = useState<boolean>(false);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);

  if (!isOpen || !reservation) return null;

  const handleStatusUpdate = (status: AdminReservation['status']) => {
    adminService.updateReservationStatus(reservation.id, status);
    onRefresh();
    onClose();
  };

  const getStatusBadge = (status: AdminReservation['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#84CC16]/20 text-[#65A30D] dark:text-[#A3E635] border border-[#84CC16]/40">
            Active Now
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
            Completed
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            No-Show
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            Cancelled
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-lg bg-white dark:bg-[#0B1528] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden my-8">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50/50 dark:bg-white/[0.02]">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-mono">
                  {reservation.referenceCode}
                </h3>
                {getStatusBadge(reservation.status)}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {reservation.courtName} · {reservation.date} · {reservation.displayTimeWindow}
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

          <div className="p-6 space-y-5">
            {/* Player Info Box */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  Player / Lead
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white block mt-0.5">
                  {reservation.customerName}
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 block">
                  {reservation.customerPhone || 'No phone provided'}
                </span>
                {reservation.customerEmail && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-500 block truncate">
                    {reservation.customerEmail}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  Payment & Type
                </span>
                <span className="text-sm font-mono font-bold text-[#65A30D] dark:text-[#A3E635] block mt-0.5">
                  {formatCurrencyPHP(reservation.amountPaidPHP)} ({reservation.paymentStatus})
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 block">
                  Method: {reservation.paymentMethod}
                </span>
                <span className="text-xs text-neutral-500 block">
                  Channel: {reservation.playerType === 'walk-in' ? 'Walk-In Counter' : 'Online Booking'}
                </span>
              </div>
            </div>

            {/* Notes if any */}
            {reservation.notes && (
              <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-white/[0.04] text-xs text-neutral-700 dark:text-neutral-300">
                <span className="font-semibold block mb-0.5 text-neutral-500 dark:text-neutral-400">Notes / Requests:</span>
                {reservation.notes}
              </div>
            )}

            {/* Quick Session Controls */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2.5">
                Court Session Management
              </span>

              <div className="grid grid-cols-2 gap-2">
                {reservation.status !== 'active' && reservation.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('active')}
                    className="py-2.5 px-3 rounded-xl bg-[#84CC16]/10 hover:bg-[#84CC16]/20 border border-[#84CC16]/30 text-xs font-bold text-[#65A30D] dark:text-[#A3E635] transition-all flex items-center justify-center gap-1.5"
                  >
                    <CircleCheckBig size={14} strokeWidth={1.75} />
                    <span>Check In / Mark Active</span>
                  </button>
                )}

                {reservation.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('completed')}
                    className="py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CircleCheckBig size={14} strokeWidth={1.75} />
                    <span>Mark Completed</span>
                  </button>
                )}

                {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => setShowExtend(true)}
                    className="py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Clock size={14} strokeWidth={1.75} />
                    <span>Extend Session (+1h)</span>
                  </button>
                )}

                {reservation.status !== 'no_show' && reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('no_show')}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-400 transition-all flex items-center justify-center gap-1.5"
                  >
                    <TriangleAlert size={14} strokeWidth={1.75} />
                    <span>Mark No-Show</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cancel Zone */}
            {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
              <div className="pt-2 border-t border-neutral-200 dark:border-white/5">
                {confirmCancel ? (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2">
                    <p className="text-xs text-red-700 dark:text-red-300 font-semibold">
                      Confirm cancellation of {reservation.referenceCode}?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate('cancelled')}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                      >
                        Yes, Cancel Booking
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmCancel(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-neutral-600 dark:text-neutral-400"
                      >
                        Keep Booking
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    Cancel this reservation...
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Extend Modal */}
      {showExtend && (
        <ExtendSessionModal
          isOpen={showExtend}
          onClose={() => setShowExtend(false)}
          onSuccess={() => {
            setShowExtend(false);
            onRefresh();
            onClose();
          }}
          reservationId={reservation.id}
        />
      )}
    </>
  );
};
