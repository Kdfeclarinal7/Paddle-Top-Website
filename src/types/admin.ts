import { CourtId } from './index';
import { PaddleProduct, PaddleOrder } from './paddle';

export type AdminViewTab =
  | 'today'
  | 'reservations'
  | 'walkins'
  | 'closures'
  | 'paddles'
  | 'transactions'
  | 'analytics'
  | 'settings';

export type CourtRealtimeStatus = 'available' | 'active' | 'ending_soon' | 'upcoming' | 'closed';

export interface CourtSessionInfo {
  reservationId: string;
  referenceCode: string;
  customerName: string;
  customerPhone?: string;
  type: 'online' | 'walk-in';
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  displayTimeWindow: string; // "2:00 PM – 4:00 PM"
  durationHours: number;
  minutesRemaining: number;
  paidAmountPHP: number;
  paymentMethod: string;
}

export interface CourtStatusCardData {
  courtId: CourtId;
  courtName: string;
  status: CourtRealtimeStatus;
  statusLabel: string;
  currentSession?: CourtSessionInfo;
  nextSession?: {
    reservationId: string;
    referenceCode: string;
    customerName: string;
    startTime: string;
    endTime: string;
    displayTimeWindow: string;
  };
  gapMinutes?: number;
  activeClosure?: CourtClosure;
}

export type ReservationStatus = 'confirmed' | 'active' | 'completed' | 'no_show' | 'cancelled';
export type AdminPaymentMethod = 'CASH' | 'GCASH' | 'CARD' | 'MOCK_ONLINE';

export interface AdminReservation {
  id: string;
  referenceCode: string; // "PT-XXXXX"
  courtId: CourtId;
  courtName: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  displayTimeWindow: string;
  hours: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  playerType: 'online' | 'walk-in';
  amountPaidPHP: number;
  paymentMethod: AdminPaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
}

export type ClosureScope = 'single_court' | 'all_courts';
export type ClosureReason = 'Maintenance' | 'Rain / Weather' | 'Private Event' | 'Staff / Cleaning' | 'Other';

export interface CourtClosure {
  id: string;
  scope: ClosureScope;
  courtId?: CourtId;
  courtName: string; // "Court 2" or "All Courts (Facility)"
  reason: ClosureReason;
  customNote?: string;
  startDate: string; // "YYYY-MM-DD"
  startTime: string; // "06:00"
  endDate: string; // "YYYY-MM-DD"
  endTime: string; // "23:00"
  active: boolean;
  createdAt: string;
}

export type TransactionType = 'court_booking' | 'walk_in' | 'court_extension' | 'paddle_sale';

export interface AdminTransaction {
  id: string;
  transactionCode: string; // "TXN-PT-XXXX"
  type: TransactionType;
  typeLabel: string;
  description: string;
  customerName: string;
  customerPhone?: string;
  amountPHP: number;
  paymentMethod: AdminPaymentMethod | 'GCASH_MOCK' | 'CARD_MOCK' | 'VENUE_COUNTER';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  timestamp: string; // ISO date string
  relatedReference?: string; // Court booking reference or Paddle Order code
}

export interface AdminVenueSettings {
  courtHourlyRatePHP: number;
  operatingHoursStart: string; // "06:00"
  operatingHoursEnd: string; // "23:00"
  minLeadTimeHours: number;
  maxBookingDaysAhead: number;
  holdDurationMinutes: number;
  venueName: string;
  venueAddress: string;
  venuePhone: string;
  venueEmail: string;
  rainPolicyNote: string;
  autoMarkCompleted: boolean;
}

export interface HourlyScheduleBlock {
  courtId: CourtId;
  time: string; // "06:00"
  endTime: string; // "07:00"
  displayLabel: string; // "6:00 AM"
  status: 'available' | 'booked_online' | 'walk_in' | 'active' | 'closed';
  reservation?: AdminReservation;
  closure?: CourtClosure;
}
