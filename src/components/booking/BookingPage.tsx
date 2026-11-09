import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { CourtId } from '../../types';
import type { BookingDraft, CourtSchedule } from '../../types/booking';
import {
  fetchCourtAvailability,
  calculatePrice,
  computeConsecutiveWindow,
  handleHourlySlotToggle,
  createBookingHold,
  getActiveBookingHold,
  releaseBookingHold,
  type LiveBookingHold,
} from '../../services/bookingService';
import { getTodayString, addDays } from '../../utils/dateUtils';
import { DateSelector } from './DateSelector';
import { DesktopScheduleGrid } from './DesktopScheduleGrid';
import { MobileBookingFlow } from './MobileBookingFlow';
import { BookingSummaryCard } from './BookingSummaryCard';
import { AuthGateModal } from './AuthGateModal';
import { ActiveHoldView } from './ActiveHoldView';
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
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [activeHold, setActiveHold] = useState<LiveBookingHold | null>(null);
  const [isHoldBusy, setIsHoldBusy] = useState(false);
  const [hourlyRatePhp, setHourlyRatePhp] = useState<number | null>(null);
  const [holdDurationMinutes, setHoldDurationMinutes] = useState<number | null>(null);
  const [configured, setConfigured] = useState(false);
  const [configurationMessage, setConfigurationMessage] = useState<string | null>(null);
  const authResumeHandled = useRef(false);
  const holdRequestInFlight = useRef(false);
  const availabilityRequest = useRef(0);

  // Data / Async State
  const [schedules, setSchedules] = useState<CourtSchedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showAuthGate, setShowAuthGate] = useState<boolean>(false);

  // Avoid resetting a restored OAuth draft on first render.
  useEffect(() => {
    if (!initialCourtApplied.current) {
      initialCourtApplied.current = true;
      return;
    }
    setSelectedCourtId(initialCourtId);
    setSelectedTimes([]);
    setSelectionNotice(null);
  }, [initialCourtId]);

  // Live public RPC, with no mock fallback and no fabricated operating hours.
  const loadAvailability = useCallback(async () => {
    const request = ++availabilityRequest.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCourtAvailability(selectedDate);
      if (request !== availabilityRequest.current) return;
      setSchedules(result.schedules);
      setConfigured(result.configured);
      setConfigurationMessage(result.message);
      setHourlyRatePhp(result.hourlyRatePhp);
      setHoldDurationMinutes(result.holdDurationMinutes);
    } catch (err) {
      if (request !== availabilityRequest.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load availability');
      setSchedules([]);
      setConfigured(false);
    } finally {
      if (request === availabilityRequest.current) setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadAvailability();
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
    if (selectedTimes.length === 0 || hourlyRatePhp === null || !configured) return null;
    const courtSchedule = schedules.find((s) => s.courtId === selectedCourtId);
    if (!courtSchedule) return null;
    const courtName = courtSchedule.courtName;
    const { startTime, endTime, displayTimeWindow, totalHours } = computeConsecutiveWindow(selectedTimes);
    const priceEstimate = calculatePrice(totalHours, hourlyRatePhp);

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
  }, [selectedCourtId, selectedDate, selectedTimes, schedules, hourlyRatePhp, configured]);

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

  const requestHold = useCallback(async (selection: {
    courtId: CourtId; date: string; selectedTimes: string[];
  }) => {
    if (holdRequestInFlight.current) return;
    holdRequestInFlight.current = true;
    setIsHoldBusy(true);
    setBookingNotice(null);
    try {
      const window = computeConsecutiveWindow(selection.selectedTimes);
      if (!window.startTime || !window.endTime) throw new Error('Select consecutive hours first.');
      const hold = await createBookingHold({
        courtId: selection.courtId,
        date: selection.date,
        startTime: window.startTime,
        endTime: window.endTime,
      });
      setActiveHold(hold);
      setSelectedTimes([]);
      setShowAuthGate(false);
      await loadAvailability();
    } catch (err) {
      setBookingNotice(err instanceof Error ? err.message : 'Unable to hold this court. Try again.');
      await loadAvailability();
    } finally {
      holdRequestInFlight.current = false;
      setIsHoldBusy(false);
    }
  }, [loadAvailability]);

  // On OAuth return, resume the actual selected hours automatically.
  // The saved selection is a convenience only: the RPC revalidates every slot.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      authResumeHandled.current = false;
      setActiveHold(null);
      return;
    }
    if (authResumeHandled.current) return;
    authResumeHandled.current = true;
    const pending = readPendingBooking();
    if (pending) {
      clearPendingBooking();
      setShowAuthGate(false);
      void requestHold(pending);
    } else {
      void getActiveBookingHold().then(setActiveHold).catch((err: unknown) => {
        setBookingNotice(err instanceof Error ? err.message : 'Unable to restore your hold.');
      });
    }
  }, [authLoading, user?.id, requestHold]);

  const handleContinue = () => {
    if (!currentDraft || authLoading || isHoldBusy || activeHold) return;
    if (user) {
      void requestHold({
        courtId: currentDraft.courtId,
        date: currentDraft.date,
        selectedTimes: currentDraft.selectedTimes,
      });
      return;
    }
    savePendingBooking({
      courtId: currentDraft.courtId,
      date: currentDraft.date,
      selectedTimes: currentDraft.selectedTimes,
    });
    setShowAuthGate(true);
  };

  const handleReleaseHold = async () => {
    if (!activeHold || isHoldBusy) return;
    setIsHoldBusy(true);
    setBookingNotice(null);
    try {
      const status = await releaseBookingHold(activeHold.id);
      if (status === 'released' || status === 'expired' || status === 'not_found') {
        setActiveHold(null);
        await loadAvailability();
      }
    } catch (err) {
      setBookingNotice(err instanceof Error ? err.message : 'Could not release this hold.');
    } finally {
      setIsHoldBusy(false);
    }
  };

  const handleExpiredHold = useCallback(() => {
    if (!activeHold) return;
    void getActiveBookingHold(activeHold.id).then((hold) => {
      if (!hold) {
        setActiveHold(null);
        setBookingNotice('Your temporary hold has expired. You can select another available time.');
        void loadAvailability();
      } else {
        setActiveHold(hold);
      }
    }).catch(() => {
      // The server is authoritative. Keep the hold visible until confirmed.
      setBookingNotice('Could not verify hold expiry. Please retry your availability check.');
    });
  }, [activeHold?.id, loadAvailability]);

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

        {bookingNotice && (
          <p role="status" className="rounded-xl border border-amber-200 dark:border-amber-700/30 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            {bookingNotice}
          </p>
        )}

        {activeHold && (
          <ActiveHoldView
            hold={activeHold}
            releasing={isHoldBusy}
            onRelease={() => void handleReleaseHold()}
            onExpired={handleExpiredHold}
          />
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
                See available hourly slots across the courts. Select a date, tap an open hour, and add consecutive hours to request a temporary hold.
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

            {!isLoading && !error && !configured && (
              <div role="status" className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0E172A] text-sm text-neutral-600 dark:text-neutral-300">
                {configurationMessage ?? 'Online booking is not configured yet.'}
              </div>
            )}

            {/* Loaded Content */}
            {!isLoading && !error && configured && (
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

                {schedules.length === 0 ? (
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 p-5">
                    No courts are currently enabled for online booking.
                  </div>
                ) : isAllFullyBooked ? (
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
                        isLoading={isLoading || isHoldBusy || Boolean(activeHold)}
                        holdDurationMinutes={holdDurationMinutes}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Mobile Bottom Sticky Bar (Visible when slots are selected on mobile) */}
            {currentDraft && !activeHold && (
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
                      ₱{currentDraft.priceEstimatePhp} (₱{hourlyRatePhp}/hr · venue rate)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={isHoldBusy || authLoading}
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
