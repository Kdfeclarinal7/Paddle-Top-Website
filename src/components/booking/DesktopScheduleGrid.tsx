import React from 'react';
import type { CourtId } from '../../types';
import type { CourtSchedule } from '../../types/booking';
import { parseTimeToMinutes } from '../../services/bookingService';
import { Check, Clock, Lock, Plus, Info } from 'lucide-react';

interface DesktopScheduleGridProps {
  schedules: CourtSchedule[];
  selectedCourtId: CourtId;
  selectedTimes: string[];
  onSelectSlot: (courtId: CourtId, time: string) => void;
  onSelectCourtTab: (courtId: CourtId) => void;
  notice?: string | null;
}

export const DesktopScheduleGrid: React.FC<DesktopScheduleGridProps> = ({
  schedules,
  selectedCourtId,
  selectedTimes,
  onSelectSlot,
  onSelectCourtTab,
  notice,
}) => {
  const periods = [
    { key: 'morning', label: 'Morning (6:00 AM – 12:00 PM)' },
    { key: 'afternoon', label: 'Afternoon (12:00 PM – 5:00 PM)' },
    { key: 'evening', label: 'Evening (5:00 PM – 11:00 PM)' },
  ];

  // Calculate adjacent minutes if there is an active selection
  const sortedSelectedMinutes = [...selectedTimes]
    .map(parseTimeToMinutes)
    .sort((a, b) => a - b);
  const earliestMins = sortedSelectedMinutes[0] ?? null;
  const latestMins = sortedSelectedMinutes[sortedSelectedMinutes.length - 1] ?? null;

  return (
    <div className="space-y-4">
      {/* Non-blocking Notice Banner (if interior slot was clicked) */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-[#84CC16]/10 border border-[#84CC16]/30 text-xs text-[#2A4408] dark:text-[#BEF264] flex items-center gap-2.5 animate-in fade-in">
          <Info className="w-4 h-4 text-[#84CC16] shrink-0" />
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {/* Court Filter Tabs, Helper Hint & Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-[#0A1120] rounded-xl border border-neutral-200/80 dark:border-white/10">
            {schedules.map((court) => {
              const isTabActive = court.courtId === selectedCourtId;
              return (
                <button
                  key={court.courtId}
                  type="button"
                  onClick={() => onSelectCourtTab(court.courtId)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    isTabActive
                      ? 'bg-white dark:bg-[#14223C] text-[#3F6212] dark:text-[#A3E635] shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {court.courtName}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-neutral-500 dark:text-neutral-400 italic">
            Select one or more consecutive 1-hour blocks.
          </span>
        </div>

        {/* Visual Legend (Color + Symbol + Text) */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0E172A]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#84CC16] text-[#0A1120] flex items-center justify-center text-[9px] font-extrabold">✓</span>
            <span className="font-semibold text-[#3F6212] dark:text-[#A3E635]">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500/20 border border-amber-500/40 text-amber-600" />
            <span>Held (10m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-neutral-200 dark:bg-white/10" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Synchronized 4-Court Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0E172A] shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-[#0A1120] border-b border-neutral-200 dark:border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <th className="py-3 px-4 w-32">Hour Block</th>
              {schedules.map((court) => {
                const isSelectedCourt = court.courtId === selectedCourtId;
                return (
                  <th
                    key={court.courtId}
                    className={`py-3 px-4 ${
                      isSelectedCourt
                        ? 'text-[#3F6212] dark:text-[#A3E635] bg-[#84CC16]/5 dark:bg-[#84CC16]/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{court.courtName}</span>
                      {isSelectedCourt && (
                        <span className="text-[10px] font-sans font-semibold tracking-normal text-[#3F6212] dark:text-[#A3E635] bg-[#84CC16]/15 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 dark:divide-white/5 text-sm">
            {periods.map((period) => {
              const periodSlots = schedules[0]?.slots.filter((s) => s.period === period.key) || [];

              return (
                <React.Fragment key={period.key}>
                  {/* Period Header Row */}
                  <tr className="bg-neutral-50/70 dark:bg-white/[0.02]">
                    <td
                      colSpan={5}
                      className="py-2 px-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider bg-neutral-100/50 dark:bg-[#070D18]/50"
                    >
                      {period.label}
                    </td>
                  </tr>

                  {/* 1-Hour Slot Rows */}
                  {periodSlots.map((slotDef) => {
                    const timeKey = slotDef.time;
                    const slotMins = slotDef.minutesFromMidnight;

                    return (
                      <tr key={timeKey} className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.01] transition-colors">
                        {/* Time Label Column (Displays full 1-hour block) */}
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                          {slotDef.displayHourRange}
                        </td>

                        {/* Court Columns */}
                        {schedules.map((court) => {
                          const slot = court.slots.find((s) => s.time === timeKey);
                          if (!slot) return <td key={court.courtId} />;

                          const isCourtActive = court.courtId === selectedCourtId;
                          const isSelected = isCourtActive && selectedTimes.includes(slot.time);

                          // Check if this slot is immediately adjacent to current contiguous selection on this court
                          const isAdjacent =
                            isCourtActive &&
                            !isSelected &&
                            slot.status === 'available' &&
                            earliestMins !== null &&
                            (slotMins === earliestMins - 60 || slotMins === latestMins! + 60);

                          if (slot.status === 'booked') {
                            return (
                              <td
                                key={court.courtId}
                                className={`p-2 ${isCourtActive ? 'bg-[#84CC16]/[0.02]' : ''}`}
                              >
                                <div className="py-2 px-2.5 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 text-neutral-400 dark:text-neutral-500 text-xs flex items-center justify-between cursor-not-allowed select-none">
                                  <span>Booked</span>
                                  <Lock className="w-3 h-3 opacity-60" />
                                </div>
                              </td>
                            );
                          }

                          if (slot.status === 'held') {
                            return (
                              <td
                                key={court.courtId}
                                className={`p-2 ${isCourtActive ? 'bg-[#84CC16]/[0.02]' : ''}`}
                              >
                                <div className="py-2 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between cursor-not-allowed select-none">
                                  <span>Held (10m)</span>
                                  <Clock className="w-3 h-3 opacity-80" />
                                </div>
                              </td>
                            );
                          }

                          // Available 1-hour block
                          return (
                            <td
                              key={court.courtId}
                              className={`p-2 ${isCourtActive ? 'bg-[#84CC16]/[0.02]' : ''}`}
                            >
                              <button
                                type="button"
                                onClick={() => onSelectSlot(court.courtId, slot.time)}
                                title={
                                  isSelected
                                    ? 'Click to remove this hour'
                                    : isAdjacent
                                    ? 'Click to extend reservation by 1 hour'
                                    : 'Click to select this 1-hour block'
                                }
                                className={`w-full py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#84CC16] text-[#0A1120] border-[#84CC16] shadow-xs'
                                    : isAdjacent
                                    ? 'bg-[#84CC16]/10 text-[#3F6212] dark:text-[#A3E635] border-dashed border-[#84CC16] hover:bg-[#84CC16]/20'
                                    : 'bg-white dark:bg-[#131F36] text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-white/10 hover:border-[#84CC16] hover:text-[#3F6212] dark:hover:border-[#84CC16] dark:hover:text-[#A3E635]'
                                }`}
                              >
                                <span>{isSelected ? 'Selected' : isAdjacent ? '+ Extend' : 'Available'}</span>
                                <span className={`text-[11px] font-mono ${isSelected ? 'text-[#0A1120]' : 'text-neutral-400 dark:text-neutral-400'}`}>
                                  {isSelected ? (
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  ) : isAdjacent ? (
                                    <Plus className="w-3 h-3 stroke-[2.5] text-[#84CC16]" />
                                  ) : (
                                    '1 hr'
                                  )}
                                </span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
