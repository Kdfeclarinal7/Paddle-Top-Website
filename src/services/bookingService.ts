import type { CourtId } from '../types';
import type {
  CourtSchedule,
  SlotAvailability,
  TimeSlotDefinition,
  BookingDraft,
  BookingHold,
  ConfirmedBooking,
} from '../types/booking';

// Replaceable centralized mock venue configuration
export const VENUE_CONFIG = {
  venueName: 'PADDLE TOP',
  timezone: 'Asia/Manila',
  openHour: 6,
  closeHour: 23, // 11:00 PM
  closeMinutes: 1380, // 23:00 (11:00 PM)
  mockHourlyRatePhp: 350, // Centralized provisional rate
};

export const MOCK_HOURLY_RATE_PHP = VENUE_CONFIG.mockHourlyRatePhp;

// Primary operating 1-hour time blocks (6:00 AM to 10:00 PM starts, ending at 11:00 PM)
export const OPERATING_SLOTS: TimeSlotDefinition[] = [
  { time: '06:00', displayTime: '6:00 AM', endTime: '07:00', displayEndTime: '7:00 AM', displayHourRange: '6:00 AM – 7:00 AM', period: 'morning', minutesFromMidnight: 360 },
  { time: '07:00', displayTime: '7:00 AM', endTime: '08:00', displayEndTime: '8:00 AM', displayHourRange: '7:00 AM – 8:00 AM', period: 'morning', minutesFromMidnight: 420 },
  { time: '08:00', displayTime: '8:00 AM', endTime: '09:00', displayEndTime: '9:00 AM', displayHourRange: '8:00 AM – 9:00 AM', period: 'morning', minutesFromMidnight: 480 },
  { time: '09:00', displayTime: '9:00 AM', endTime: '10:00', displayEndTime: '10:00 AM', displayHourRange: '9:00 AM – 10:00 AM', period: 'morning', minutesFromMidnight: 540 },
  { time: '10:00', displayTime: '10:00 AM', endTime: '11:00', displayEndTime: '11:00 AM', displayHourRange: '10:00 AM – 11:00 AM', period: 'morning', minutesFromMidnight: 600 },
  { time: '11:00', displayTime: '11:00 AM', endTime: '12:00', displayEndTime: '12:00 PM', displayHourRange: '11:00 AM – 12:00 PM', period: 'morning', minutesFromMidnight: 660 },
  { time: '12:00', displayTime: '12:00 PM', endTime: '13:00', displayEndTime: '1:00 PM', displayHourRange: '12:00 PM – 1:00 PM', period: 'afternoon', minutesFromMidnight: 720 },
  { time: '13:00', displayTime: '1:00 PM', endTime: '14:00', displayEndTime: '2:00 PM', displayHourRange: '1:00 PM – 2:00 PM', period: 'afternoon', minutesFromMidnight: 780 },
  { time: '14:00', displayTime: '2:00 PM', endTime: '15:00', displayEndTime: '3:00 PM', displayHourRange: '2:00 PM – 3:00 PM', period: 'afternoon', minutesFromMidnight: 840 },
  { time: '15:00', displayTime: '3:00 PM', endTime: '16:00', displayEndTime: '4:00 PM', displayHourRange: '3:00 PM – 4:00 PM', period: 'afternoon', minutesFromMidnight: 900 },
  { time: '16:00', displayTime: '4:00 PM', endTime: '17:00', displayEndTime: '5:00 PM', displayHourRange: '4:00 PM – 5:00 PM', period: 'afternoon', minutesFromMidnight: 960 },
  { time: '17:00', displayTime: '5:00 PM', endTime: '18:00', displayEndTime: '6:00 PM', displayHourRange: '5:00 PM – 6:00 PM', period: 'evening', minutesFromMidnight: 1020 },
  { time: '18:00', displayTime: '6:00 PM', endTime: '19:00', displayEndTime: '7:00 PM', displayHourRange: '6:00 AM – 7:00 PM', period: 'evening', minutesFromMidnight: 1080 },
  { time: '19:00', displayTime: '7:00 PM', endTime: '20:00', displayEndTime: '8:00 PM', displayHourRange: '7:00 PM – 8:00 PM', period: 'evening', minutesFromMidnight: 1140 },
  { time: '20:00', displayTime: '8:00 PM', endTime: '21:00', displayEndTime: '9:00 PM', displayHourRange: '8:00 PM – 9:00 PM', period: 'evening', minutesFromMidnight: 1200 },
  { time: '21:00', displayTime: '9:00 PM', endTime: '22:00', displayEndTime: '10:00 PM', displayHourRange: '9:00 PM – 10:00 PM', period: 'evening', minutesFromMidnight: 1260 },
  { time: '22:00', displayTime: '10:00 PM', endTime: '23:00', displayEndTime: '11:00 PM', displayHourRange: '10:00 PM – 11:00 PM', period: 'evening', minutesFromMidnight: 1320 },
];

