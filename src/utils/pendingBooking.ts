import type { CourtId } from '../types';

export interface PendingBookingSelection {
  courtId: CourtId;
  date: string;
  selectedTimes: string[];
}

const KEY = 'paddle-top-pending-selection-v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function savePendingBooking(selection: PendingBookingSelection): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...selection, savedAt: Date.now() }));
  } catch {
    // Private browsing/sessionStorage disabled: the auth flow still works.
  }
}

export function readPendingBooking(): PendingBookingSelection | null {
  try {
    const saved = sessionStorage.getItem(KEY);
    if (!saved) return null;
    const value = JSON.parse(saved);
    if (!value || typeof value.savedAt !== 'number'
      || value.savedAt > Date.now()
      || Date.now() - value.savedAt > MAX_AGE_MS
      || !['court-1', 'court-2', 'court-3', 'court-4'].includes(value.courtId)
      || typeof value.date !== 'string'
      || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)
      || !Array.isArray(value.selectedTimes)
      || value.selectedTimes.length > 17
      || !value.selectedTimes.every((time: unknown) =>
        typeof time === 'string' && /^([01]\d|2[0-3]):00$/.test(time))) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return {
      courtId: value.courtId,
      date: value.date,
      selectedTimes: value.selectedTimes,
    };
  } catch {
    return null;
  }
}

export function clearPendingBooking(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* optional */ }
}
