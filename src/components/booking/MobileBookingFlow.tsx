import React, { useState } from 'react';
import type { CourtId } from '../../types';
import type { CourtSchedule } from '../../types/booking';
import { parseTimeToMinutes } from '../../services/bookingService';
import { Check, Clock, Lock, Plus, Info } from 'lucide-react';

interface MobileBookingFlowProps {
  schedules: CourtSchedule[];
  selectedCourtId: CourtId;
  selectedTimes: string[];
  onSelectSlot: (courtId: CourtId, time: string) => void;
  onSelectCourt: (courtId: CourtId) => void;
  notice?: string | null;
}

export const MobileBookingFlow: React.FC<MobileBookingFlowProps> = ({
  schedules,
  selectedCourtId,
  selectedTimes,
  onSelectSlot,
  onSelectCourt,
  notice,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const currentCourtSchedule = schedules.find((c) => c.courtId === selectedCourtId) || schedules[0];

  const filteredSlots = currentCourtSchedule?.slots.filter((slot) => {
    if (selectedPeriod === 'all') return true;
    return slot.period === selectedPeriod;
  }) || [];

  // Determine contiguous endpoints
  const sortedSelectedMinutes = [...selectedTimes]
    .map(parseTimeToMinutes)
    .sort((a, b) => a - b);
  const earliestMins = sortedSelectedMinutes[0] ?? null;
  const latestMins = sortedSelectedMinutes[sortedSelectedMinutes.length - 1] ?? null;

  return (
    <div className="space-y-5">
      {/* Notice Banner */}
      {notice && (
        <div className="p-3 rounded-xl bg-[#84CC16]/10 border border-[#84CC16]/30 text-xs text-[#2A4408] dark:text-[#BEF264] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#84CC16] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Step 1: Court Selection Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Step 1 · Choose Court
        </label>
        <div className="grid grid-cols-2 gap-2">
          {schedules.map((court) => {
            const isSelected = court.courtId === selectedCourtId;
            return (
              <button
                key={court.courtId}
                type="button"
                onClick={() => onSelectCourt(court.courtId)}
                className={`min-h-[48px] p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#84CC16] bg-[#84CC16]/15 text-[#2A4408] dark:text-[#BEF264] font-bold shadow-xs'
                    : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0E172A] text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className="text-sm font-display">{court.courtName}</div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-[#84CC16] text-[#0A1120] flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Time Period Filter Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Step 2 · Hourly Blocks
          </label>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
            Tap adjacent hours to extend
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 dark:bg-[#0A1120] rounded-xl border border-neutral-200/80 dark:border-white/10 text-xs">
          {[
            { id: 'all', label: 'All Day' },
            { id: 'morning', label: 'Morning' },
            { id: 'afternoon', label: 'Afternoon' },
            { id: 'evening', label: 'Evening' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedPeriod(tab.id as any)}
              className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center cursor-pointer ${
                selectedPeriod === tab.id
                  ? 'bg-white dark:bg-[#14223C] text-[#3F6212] dark:text-[#A3E635] font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Hourly Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredSlots.map((slot) => {
          const isSelected = selectedTimes.includes(slot.time);
          const slotMins = slot.minutesFromMidnight;
          const isAdjacent =
            !isSelected &&
            slot.status === 'available' &&
            earliestMins !== null &&
            (slotMins === earliestMins - 60 || slotMins === latestMins! + 60);

          if (slot.status === 'booked') {
            return (
              <div
                key={slot.time}
                className="min-h-[52px] p-3 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 text-neutral-400 dark:text-neutral-500 flex items-center justify-between select-none"
              >
                <div>
                  <div className="text-xs font-mono font-semibold">{slot.displayHourRange}</div>
                  <span className="text-[10px] text-neutral-400">Booked</span>
                </div>
                <Lock className="w-4 h-4 opacity-50" />
              </div>
            );
          }

          if (slot.status === 'held') {
            return (
              <div
                key={slot.time}
                className="min-h-[52px] p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-between select-none"
              >
                <div>
                  <div className="text-xs font-mono font-semibold">{slot.displayHourRange}</div>
                  <span className="text-[10px]">Held (10m temporary hold)</span>
                </div>
                <Clock className="w-4 h-4 opacity-80" />
              </div>
            );
          }

          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => onSelectSlot(selectedCourtId, slot.time)}
              className={`min-h-[54px] p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-[#84CC16] bg-[#84CC16] text-[#0A1120] shadow-sm'
                  : isAdjacent
                  ? 'border-dashed border-[#84CC16] bg-[#84CC16]/10 text-[#2A4408] dark:text-[#BEF264]'
                  : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0E172A] text-neutral-800 dark:text-neutral-100 hover:border-[#84CC16]'
              }`}
            >
              <div>
                <div className="text-xs font-mono font-bold">
                  {slot.displayHourRange}
                </div>
                <div className={`text-[10px] ${isSelected ? 'text-[#0A1120]/80' : isAdjacent ? 'text-[#4D7C0F] dark:text-[#A3E635]' : 'text-neutral-400'}`}>
                  {isSelected ? 'Selected in reservation' : isAdjacent ? '+ Tap to extend session' : '1-Hour Block Available'}
                </div>
              </div>

              <div className="shrink-0 ml-2">
                {isSelected ? (
                  <span className="w-6 h-6 rounded-full bg-[#0A1120] text-[#84CC16] flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                ) : isAdjacent ? (
                  <span className="w-6 h-6 rounded-full bg-[#84CC16] text-[#0A1120] flex items-center justify-center text-xs">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-neutral-400">Open</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