export function calculatePrice(hours: number): number {
  return Math.max(1, hours) * MOCK_HOURLY_RATE_PHP;
}

// Convert minutes from midnight to readable 12-hour format
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = mins === 0 ? '00' : mins < 10 ? `0${mins}` : mins;
  return `${displayHours}:${displayMins} ${ampm}`;
}

export function parseTimeToMinutes(timeStr: string): number {
  const [hStr, mStr] = timeStr.split(':');
  return parseInt(hStr, 10) * 60 + parseInt(mStr || '0', 10);
}

// Compute contiguous start/end time window from an array of hourly times
export function computeConsecutiveWindow(times: string[]): {
  startTime: string;
  endTime: string;
  displayTimeWindow: string;
  totalHours: number;
} {
  if (times.length === 0) {
    return {
      startTime: '',
      endTime: '',
      displayTimeWindow: '',
      totalHours: 0,
    };
  }

  // Sort times chronologically
  const sorted = [...times].sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
  const firstSlotMinutes = parseTimeToMinutes(sorted[0]);
  const lastSlotMinutes = parseTimeToMinutes(sorted[sorted.length - 1]);
  const endMinutes = lastSlotMinutes + 60;

  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  const endTimeStr = `${endH < 10 ? '0' : ''}${endH}:${endM < 10 ? '0' : ''}${endM}`;

  const startDisplay = formatMinutesToTime(firstSlotMinutes);
  const endDisplay = formatMinutesToTime(endMinutes);

  return {
    startTime: sorted[0],
    endTime: endTimeStr,
    displayTimeWindow: `${startDisplay} – ${endDisplay}`,
    totalHours: sorted.length,
  };
}

// Selection logic implementing consecutive hourly rules
export interface ToggleResult {
  nextTimes: string[];
  notice?: string;
}

export function handleHourlySlotToggle(
  currentTimes: string[],
  clickedTime: string,
  availableTimesOnCourt: string[]
): ToggleResult {
  const isAvailable = availableTimesOnCourt.includes(clickedTime);
  if (!isAvailable) {
    return { nextTimes: currentTimes };
  }

  // 1. FIRST CLICK: No current selection
  if (currentTimes.length === 0) {
    return { nextTimes: [clickedTime] };
  }

  // Sort current selection
  const sorted = [...currentTimes].sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
  const earliestMins = parseTimeToMinutes(sorted[0]);
  const latestMins = parseTimeToMinutes(sorted[sorted.length - 1]);
  const clickedMins = parseTimeToMinutes(clickedTime);

  // 2. CLICKED ON AN ALREADY SELECTED SLOT
  if (sorted.includes(clickedTime)) {
    // If only 1 slot was selected, clicking it again deselects it
    if (sorted.length === 1) {
      return { nextTimes: [] };
    }

    // If clicked earliest endpoint: shrink from the start
    if (clickedMins === earliestMins) {
      return { nextTimes: sorted.slice(1) };
    }

    // If clicked latest endpoint: shrink from the end
    if (clickedMins === latestMins) {
      return { nextTimes: sorted.slice(0, -1) };
    }

    // Clicked an INTERIOR slot: removing it would create a gap!
    // Disallow gap and provide lightweight non-blocking explanation
    return {
      nextTimes: sorted,
      notice: 'Booking hours must stay consecutive. To shorten your booking, remove an hour from the start or end.',
    };
  }

  // 3. CLICKED AN UNSELECTED ADJACENT HOUR
  // Check if clicked hour is immediately adjacent to the current range
  const isAdjacentBefore = clickedMins === earliestMins - 60;
  const isAdjacentAfter = clickedMins === latestMins + 60;

  if (isAdjacentBefore || isAdjacentAfter) {
    const updated = [...sorted, clickedTime].sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    return { nextTimes: updated };
  }

  // 4. CLICKED A NON-ADJACENT AVAILABLE HOUR
  // Begins a new single selection rather than producing disconnected hours
  return { nextTimes: [clickedTime] };
}

