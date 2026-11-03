import React, { useState } from 'react';
import { UserPlus, Ban, RefreshCw, Plus, CircleCheckBig } from 'lucide-react';
import { CourtId } from '../../../types';
import { CourtStatusCardData, AdminReservation } from '../../../types/admin';
import { adminService, formatCurrencyPHP, formatTimeDisplay } from '../../../services/adminService';
import { WalkInModal } from '../modals/WalkInModal';
import { ExtendSessionModal } from '../modals/ExtendSessionModal';
import { ClosureModal } from '../modals/ClosureModal';
import { ReservationDetailModal } from '../modals/ReservationDetailModal';

interface AdminTodayViewProps {
  onRefreshAll: () => void;
}

export const AdminTodayView: React.FC<AdminTodayViewProps> = ({ onRefreshAll }) => {
  const [courts, setCourts] = useState<CourtStatusCardData[]>(() => adminService.getCourtsStatusToday());
  const [scheduleData, setScheduleData] = useState(() => adminService.getHourlyScheduleToday());

  // Modal states
  const [walkInCourtId, setWalkInCourtId] = useState<CourtId | null>(null);
  const [extendResId, setExtendResId] = useState<string | null>(null);
  const [closureCourtId, setClosureCourtId] = useState<CourtId | null>(null);
  const [selectedRes, setSelectedRes] = useState<AdminReservation | null>(null);

  const refresh = () => {
    setCourts(adminService.getCourtsStatusToday());
    setScheduleData(adminService.getHourlyScheduleToday());
    onRefreshAll();
  };

  const handleReopen = (closureId: string) => {
    adminService.reopenCourt(closureId);
    refresh();
  };

  const handleQuickComplete = (reservationId: string) => {
    adminService.updateReservationStatus(reservationId, 'completed');
    refresh();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16] animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
              Today's Court Operations
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400">
              4 Courts Operating
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Current demo court occupancy, session timelines, and walk-in registration (updates immediately in frontend)
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setWalkInCourtId('court-1')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <UserPlus size={16} strokeWidth={2} />
            <span>Register Walk-In</span>
          </button>
          <button
            type="button"
            onClick={() => setClosureCourtId('court-1')}
            className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
          >
            <Ban size={16} strokeWidth={1.75} />
            <span>Set Closure</span>
          </button>
          <button
            type="button"
            onClick={refresh}
            title="Refresh status"
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 dark:text-neutral-400 transition-colors flex items-center justify-center"
          >
            <RefreshCw size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* 4 Court Real-Time Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {courts.map((court) => {
          const isClosed = court.status === 'closed';
          const isActive = court.status === 'active';
          const isEndingSoon = court.status === 'ending_soon';
          const isAvailable = court.status === 'available';

          return (
            <div
              key={court.courtId}
              className={`rounded-2xl border transition-all relative flex flex-col justify-between overflow-hidden ${
                isActive
                  ? 'bg-white dark:bg-[#0B1528] border-[#84CC16]/60 dark:border-[#84CC16]/40 shadow-md ring-1 ring-[#84CC16]/30'
                  : isEndingSoon
                  ? 'bg-amber-50/50 dark:bg-[#14120D] border-amber-400 dark:border-amber-500/50 shadow-md'
                  : isClosed
                  ? 'bg-neutral-100/60 dark:bg-[#0A0D14] border-neutral-300 dark:border-white/5 opacity-85'
                  : 'bg-white dark:bg-[#0A1220] border-neutral-200 dark:border-white/10 shadow-sm'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-neutral-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                    PADDLE TOP
                  </span>
                  {/* Status Badge */}
                  {isActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-[#84CC16]/20 text-[#4D7C0F] dark:text-[#A3E635] border border-[#84CC16]/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] animate-ping" />
                      ACTIVE
                    </span>
                  )}
                  {isEndingSoon && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse">
                      ENDING SOON
                    </span>
                  )}
                  {isAvailable && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      AVAILABLE
                    </span>
                  )}
                  {isClosed && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-400">
                      CLOSED
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white mt-2">
                  {court.courtName}
                </h3>
              </div>

              {/* Card Content Body */}
              <div className="p-5 flex-1 space-y-4">
                {/* Case 1: Active or Ending Soon */}
                {(isActive || isEndingSoon) && court.currentSession && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                        Current Occupant
                      </span>
                      <div className="font-bold text-base text-neutral-900 dark:text-white mt-0.5 truncate">
                        {court.currentSession.customerName}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>{court.currentSession.displayTimeWindow}</span>
                        <span>·</span>
                        <span className="capitalize">{court.currentSession.type}</span>
                      </div>
                    </div>

                    {/* Countdown Progress */}
                    <div className="p-3 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">Time Remaining:</span>
                        <span className={`font-mono font-bold ${isEndingSoon ? 'text-amber-600 dark:text-amber-400 text-sm' : 'text-[#4D7C0F] dark:text-[#A3E635]'}`}>
                          ~{court.currentSession.minutesRemaining} mins
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isEndingSoon ? 'bg-amber-500' : 'bg-[#84CC16]'}`}
                          style={{
                            width: `${Math.min(100, Math.max(10, (court.currentSession.minutesRemaining / (court.currentSession.durationHours * 60)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Case 2: Available */}
                {isAvailable && (
                  <div className="py-2 space-y-2">
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold block mb-0.5">Court is Free</span>
                      Ready for immediate player entry or walk-in check-in.
                    </div>
                    {court.gapMinutes !== undefined && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        Free window: <span className="font-mono font-medium text-neutral-700 dark:text-neutral-200">{Math.floor(court.gapMinutes / 60)}h {court.gapMinutes % 60}m</span> until next booking
                      </div>
                    )}
                  </div>
                )}

                {/* Case 3: Closed */}
                {isClosed && court.activeClosure && (
                  <div className="py-2 space-y-2">
                    <div className="p-3.5 rounded-xl bg-neutral-200/60 dark:bg-white/[0.04] border border-neutral-300 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
                      <span className="font-bold block text-neutral-900 dark:text-white">
                        Reason: {court.activeClosure.reason}
                      </span>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {court.activeClosure.customNote || 'Scheduled maintenance window'}
                      </p>
                      <div className="pt-1 text-[11px] font-mono text-neutral-400">
                        {formatTimeDisplay(court.activeClosure.startTime)} – {formatTimeDisplay(court.activeClosure.endTime)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Booking Info (if any) */}
                {court.nextSession && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-white/5 text-xs">
                    <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase block">
                      Up Next Today
                    </span>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200 truncate mt-0.5">
                      {court.nextSession.customerName}
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                      {court.nextSession.displayTimeWindow}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-neutral-50 dark:bg-white/[0.02] border-t border-neutral-100 dark:border-white/5 flex items-center gap-2">
                {isAvailable && (
                  <button
                    type="button"
                    onClick={() => setWalkInCourtId(court.courtId)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-neutral-950 font-bold text-xs shadow-sm transition-all"
                  >
                    Start Walk-In
                  </button>
                )}

                {(isActive || isEndingSoon) && court.currentSession && (
                  <>
                    <button
                      type="button"
                      onClick={() => setExtendResId(court.currentSession!.reservationId)}
                      className="flex-1 py-2 px-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs transition-all hover:opacity-90 flex items-center justify-center gap-1"
                    >
                      <Plus size={14} strokeWidth={2} />
                      <span>Extend</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickComplete(court.currentSession!.reservationId)}
                      className="px-2.5 py-2 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-200/50 dark:hover:bg-white/5 text-xs text-neutral-700 dark:text-neutral-300 font-semibold flex items-center justify-center gap-1"
                      title="Mark session completed"
                    >
                      <CircleCheckBig size={14} strokeWidth={2} />
                      <span>Done</span>
                    </button>
                  </>
                )}

                {isClosed && court.activeClosure && (
                  <button
                    type="button"
                    onClick={() => handleReopen(court.activeClosure!.id)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CircleCheckBig size={14} strokeWidth={2} />
                    <span>Reopen Court Now</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Master Hourly Schedule View (06:00 to 23:00) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-white/5 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              Today's Master Court Timeline
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Hourly layout from 06:00 to 23:00 across all 4 courts
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Online Booking
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <span className="w-2.5 h-2.5 rounded bg-[#84CC16]" /> Walk-In
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <span className="w-2.5 h-2.5 rounded bg-neutral-400 dark:bg-neutral-600" /> Closed
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <span className="w-2.5 h-2.5 rounded border border-neutral-300 dark:border-white/20 bg-neutral-50 dark:bg-transparent" /> Free
            </span>
          </div>
        </div>

        {/* Schedule Grid Table */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px] space-y-3">
            {scheduleData.courts.map((court) => (
              <div key={court.courtId} className="flex items-center gap-3">
                <div className="w-24 shrink-0 font-bold text-sm text-neutral-900 dark:text-white">
                  {court.courtName}
                </div>
                <div className="flex-1 grid grid-cols-17 gap-1">
                  {court.blocks.map((block) => {
                    const isWalkIn = block.status === 'walk_in';
                    const isOnline = block.status === 'booked_online';
                    const isClosed = block.status === 'closed';

                    return (
                      <button
                        type="button"
                        key={block.time}
                        onClick={() => {
                          if (block.reservation) {
                            setSelectedRes(block.reservation);
                          } else if (!isClosed) {
                            setWalkInCourtId(court.courtId);
                          }
                        }}
                        className={`group relative h-12 rounded-lg text-[10px] font-mono font-medium p-1 transition-all flex flex-col justify-between overflow-hidden text-left ${
                          isWalkIn
                            ? 'bg-[#84CC16] text-neutral-950 font-bold shadow-sm hover:brightness-105'
                            : isOnline
                            ? 'bg-blue-600 text-white font-bold shadow-sm hover:brightness-110'
                            : isClosed
                            ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/5'
                        }`}
                        title={`${court.courtName} at ${block.displayLabel}: ${
                          block.reservation ? block.reservation.customerName : isClosed ? 'Closed' : 'Available'
                        }`}
                      >
                        <span className="opacity-75 leading-none">
                          {block.time.slice(0, 2)}h
                        </span>
                        <span className="truncate leading-none font-sans text-[10px]">
                          {block.reservation
                            ? block.reservation.customerName.split(' ')[0]
                            : isClosed
                            ? 'Closed'
                            : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {walkInCourtId && (
        <WalkInModal
          isOpen={Boolean(walkInCourtId)}
          onClose={() => setWalkInCourtId(null)}
          onSuccess={refresh}
          initialCourtId={walkInCourtId}
        />
      )}

      {extendResId && (
        <ExtendSessionModal
          isOpen={Boolean(extendResId)}
          onClose={() => setExtendResId(null)}
          onSuccess={refresh}
          reservationId={extendResId}
        />
      )}

      {closureCourtId && (
        <ClosureModal
          isOpen={Boolean(closureCourtId)}
          onClose={() => setClosureCourtId(null)}
          onSuccess={() => {
            setClosureCourtId(null);
            refresh();
          }}
          initialCourtId={closureCourtId}
        />
      )}

      {selectedRes && (
        <ReservationDetailModal
          isOpen={Boolean(selectedRes)}
          onClose={() => setSelectedRes(null)}
          onRefresh={refresh}
          reservation={selectedRes}
        />
      )}
    </div>
  );
};
