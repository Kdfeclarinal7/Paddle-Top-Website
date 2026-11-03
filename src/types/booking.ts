import type { CourtId } from './index';

export type SlotStatus = 'available' | 'booked' | 'held' | 'past';

export interface TimeSlotDefinition {
  time: string; // "06:00", "07:00", etc.
  displayTime: string; // "6:00 AM", "7:00 AM"
  endTime: string; // "07:00", "08:00"
  displayEndTime: string; // "7:00 AM", "8:00 AM"
  displayHourRange: string; // "6:00 AM – 7:00 AM"
  period: 'morning' | 'afternoon' | 'evening';
  minutesFromMidnight: number;
}

export interface SlotAvailability {
  time: string;
  displayTime: string;
  endTime: string;
  displayEndTime: string;
  displayHourRange: string;
  status: SlotStatus;
  period: 'morning' | 'afternoon' | 'evening';
  minutesFromMidnight: number;
}

export interface CourtSchedule {
  courtId: CourtId;
  courtName: string;
  slots: SlotAvailability[];
}

export interface BookingDraft {
  courtId: CourtId;
  courtName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "18:00"
  endTime: string; // "20:00"
  displayTimeWindow: string; // "6:00 PM – 8:00 PM"
  selectedHours: number; // e.g. 2
  selectedTimes: string[]; // ["18:00", "19:00"]
  priceEstimatePhp: number;
}

export interface BookingHold {
  holdId: string;
  draft: BookingDraft;
  createdAt: number;
  expiresAt: number; // Unix timestamp ms
  userName?: string;
  userEmail?: string;
}

export type BookingStatus = 'draft' | 'held' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface ConfirmedBooking {
  referenceCode: string; // e.g. "PT-82914"
  draft: BookingDraft;
  confirmedAt: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
}
