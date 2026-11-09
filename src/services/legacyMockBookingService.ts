// Legacy demonstration helpers. The Phase 3 booking page never imports these.
// Kept only for the detached MockPaymentModal demonstration component.
import type { BookingDraft, BookingHold, ConfirmedBooking } from '../types/booking';

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