// Deterministic seed generation for realistic mock availability
function getMockRawStatus(courtId: CourtId, dateStr: string, time: string): 'available' | 'booked' | 'held' {
  const seedString = `${dateStr}_${courtId}_${time}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash) % 100;

  const hour = parseInt(time.split(':')[0], 10);
  const isEveningPrime = hour >= 18 && hour <= 20;

  if (isEveningPrime) {
    if (normalized < 52) return 'booked';
    if (normalized < 66) return 'held';
    return 'available';
  }

  if (normalized < 25) return 'booked';
  if (normalized < 32) return 'held';
  return 'available';
}

export interface GetAvailabilityOptions {
  date: string; // YYYY-MM-DD
  simulateDelayMs?: number;
  forceEmpty?: boolean;
  forceError?: boolean;
}

export async function fetchCourtAvailability(
  options: GetAvailabilityOptions
): Promise<CourtSchedule[]> {
  const { date, simulateDelayMs = 0, forceEmpty = false, forceError = false } = options;

  if (simulateDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, simulateDelayMs));
  }

  if (forceError) {
    throw new Error('Unable to retrieve court availability. Please try again.');
  }

  const courts: { id: CourtId; name: string }[] = [
    { id: 'court-1', name: 'Court 1' },
    { id: 'court-2', name: 'Court 2' },
    { id: 'court-3', name: 'Court 3' },
    { id: 'court-4', name: 'Court 4' },
  ];

  if (forceEmpty) {
    return courts.map((c) => ({
      courtId: c.id,
      courtName: c.name,
      slots: OPERATING_SLOTS.map((s) => ({
        time: s.time,
        displayTime: s.displayTime,
        endTime: s.endTime,
        displayEndTime: s.displayEndTime,
        displayHourRange: s.displayHourRange,
        status: 'booked' as const,
        period: s.period,
        minutesFromMidnight: s.minutesFromMidnight,
      })),
    }));
  }

  return courts.map((court) => {
    const slots: SlotAvailability[] = OPERATING_SLOTS.map((slot) => {
      const rawStatus = getMockRawStatus(court.id, date, slot.time);

      return {
        time: slot.time,
        displayTime: slot.displayTime,
        endTime: slot.endTime,
        displayEndTime: slot.displayEndTime,
        displayHourRange: slot.displayHourRange,
        status: rawStatus,
        period: slot.period,
        minutesFromMidnight: slot.minutesFromMidnight,
      };
    });

    return {
      courtId: court.id,
      courtName: court.name,
      slots,
    };
  });
}

// LocalStorage helpers for mock holds and reservations
const ACTIVE_HOLD_KEY = 'paddle_top_active_hold_v2';
const CONFIRMED_BOOKINGS_KEY = 'paddle_top_confirmed_bookings_v2';

export function createMockHold(draft: BookingDraft, userName?: string, userEmail?: string): BookingHold {
  const hold: BookingHold = {
    holdId: `HOLD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    draft,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
    userName: userName || 'Player',
    userEmail: userEmail || 'player@example.com',
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_HOLD_KEY, JSON.stringify(hold));
  }
  return hold;
}

export function getActiveMockHold(): BookingHold | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ACTIVE_HOLD_KEY);
  if (!raw) return null;

  try {
    const hold: any = JSON.parse(raw);
    
    // Legacy localStorage safety guard:
    // If the persisted hold has old duration schema without selectedHours or selectedTimes,
    // safely clear it and return null to prevent application crash
    if (!hold || !hold.draft || !hold.expiresAt) {
      localStorage.removeItem(ACTIVE_HOLD_KEY);
      return null;
    }

    if (!hold.draft.selectedHours || !Array.isArray(hold.draft.selectedTimes) || hold.draft.selectedTimes.length === 0) {
      // Legacy duration-based structure detected: safely clear it
      localStorage.removeItem(ACTIVE_HOLD_KEY);
      return null;
    }

    if (Date.now() > hold.expiresAt) {
      localStorage.removeItem(ACTIVE_HOLD_KEY);
      return null;
    }
    return hold as BookingHold;
  } catch {
    localStorage.removeItem(ACTIVE_HOLD_KEY);
    return null;
  }
}

export function releaseActiveMockHold(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACTIVE_HOLD_KEY);
  }
}

export function createConfirmedMockBooking(
  hold: BookingHold,
  paymentMethod: string
): ConfirmedBooking {
  const randomRef = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
  const confirmed: ConfirmedBooking = {
    referenceCode: randomRef,
    draft: hold.draft,
    confirmedAt: Date.now(),
    customerName: hold.userName || 'Player',
    customerEmail: hold.userEmail || 'player@example.com',
    paymentMethod,
    paymentStatus: 'paid',
    bookingStatus: 'confirmed',
  };

  if (typeof window !== 'undefined') {
    releaseActiveMockHold();
    try {
      const existing = JSON.parse(localStorage.getItem(CONFIRMED_BOOKINGS_KEY) || '[]');
      existing.unshift(confirmed);
      localStorage.setItem(CONFIRMED_BOOKINGS_KEY, JSON.stringify(existing));
    } catch {
      // ignore
    }
  }

  return confirmed;
}
