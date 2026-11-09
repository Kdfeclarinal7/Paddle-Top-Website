import type { CourtId } from '../types';
import type { BookingDraft, CourtSchedule, SlotAvailability, SlotStatus } from '../types/booking';
import { supabase } from '../lib/supabase';

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


type ServerSlot = { time: string; status: SlotStatus };
type ServerCourt = { court_id: CourtId; court_name: string; slots: ServerSlot[] };
interface AvailabilityResponse {
  configured: boolean;
  message: string | null;
  hourly_rate_php: number | string | null;
  hold_duration_minutes: number | null;
  courts: ServerCourt[];
}

export interface AvailabilityResult {
  configured: boolean;
  message: string | null;
  hourlyRatePhp: number | null;
  holdDurationMinutes: number | null;
  schedules: CourtSchedule[];
}

export interface LiveBookingHold {
  id: string;
  court_id: CourtId;
  court_name: string;
  starts_at: string;
  ends_at: string;
  hourly_rate_php: number;
  total_price_php: number;
  created_at: string;
  expires_at: string;
  status: 'active';
}

// No mock availability fallback. The database alone defines times and prices.
export async function fetchCourtAvailability(date: string): Promise<AvailabilityResult> {
  if (!supabase) {
    return {
      configured: false, message: 'Online booking is not configured yet.',
      hourlyRatePhp: null, holdDurationMinutes: null, schedules: [],
    };
  }
  const { data, error } = await supabase.rpc('get_court_availability', { p_date: date });
  if (error) throw new Error(error.message);
  const response = data as AvailabilityResponse;
  if (!response?.configured) {
    return {
      configured: false, message: response?.message ?? 'Online booking is not configured yet.',
      hourlyRatePhp: null, holdDurationMinutes: null, schedules: [],
    };
  }

  const rate = Number(response.hourly_rate_php);
  if (!Number.isFinite(rate) || rate < 0) {
    throw new Error('Invalid hourly rate from venue settings.');
  }

  const schedules: CourtSchedule[] = (response.courts ?? []).map((court) => ({
    courtId: court.court_id,
    courtName: court.court_name,
    slots: court.slots.map((slot): SlotAvailability => {
      const minutes = parseTimeToMinutes(slot.time);
      const endMinutes = minutes + 60;
      const endHour = Math.floor(endMinutes / 60);
      const endTime = String(endHour).padStart(2, '0') + ':00';
      const displayTime = formatMinutesToTime(minutes);
      const displayEndTime = formatMinutesToTime(endMinutes);
      return {
        time: slot.time,
        displayTime,
        endTime,
        displayEndTime,
        displayHourRange: displayTime + ' – ' + displayEndTime,
        status: ['available','booked','held','past'].includes(slot.status) ? slot.status : 'booked',
        period: minutes < 720 ? 'morning' : minutes < 1020 ? 'afternoon' : 'evening',
        minutesFromMidnight: minutes,
      };
    }),
  }));

  return {
    configured: true,
    message: null,
    hourlyRatePhp: rate,
    holdDurationMinutes: response.hold_duration_minutes,
    schedules,
  };
}

export function calculatePrice(hours: number, hourlyRatePhp: number): number {
  return Math.max(0, hours) * hourlyRatePhp;
}

export async function createBookingHold(draft: BookingDraft): Promise<LiveBookingHold> {
  if (!supabase) throw new Error('Online booking is not configured yet.');
  const { data, error } = await supabase.rpc('create_booking_hold', {
    p_court_id: draft.courtId,
    p_date: draft.date,
    p_start_time: draft.startTime,
    p_end_time: draft.endTime,
  });
  if (error) throw new Error(error.message);
  if (!data || data.status !== 'active') throw new Error('Hold was not created.');
  return {
    ...data,
    hourly_rate_php: Number(data.hourly_rate_php),
    total_price_php: Number(data.total_price_php),
  } as LiveBookingHold;
}

export async function getActiveBookingHold(
  holdId?: string,
): Promise<LiveBookingHold | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_active_booking_hold', {
    p_hold_id: holdId ?? null,
  });
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    ...data,
    hourly_rate_php: Number(data.hourly_rate_php),
    total_price_php: Number(data.total_price_php),
  } as LiveBookingHold;
}

export async function releaseBookingHold(holdId: string): Promise<'released' | 'expired' | 'not_found'> {
  if (!supabase) throw new Error('Online booking is not configured yet.');
  const { data, error } = await supabase.rpc('release_booking_hold', { p_hold_id: holdId });
  if (error) throw new Error(error.message);
  return data?.status as 'released' | 'expired' | 'not_found';
}
