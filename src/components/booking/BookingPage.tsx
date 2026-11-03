import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { CourtId } from '../../types';
import type { BookingDraft, CourtSchedule } from '../../types/booking';
import {
  fetchCourtAvailability,
  calculatePrice,
  computeConsecutiveWindow,
  handleHourlySlotToggle,
  MOCK_HOURLY_RATE_PHP,
} from '../../services/bookingService';
import { getTodayString, addDays } from '../../utils/dateUtils';
import { DateSelector } from './DateSelector';
import { DesktopScheduleGrid } from './DesktopScheduleGrid';
import { MobileBookingFlow } from './MobileBookingFlow';
import { BookingSummaryCard } from './BookingSummaryCard';
import { AuthGateModal } from './AuthGateModal';
import { useAuth } from '../../context/AuthContext';
import {
  clearPendingBooking, readPendingBooking, savePendingBooking,
} from '../../utils/pendingBooking';
import { BookingLoadingSkeleton } from './BookingLoadingSkeleton';
import { BookingErrorState, BookingEmptyState } from './BookingErrorState';
import { ArrowLeft } from 'lucide-react';

interface BookingPageProps {
  initialCourtId?: CourtId;
  onNavigateHome: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialCourtId = 'court-1',
  onNavigateHome,
}) => {
  const { user, loading: authLoading } = useAuth();
  const persistedSelection = useMemo(readPendingBooking, []);
  const initialCourtApplied = useRef(false);

  // The selection is only UX state; no real hold is created during Phase 2.
  const [selectedDate, setSelectedDate] = useState<string>(persistedSelection?.date ?? getTodayString());
  const [selectedCourtId, setSelectedCourtId] = useState<CourtId>(persistedSelection?.courtId ?? initialCourtId);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(persistedSelection?.selectedTimes ?? []);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Data / Async State
  const [schedules, setSchedules] = useState<CourtSchedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showAuthGate, setShowAuthGate] = useState<boolean>(false);

  // Avoid resetting a restored OAuth/Magic Link draft on first render.
  useEffect(() => {
    if (!initialCourtApplied.current) {
      initialCourtApplied.current = true;
      return;
    }
    setSelectedCourtId(initialCourtId);
    setSelectedTimes([]);
    setSelectionNotice(null);
  }, [initialCourtId]);

  useEffect(() => {
    if (!authLoading && user && readPendingBooking()) {
      clearPendingBooking();
      setShowAuthGate(false);
      setAuthNotice('You’re signed in and your court selection is preserved. Live bookings are not yet enabled.');
    }
  }, [authLoading, user?.id]);

  // Load Availability for selectedDate
  const loadAvailability = useCallback(async (opts?: { forceError?: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCourtAvailability({
        date: selectedDate,
        simulateDelayMs: 250,
        forceError: opts?.forceError,
      });
      setSchedules(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Validate current selection whenever schedules reload
  useEffect(() => {
    if (selectedTimes.length > 0 && schedules.length > 0) {
      const courtSchedule = schedules.find((s) => s.courtId === selectedCourtId);
      if (!courtSchedule) return;

      const stillAvailableTimes = selectedTimes.filter((time) => {
        const slot = courtSchedule.slots.find((s) => s.time === time);
        return slot && slot.status === 'available';
      });

      if (stillAvailableTimes.length !== selectedTimes.length) {
        setSelectedTimes(stillAvailableTimes);
      }
    }
  }, [schedules, selectedCourtId, selectedTimes]);

  // Build current draft selection from selected consecutive times
  const currentDraft: BookingDraft | null = useMemo(() => {
    if (selectedTimes.length === 0) return null;
    const courtSchedule = schedules.find((s) => s.courtId === selectedCourtId);
    const courtName = courtSchedule?.courtName || 'Court 1';
    const { startTime, endTime, displayTimeWindow, totalHours } = computeConsecutiveWindow(selectedTimes);
    const priceEstimate = calculatePrice(totalHours);

    return {
      courtId: selectedCourtId,
      courtName,
      date: selectedDate,
      startTime,
      endTime,
      displayTimeWindow,
      selectedHours: totalHours,
      selectedTimes,
      priceEstimatePhp: priceEstimate,
    };
  }, [selectedCourtId, selectedDate, selectedTimes, schedules]);

  // Slot Selection Handler supporting consecutive hours, endpoint shrinking, and different court switching
  const handleSelectSlot = (courtId: CourtId, time: string) => {
    // 1. If user clicks a different court: replace selection with this new court
    if (courtId !== selectedCourtId) {
      setSelectedCourtId(courtId);
      setSelectedTimes([time]);
      setSelectionNotice(null);
      return;
    }

    // 2. Same court: apply consecutive toggle logic
    const courtSchedule = schedules.find((s) => s.courtId === courtId);
    const availableTimes = courtSchedule
      ? courtSchedule.slots.filter((s) => s.status === 'available').map((s) => s.time)
      : [];

    const { nextTimes, notice } = handleHourlySlotToggle(selectedTimes, time, availableTimes);
    setSelectedTimes(nextTimes);
    setSelectionNotice(notice || null);
  };

  const handleSelectCourtTab = (courtId: CourtId) => {
    setSelectedCourtId(courtId);
    setSelectedTimes([]);
    setSelectionNotice(null);
  };

  const handleContinue = () => {
    if (!currentDraft || authLoading) return;
    if (user) {
      setAuthNotice('You’re signed in. Live bookings are not yet enabled; your selected time remains on screen.');
      return;
    }
    savePendingBooking({
      courtId: currentDraft.courtId,
      date: currentDraft.date,
      selectedTimes: currentDraft.selectedTimes,
    });
    setShowAuthGate(true);
  };

  const isAllFullyBooked = useMemo(() => {
    if (schedules.length === 0) return false;
    return schedules.every((court) => court.slots.every((s) => s.status !== 'available'));
  }, [schedules]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#070D18] text-neutral-900 dark:text-neutral-100 pb-28 sm:pb-24 pt-24 sm:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-white/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">|</span>

            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-white">PADDLE TOP</span>
              <span className="mx-1.5">·</span>
              <span>Single Venue · Exactly 4 Courts</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-neutral-500 font-mono">Asia/Manila (PHT)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16]" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Public Availability Mode</span>
          </div>
        </div>

        {authNotice && (
          <div role="status" className="rounded-xl border border-lime-200 dark:border-lime-800/40 bg-lime-50 dark:bg-lime-950/20 text-lime-900 dark:text-lime-200 px-4 py-3 text-sm">
            {authNotice}
          </div>
        )}

            {/* Page Header */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold tracking-widest text-[#4D7C0F] dark:text-[#A3E635] uppercase">
                Court Availability & Hourly Reservations
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-display">
                Reserve Your Court
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl">
                Browse live open slots across Courts 1 through 4. Select a date, tap an available 1-hour slot, and tap adjacent hours to extend your reservation.
              </p>
            </div>

            {/* Error State */}
            {error && (
              <BookingErrorState
                message={error}
                onRetry={() => loadAvailability()}
              />
            )}

            {/* Loading Skeleton */}
            {isLoading && !error && <BookingLoadingSkeleton />}

            {/* Loaded Content */}
            {!isLoading && !error && (
              <>
                {/* Date Controls Row */}
                <div className="bg-white dark:bg-[#0E172A] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-white/10 shadow-xs">
                  <DateSelector
                    selectedDate={selectedDate}
                    onSelectDate={(date) => {
                      setSelectedDate(date);
                      setSelectedTimes([]);
                      setSelectionNotice(null);
                    }}
                  />
                </div>

                {isAllFullyBooked ? (
                  <BookingEmptyState
                    date={selectedDate}
                    onChangeDate={() => setSelectedDate(addDays(selectedDate, 1))}
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Primary Availability Area */}
                    <div className="lg:col-span-8 space-y-6">
                      {/* Desktop 4-Court Synchronized Grid (Hidden on Mobile) */}
                      <div className="hidden md:block">
                        <DesktopScheduleGrid
                          schedules={schedules}
                          selectedCourtId={selectedCourtId}
                          selectedTimes={selectedTimes}
                          onSelectSlot={handleSelectSlot}
                          onSelectCourtTab={handleSelectCourtTab}
                          notice={selectionNotice}
                        />
                      </div>

                      {/* Mobile Purpose-Built Stepped Flow (Hidden on Desktop) */}
                      <div className="md:hidden">
                        <MobileBookingFlow
                          schedules={schedules}
                          selectedCourtId={selectedCourtId}
                          selectedTimes={selectedTimes}
                          onSelectSlot={handleSelectSlot}
                          onSelectCourt={handleSelectCourtTab}
                          notice={selectionNotice}
                        />
                      </div>
                    </div>

                    {/* Desktop Sticky Summary Sidebar (Hidden on Mobile) */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-28">
                      <BookingSummaryCard
                        draft={currentDraft}
                        onContinue={handleContinue}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Mobile Bottom Sticky Bar (Visible when slots are selected on mobile) */}
            {currentDraft && (
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E172A]/95 backdrop-blur-md border-t border-neutral-200 dark:border-white/10 p-4 shadow-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#3F6212] dark:text-[#A3E635] flex items-center gap-1.5">
                      <span>{currentDraft.courtName}</span>
                      <span>·</span>
                      <span>{currentDraft.selectedHours} {currentDraft.selectedHours === 1 ? 'hour' : 'hours'}</span>
                    </div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                      {currentDraft.displayTimeWindow}
                    </div>
                    <div className="text-xs text-neutral-400">
                      ₱{currentDraft.priceEstimatePhp} (Provisional ₱{MOCK_HOURLY_RATE_PHP}/hr)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="py-3 px-5 rounded-xl bg-[#84CC16] hover:bg-[#A3E635] text-[#0A1120] font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
                  >
                    Continue to Reserve
                  </button>
                </div>
              </div>
            )}
      </div>

      {showAuthGate && currentDraft && (
        <AuthGateModal
          draft={currentDraft}
          onClose={() => setShowAuthGate(false)}
        />
      )}
    </div>
  );
};
