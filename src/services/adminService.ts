import { CourtId } from '../types';
import {
  AdminReservation,
  CourtStatusCardData,
  CourtClosure,
  AdminTransaction,
  AdminVenueSettings,
  HourlyScheduleBlock,
  ReservationStatus,
  AdminPaymentMethod,
  ClosureScope,
  ClosureReason
} from '../types/admin';
import { PaddleProduct, PaddleOrder, OrderStatus } from '../types/paddle';
import { INITIAL_PADDLES } from '../data/paddleProducts';

const STORAGE_KEYS = {
  RESERVATIONS: 'pt_admin_reservations_v2',
  CLOSURES: 'pt_admin_closures_v2',
  TRANSACTIONS: 'pt_admin_transactions_v2',
  SETTINGS: 'pt_admin_settings_v2',
  PADDLES: 'pt_admin_paddles_v2',
  ORDERS: 'pt_admin_paddle_orders_v2'
};

const DEFAULT_SETTINGS: AdminVenueSettings = {
  courtHourlyRatePHP: 1200,
  operatingHoursStart: '06:00',
  operatingHoursEnd: '23:00',
  minLeadTimeHours: 1,
  maxBookingDaysAhead: 14,
  holdDurationMinutes: 10,
  venueName: 'PADDLE TOP Pickleball Club',
  venueAddress: 'Metro Manila / Cavite Hub, Philippines',
  venuePhone: '+63 (02) 8800-PADDLE',
  venueEmail: 'operations@paddletop.ph',
  rainPolicyNote: 'Indoor covered court standard. 100% weather protected for all 4 courts.',
  autoMarkCompleted: true
};

// Helper: Format today as YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeDisplay(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${mStr} ${ampm}`;
}

export function formatCurrencyPHP(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}

// Initial Seed Data Generation
function seedDefaultReservations(): AdminReservation[] {
  const today = getTodayDateString();
  const yesterday = getRelativeDateString(-1);
  const tomorrow = getRelativeDateString(1);

  return [
    // Today Court 1: Active current session
    {
      id: 'res-today-01',
      referenceCode: 'PT-90412',
      courtId: 'court-1',
      courtName: 'Court 1',
      date: today,
      startTime: '13:00',
      endTime: '15:00',
      displayTimeWindow: '1:00 PM – 3:00 PM',
      hours: 2,
      customerName: 'Marcus Reyes',
      customerEmail: 'marcus.reyes@example.ph',
      customerPhone: '0917-882-9102',
      playerType: 'online',
      amountPaidPHP: 2400,
      paymentMethod: 'GCASH',
      paymentStatus: 'paid',
      status: 'active',
      notes: 'Requested loaner balls. Regular player.',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    // Today Court 1: Upcoming session later today
    {
      id: 'res-today-02',
      referenceCode: 'PT-90488',
      courtId: 'court-1',
      courtName: 'Court 1',
      date: today,
      startTime: '17:00',
      endTime: '19:00',
      displayTimeWindow: '5:00 PM – 7:00 PM',
      hours: 2,
      customerName: 'Andrea Lim',
      customerEmail: 'andrea.lim@example.ph',
      customerPhone: '0918-554-1290',
      playerType: 'online',
      amountPaidPHP: 2400,
      paymentMethod: 'MOCK_ONLINE',
      paymentStatus: 'paid',
      status: 'confirmed',
      notes: 'Group of 4 competitive players.',
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    // Today Court 2: Walk-in that was completed this morning
    {
      id: 'res-today-03',
      referenceCode: 'PT-W-108',
      courtId: 'court-2',
      courtName: 'Court 2',
      date: today,
      startTime: '08:00',
      endTime: '10:00',
      displayTimeWindow: '8:00 AM – 10:00 AM',
      hours: 2,
      customerName: 'Carlo Mendoza (Walk-in)',
      customerPhone: '0920-334-9912',
      playerType: 'walk-in',
      amountPaidPHP: 2400,
      paymentMethod: 'CASH',
      paymentStatus: 'paid',
      status: 'completed',
      notes: 'Walk-in cash payment settled at desk.',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    // Today Court 2: Upcoming in the afternoon
    {
      id: 'res-today-04',
      referenceCode: 'PT-90510',
      courtId: 'court-2',
      courtName: 'Court 2',
      date: today,
      startTime: '16:00',
      endTime: '18:00',
      displayTimeWindow: '4:00 PM – 6:00 PM',
      hours: 2,
      customerName: 'Patricia Sy',
      customerEmail: 'patricia.sy@example.ph',
      customerPhone: '0917-440-1198',
      playerType: 'online',
      amountPaidPHP: 2400,
      paymentMethod: 'GCASH',
      paymentStatus: 'paid',
      status: 'confirmed',
      notes: 'Pickleball clinic practice.',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    // Today Court 3: Active session (ending soon)
    {
      id: 'res-today-05',
      referenceCode: 'PT-90455',
      courtId: 'court-3',
      courtName: 'Court 3',
      date: today,
      startTime: '12:00',
      endTime: '14:00',
      displayTimeWindow: '12:00 PM – 2:00 PM',
      hours: 2,
      customerName: 'Gabriel Santos',
      customerEmail: 'gab.santos@example.ph',
      customerPhone: '0922-871-3345',
      playerType: 'online',
      amountPaidPHP: 2400,
      paymentMethod: 'CARD',
      paymentStatus: 'paid',
      status: 'active',
      notes: 'Asked about extending session if Court 3 is free.',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    // Today Court 3: Evening session
    {
      id: 'res-today-06',
      referenceCode: 'PT-90560',
      courtId: 'court-3',
      courtName: 'Court 3',
      date: today,
      startTime: '19:00',
      endTime: '21:00',
      displayTimeWindow: '7:00 PM – 9:00 PM',
      hours: 2,
      customerName: 'Rafael De Leon',
      customerEmail: 'raf.deleon@example.ph',
      customerPhone: '0917-900-4411',
      playerType: 'online',
      amountPaidPHP: 2400,
      paymentMethod: 'GCASH',
      paymentStatus: 'paid',
      status: 'confirmed',
      notes: 'Evening doubles match.',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    // Today Court 4: Morning session completed
    {
      id: 'res-today-07',
      referenceCode: 'PT-90390',
      courtId: 'court-4',
      courtName: 'Court 4',
      date: today,
      startTime: '07:00',
      endTime: '09:00',
      displayTimeWindow: '7:00 AM – 9:00 AM',
      hours: 2,
      customerName: 'Coach Vince Tan',
      customerEmail: 'vince.tan@example.ph',
      customerPhone: '0998-112-4455',
      playerType: 'online',
      amountPaidPHP: 2400,
      paymentMethod: 'MOCK_ONLINE',
      paymentStatus: 'paid',
      status: 'completed',
      notes: 'Morning drill session.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    // Tomorrow Bookings
    {
      id: 'res-tom-01',
      referenceCode: 'PT-90620',
      courtId: 'court-1',
      courtName: 'Court 1',
      date: tomorrow,
      startTime: '09:00',
      endTime: '11:00',
      displayTimeWindow: '9:00 AM – 11:00 AM',
      hours: 2,
      customerName: 'Sofia Mercado',
      customerEmail: 'sofia.mercado@example.ph',
      customerPhone: '0917-512-8877',
      playerType: 'online',
      amountPaidPHP: 2400,
      paymentMethod: 'GCASH',
      paymentStatus: 'paid',
      status: 'confirmed',
      notes: 'Weekend community play.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'res-tom-02',
      referenceCode: 'PT-90645',
      courtId: 'court-2',
      courtName: 'Court 2',
      date: tomorrow,
      startTime: '18:00',
      endTime: '20:00',
      displayTimeWindow: '6:00 PM – 8:00 PM',
      hours: 2,
      customerName: 'Kenzo Alcantara',
      customerEmail: 'kenzo.a@example.ph',
      customerPhone: '0918-223-4411',
      playerType: 'online',
      amountPaidPHP: 2400,
      paymentMethod: 'CARD',
      paymentStatus: 'paid',
      status: 'confirmed',
      notes: 'Birthday game.',
      createdAt: new Date().toISOString()
    },
    // Yesterday completed booking
    {
      id: 'res-yest-01',
      referenceCode: 'PT-90311',
      courtId: 'court-3',
      courtName: 'Court 3',
      date: yesterday,
      startTime: '18:00',
      endTime: '20:00',
      displayTimeWindow: '6:00 PM – 8:00 PM',
      hours: 2,
      customerName: 'Jericho Ramos',
      customerPhone: '0917-771-0099',
      playerType: 'walk-in',
      amountPaidPHP: 2400,
      paymentMethod: 'CASH',
      paymentStatus: 'paid',
      status: 'completed',
      notes: '',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ];
}

function seedDefaultClosures(): CourtClosure[] {
  // Empty or one sample closure for Court 4 maintenance early morning
  return [
    {
      id: 'cls-sample-01',
      scope: 'single_court',
      courtId: 'court-4',
      courtName: 'Court 4',
      reason: 'Maintenance',
      customNote: 'Scheduled non-slip resurfacing inspection & net tension adjustment.',
      startDate: getTodayDateString(),
      startTime: '14:00',
      endDate: getTodayDateString(),
      endTime: '17:00',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];
}

function seedDefaultTransactions(): AdminTransaction[] {
  const today = getTodayDateString();
  return [
    {
      id: 'txn-01',
      transactionCode: 'TXN-PT-2041',
      type: 'court_booking',
      typeLabel: 'Court Booking',
      description: 'Court 1 · 1:00 PM – 3:00 PM (2 hrs)',
      customerName: 'Marcus Reyes',
      customerPhone: '0917-882-9102',
      amountPHP: 2400,
      paymentMethod: 'GCASH',
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      relatedReference: 'PT-90412'
    },
    {
      id: 'txn-02',
      transactionCode: 'TXN-PT-2042',
      type: 'walk_in',
      typeLabel: 'Walk-In Court Session',
      description: 'Court 2 · 8:00 AM – 10:00 AM (2 hrs)',
      customerName: 'Carlo Mendoza (Walk-in)',
      customerPhone: '0920-334-9912',
      amountPHP: 2400,
      paymentMethod: 'CASH',
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      relatedReference: 'PT-W-108'
    },
    {
      id: 'txn-03',
      transactionCode: 'TXN-PT-2043',
      type: 'court_booking',
      typeLabel: 'Court Booking',
      description: 'Court 3 · 12:00 PM – 2:00 PM (2 hrs)',
      customerName: 'Gabriel Santos',
      customerPhone: '0922-871-3345',
      amountPHP: 2400,
      paymentMethod: 'CARD',
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      relatedReference: 'PT-90455'
    },
    {
      id: 'txn-04',
      transactionCode: 'TXN-PT-2044',
      type: 'paddle_sale',
      typeLabel: 'Paddle Order',
      description: '1x PT Sample Paddle Alpha (Pro Series)',
      customerName: 'Daniel Navarro',
      customerPhone: '0917-665-2190',
      amountPHP: 6800,
      paymentMethod: 'GCASH_MOCK',
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      relatedReference: 'PT-PDL-88310'
    },
    {
      id: 'txn-05',
      transactionCode: 'TXN-PT-2045',
      type: 'paddle_sale',
      typeLabel: 'Paddle Order',
      description: '1x PT Sample Paddle Velocity (Velocity Series)',
      customerName: 'Katrina Flores',
      customerPhone: '0920-441-8899',
      amountPHP: 5900,
      paymentMethod: 'CARD_MOCK',
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
      relatedReference: 'PT-PDL-88325'
    }
  ];
}

function seedDefaultPaddleOrders(): PaddleOrder[] {
  return [
    {
      id: 'order-01',
      orderCode: 'PT-PDL-88310',
      productId: 'pdl-01',
      productName: 'PT Sample Paddle Alpha',
      productSeries: 'Pro Series',
      quantity: 1,
      unitPricePHP: 6800,
      totalPricePHP: 6800,
      customer: {
        fullName: 'Daniel Navarro',
        mobile: '0917-665-2190',
        email: 'daniel.n@example.ph',
        notes: 'Will pick up before his 6PM match.'
      },
      orderStatus: 'Ready for Pickup',
      paymentStatus: 'Paid',
      paymentMethod: 'GCASH_MOCK',
      fulfillmentType: 'VENUE_PICKUP',
      pickupLocation: 'PADDLE TOP Club House & Pro Desk',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'order-02',
      orderCode: 'PT-PDL-88325',
      productId: 'pdl-02',
      productName: 'PT Sample Paddle Velocity',
      productSeries: 'Velocity Series',
      quantity: 1,
      unitPricePHP: 5900,
      totalPricePHP: 5900,
      customer: {
        fullName: 'Katrina Flores',
        mobile: '0920-441-8899',
        email: 'kat.flores@example.ph'
      },
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'CARD_MOCK',
      fulfillmentType: 'VENUE_PICKUP',
      pickupLocation: 'PADDLE TOP Club House & Pro Desk',
      createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
    },
    {
      id: 'order-03',
      orderCode: 'PT-PDL-88301',
      productId: 'pdl-03',
      productName: 'PT Sample Paddle Tour Carbon',
      productSeries: 'Tour Series',
      quantity: 1,
      unitPricePHP: 7400,
      totalPricePHP: 7400,
      customer: {
        fullName: 'Marco De Jesus',
        mobile: '0917-332-9011',
        email: 'marco.dj@example.ph'
      },
      orderStatus: 'Completed',
      paymentStatus: 'Paid',
      paymentMethod: 'VENUE_COUNTER',
      fulfillmentType: 'VENUE_PICKUP',
      pickupLocation: 'PADDLE TOP Club House & Pro Desk',
      createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
    }
  ];
}

// Service implementation
export const adminService = {
  // --- VENUE SETTINGS ---
  getSettings(): AdminVenueSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed reading settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  },

  updateSettings(newSettings: Partial<AdminVenueSettings>): AdminVenueSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed saving settings to storage', e);
    }
    return updated;
  },

  // --- RESERVATIONS ---
  getReservations(): AdminReservation[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed reading reservations from storage', e);
    }
    const defaults = seedDefaultReservations();
    this.saveReservations(defaults);
    return defaults;
  },

  saveReservations(reservations: AdminReservation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    } catch (e) {
      console.error('Failed saving reservations to storage', e);
    }
  },

  updateReservationStatus(reservationId: string, newStatus: ReservationStatus): AdminReservation | null {
    const list = this.getReservations();
    const idx = list.findIndex(r => r.id === reservationId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: newStatus
    };
    this.saveReservations(list);
    return list[idx];
  },

  // --- CLOSURES ---
  getClosures(): CourtClosure[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLOSURES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed reading closures from storage', e);
    }
    const defaults = seedDefaultClosures();
    this.saveClosures(defaults);
    return defaults;
  },

  saveClosures(closures: CourtClosure[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOSURES, JSON.stringify(closures));
    } catch (e) {
      console.error('Failed saving closures to storage', e);
    }
  },

  addClosure(payload: Omit<CourtClosure, 'id' | 'createdAt' | 'active'>): { closure: CourtClosure; affectedReservations: AdminReservation[] } {
    const closures = this.getClosures();
    const newClosure: CourtClosure = {
      ...payload,
      id: `cls-${Date.now()}`,
      active: true,
      createdAt: new Date().toISOString()
    };
    closures.unshift(newClosure);
    this.saveClosures(closures);

    // Find affected bookings
    const affected = this.findReservationsOverlappingClosure(newClosure);
    return { closure: newClosure, affectedReservations: affected };
  },

  reopenCourt(closureId: string): void {
    const closures = this.getClosures();
    const updated = closures.map(c => {
      if (c.id === closureId) {
        return { ...c, active: false };
      }
      return c;
    });
    this.saveClosures(updated);
  },

  findReservationsOverlappingClosure(closure: CourtClosure): AdminReservation[] {
    const reservations = this.getReservations();
    return reservations.filter(r => {
      if (r.status === 'cancelled' || r.status === 'completed') return false;
      if (closure.scope === 'single_court' && r.courtId !== closure.courtId) return false;
      if (r.date < closure.startDate || r.date > closure.endDate) return false;

      // Overlap in hours if same date
      const rStart = parseInt(r.startTime.split(':')[0], 10);
      const rEnd = parseInt(r.endTime.split(':')[0], 10);
      const cStart = parseInt(closure.startTime.split(':')[0], 10);
      const cEnd = parseInt(closure.endTime.split(':')[0], 10);

      return Math.max(rStart, cStart) < Math.min(rEnd, cEnd);
    });
  },

  // --- WALK-INS ---
  addWalkIn(params: {
    courtId: CourtId;
    hours: number;
    startTime: string; // "14:00"
    customerName: string;
    customerPhone: string;
    paymentMethod: AdminPaymentMethod;
    notes?: string;
  }): { success: boolean; reservation?: AdminReservation; error?: string } {
    const today = getTodayDateString();
    const courtName = `Court ${params.courtId.replace('court-', '')}`;
    const startHour = parseInt(params.startTime.split(':')[0], 10);
    const endHour = startHour + params.hours;
    const endTime = `${String(endHour).padStart(2, '0')}:00`;

    // Check if court is closed during this time
    const closures = this.getClosures().filter(c => c.active);
    const isClosed = closures.some(c => {
      if (c.scope === 'all_courts' || c.courtId === params.courtId) {
        if (today >= c.startDate && today <= c.endDate) {
          const cStart = parseInt(c.startTime.split(':')[0], 10);
          const cEnd = parseInt(c.endTime.split(':')[0], 10);
          return Math.max(startHour, cStart) < Math.min(endHour, cEnd);
        }
      }
      return false;
    });

    if (isClosed) {
      return { success: false, error: `${courtName} is closed for maintenance during this time.` };
    }

    // Check overlapping bookings on same court
    const reservations = this.getReservations();
    const overlap = reservations.some(r => {
      if (r.courtId !== params.courtId || r.date !== today) return false;
      if (r.status === 'cancelled') return false;
      const rStart = parseInt(r.startTime.split(':')[0], 10);
      const rEnd = parseInt(r.endTime.split(':')[0], 10);
      return Math.max(startHour, rStart) < Math.min(endHour, rEnd);
    });

    if (overlap) {
      return { success: false, error: `${courtName} already has a reservation between ${formatTimeDisplay(params.startTime)} and ${formatTimeDisplay(endTime)}.` };
    }

    const rate = this.getSettings().courtHourlyRatePHP;
    const amount = rate * params.hours;
    const refCode = `PT-W-${Math.floor(100 + Math.random() * 900)}`;

    const newReservation: AdminReservation = {
      id: `res-walkin-${Date.now()}`,
      referenceCode: refCode,
      courtId: params.courtId,
      courtName,
      date: today,
      startTime: params.startTime,
      endTime,
      displayTimeWindow: `${formatTimeDisplay(params.startTime)} – ${formatTimeDisplay(endTime)}`,
      hours: params.hours,
      customerName: `${params.customerName} (Walk-in)`,
      customerPhone: params.customerPhone,
      playerType: 'walk-in',
      amountPaidPHP: amount,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'paid',
      status: 'active',
      notes: params.notes || 'Immediate walk-in entry checked in at desk.',
      createdAt: new Date().toISOString()
    };

    reservations.unshift(newReservation);
    this.saveReservations(reservations);

    // Record transaction
    this.recordTransaction({
      type: 'walk_in',
      typeLabel: 'Walk-In Court Session',
      description: `${courtName} · ${formatTimeDisplay(params.startTime)} – ${formatTimeDisplay(endTime)} (${params.hours} hr${params.hours > 1 ? 's' : ''})`,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      amountPHP: amount,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'paid',
      relatedReference: refCode
    });

    return { success: true, reservation: newReservation };
  },

  // --- SESSION EXTENSION ---
  checkExtensionAvailability(reservationId: string, hoursToAdd: number = 1): {
    available: boolean;
    reason?: string;
    nextStartTime?: string;
    nextEndTime?: string;
    extraCostPHP?: number;
  } {
    const reservations = this.getReservations();
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return { available: false, reason: 'Reservation not found.' };

    const endHour = parseInt(res.endTime.split(':')[0], 10);
    const newEndHour = endHour + hoursToAdd;

    if (newEndHour > 23) {
      return { available: false, reason: 'Club closes at 11:00 PM. Session cannot extend past closing hours.' };
    }

    const proposedStartTime = res.endTime;
    const proposedEndTime = `${String(newEndHour).padStart(2, '0')}:00`;

    // Check closures
    const closures = this.getClosures().filter(c => c.active);
    const isClosed = closures.some(c => {
      if (c.scope === 'all_courts' || c.courtId === res.courtId) {
        if (res.date >= c.startDate && res.date <= c.endDate) {
          const cStart = parseInt(c.startTime.split(':')[0], 10);
          const cEnd = parseInt(c.endTime.split(':')[0], 10);
          return Math.max(endHour, cStart) < Math.min(newEndHour, cEnd);
        }
      }
      return false;
    });

    if (isClosed) {
      return {
        available: false,
        reason: `${res.courtName} has a scheduled maintenance closure starting at ${formatTimeDisplay(proposedStartTime)}.`
      };
    }

    // Check subsequent reservation on same court
    const conflict = reservations.find(r => {
      if (r.id === res.id) return false;
      if (r.courtId !== res.courtId || r.date !== res.date) return false;
      if (r.status === 'cancelled' || r.status === 'completed') return false;

      const rStart = parseInt(r.startTime.split(':')[0], 10);
      const rEnd = parseInt(r.endTime.split(':')[0], 10);
      return Math.max(endHour, rStart) < Math.min(newEndHour, rEnd);
    });

    if (conflict) {
      return {
        available: false,
        reason: `${res.courtName} is already booked by ${conflict.customerName} (${conflict.referenceCode}) starting at ${formatTimeDisplay(conflict.startTime)}.`
      };
    }

    const hourlyRate = this.getSettings().courtHourlyRatePHP;
    return {
      available: true,
      nextStartTime: proposedStartTime,
      nextEndTime: proposedEndTime,
      extraCostPHP: hourlyRate * hoursToAdd
    };
  },

  extendSession(reservationId: string, hoursToAdd: number = 1, paymentMethod: AdminPaymentMethod = 'CASH'): {
    success: boolean;
    reservation?: AdminReservation;
    error?: string;
  } {
    const check = this.checkExtensionAvailability(reservationId, hoursToAdd);
    if (!check.available || !check.nextEndTime) {
      return { success: false, error: check.reason || 'Cannot extend session.' };
    }

    const reservations = this.getReservations();
    const idx = reservations.findIndex(r => r.id === reservationId);
    if (idx === -1) return { success: false, error: 'Reservation not found.' };

    const oldRes = reservations[idx];
    const updatedRes: AdminReservation = {
      ...oldRes,
      endTime: check.nextEndTime,
      hours: oldRes.hours + hoursToAdd,
      displayTimeWindow: `${formatTimeDisplay(oldRes.startTime)} – ${formatTimeDisplay(check.nextEndTime)}`,
      amountPaidPHP: oldRes.amountPaidPHP + (check.extraCostPHP || 0),
      notes: `${oldRes.notes || ''} [Extended +${hoursToAdd}hr at desk]`.trim()
    };

    reservations[idx] = updatedRes;
    this.saveReservations(reservations);

    // Record extension transaction
    this.recordTransaction({
      type: 'court_extension',
      typeLabel: 'Session Extension',
      description: `${updatedRes.courtName} Extended (+${hoursToAdd} hr) until ${formatTimeDisplay(check.nextEndTime)}`,
      customerName: updatedRes.customerName,
      customerPhone: updatedRes.customerPhone,
      amountPHP: check.extraCostPHP || 0,
      paymentMethod,
      paymentStatus: 'paid',
      relatedReference: updatedRes.referenceCode
    });

    return { success: true, reservation: updatedRes };
  },

  // --- COURTS REALTIME STATUS (TODAY) ---
  getCourtsStatusToday(): CourtStatusCardData[] {
    const today = getTodayDateString();
    const reservations = this.getReservations().filter(r => r.date === today && r.status !== 'cancelled');
    const closures = this.getClosures().filter(c => c.active && today >= c.startDate && today <= c.endDate);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinutes;

    const courtIds: CourtId[] = ['court-1', 'court-2', 'court-3', 'court-4'];

    return courtIds.map((courtId, index) => {
      const courtNum = index + 1;
      const courtName = `Court ${courtNum}`;

      // Check active closure
      const activeClosure = closures.find(c => {
        if (c.scope === 'all_courts' || c.courtId === courtId) {
          const startMin = parseInt(c.startTime.split(':')[0], 10) * 60;
          const endMin = parseInt(c.endTime.split(':')[0], 10) * 60;
          return currentTotalMinutes >= startMin && currentTotalMinutes < endMin;
        }
        return false;
      });

      if (activeClosure) {
        return {
          courtId,
          courtName,
          status: 'closed',
          statusLabel: 'CLOSED',
          activeClosure
        };
      }

      // Check current session
      const currentRes = reservations.find(r => {
        if (r.courtId !== courtId) return false;
        if (r.status === 'completed' || r.status === 'no_show') return false;
        const startMin = parseInt(r.startTime.split(':')[0], 10) * 60;
        const endMin = parseInt(r.endTime.split(':')[0], 10) * 60;
        return currentTotalMinutes >= startMin && currentTotalMinutes < endMin;
      });

      // Find upcoming session today after now
      const upcomingRes = reservations
        .filter(r => {
          if (r.courtId !== courtId) return false;
          if (r.status === 'completed' || r.status === 'no_show') return false;
          const startMin = parseInt(r.startTime.split(':')[0], 10) * 60;
          return startMin >= currentTotalMinutes;
        })
        .sort((a, b) => {
          const aMin = parseInt(a.startTime.split(':')[0], 10);
          const bMin = parseInt(b.startTime.split(':')[0], 10);
          return aMin - bMin;
        })[0];

      if (currentRes) {
        const endMin = parseInt(currentRes.endTime.split(':')[0], 10) * 60;
        const minutesRemaining = Math.max(0, endMin - currentTotalMinutes);
        const isEndingSoon = minutesRemaining <= 15;

        // Gap to next
        let gapMinutes: number | undefined;
        if (upcomingRes) {
          const nextStartMin = parseInt(upcomingRes.startTime.split(':')[0], 10) * 60;
          gapMinutes = Math.max(0, nextStartMin - endMin);
        }

        return {
          courtId,
          courtName,
          status: isEndingSoon ? 'ending_soon' : 'active',
          statusLabel: isEndingSoon ? 'ENDING SOON' : 'ACTIVE',
          currentSession: {
            reservationId: currentRes.id,
            referenceCode: currentRes.referenceCode,
            customerName: currentRes.customerName,
            customerPhone: currentRes.customerPhone,
            type: currentRes.playerType,
            startTime: currentRes.startTime,
            endTime: currentRes.endTime,
            displayTimeWindow: currentRes.displayTimeWindow,
            durationHours: currentRes.hours,
            minutesRemaining,
            paidAmountPHP: currentRes.amountPaidPHP,
            paymentMethod: currentRes.paymentMethod
          },
          nextSession: upcomingRes
            ? {
                reservationId: upcomingRes.id,
                referenceCode: upcomingRes.referenceCode,
                customerName: upcomingRes.customerName,
                startTime: upcomingRes.startTime,
                endTime: upcomingRes.endTime,
                displayTimeWindow: upcomingRes.displayTimeWindow
              }
            : undefined,
          gapMinutes
        };
      }

      // If no current session, is there an upcoming session?
      let gapMinutes: number | undefined;
      if (upcomingRes) {
        const nextStartMin = parseInt(upcomingRes.startTime.split(':')[0], 10) * 60;
        gapMinutes = Math.max(0, nextStartMin - currentTotalMinutes);
      }

      return {
        courtId,
        courtName,
        status: 'available',
        statusLabel: 'AVAILABLE',
        nextSession: upcomingRes
          ? {
              reservationId: upcomingRes.id,
              referenceCode: upcomingRes.referenceCode,
              customerName: upcomingRes.customerName,
              startTime: upcomingRes.startTime,
              endTime: upcomingRes.endTime,
              displayTimeWindow: upcomingRes.displayTimeWindow
            }
          : undefined,
        gapMinutes
      };
    });
  },

  // --- HOURLY TIMELINE SCHEDULE (TODAY) ---
  getHourlyScheduleToday(): { hours: string[]; courts: { courtId: CourtId; courtName: string; blocks: HourlyScheduleBlock[] }[] } {
    const today = getTodayDateString();
    const reservations = this.getReservations().filter(r => r.date === today && r.status !== 'cancelled');
    const closures = this.getClosures().filter(c => c.active && today >= c.startDate && today <= c.endDate);

    const hoursList: string[] = [];
    for (let h = 6; h <= 22; h++) {
      hoursList.push(`${String(h).padStart(2, '0')}:00`);
    }

    const courtIds: CourtId[] = ['court-1', 'court-2', 'court-3', 'court-4'];

    const courts = courtIds.map((courtId, idx) => {
      const courtName = `Court ${idx + 1}`;
      const blocks: HourlyScheduleBlock[] = hoursList.map(hourStr => {
        const h = parseInt(hourStr.split(':')[0], 10);
        const nextH = h + 1;
        const endTimeStr = `${String(nextH).padStart(2, '0')}:00`;
        const displayLabel = formatTimeDisplay(hourStr);

        // Check closure
        const activeClosure = closures.find(c => {
          if (c.scope === 'all_courts' || c.courtId === courtId) {
            const cStart = parseInt(c.startTime.split(':')[0], 10);
            const cEnd = parseInt(c.endTime.split(':')[0], 10);
            return h >= cStart && h < cEnd;
          }
          return false;
        });

        if (activeClosure) {
          return {
            courtId,
            time: hourStr,
            endTime: endTimeStr,
            displayLabel,
            status: 'closed',
            closure: activeClosure
          };
        }

        // Check reservation
        const res = reservations.find(r => {
          if (r.courtId !== courtId) return false;
          const rStart = parseInt(r.startTime.split(':')[0], 10);
          const rEnd = parseInt(r.endTime.split(':')[0], 10);
          return h >= rStart && h < rEnd;
        });

        if (res) {
          return {
            courtId,
            time: hourStr,
            endTime: endTimeStr,
            displayLabel,
            status: res.playerType === 'walk-in' ? 'walk_in' : 'booked_online',
            reservation: res
          };
        }

        return {
          courtId,
          time: hourStr,
          endTime: endTimeStr,
          displayLabel,
          status: 'available'
        };
      });

      return { courtId, courtName, blocks };
    });

    return { hours: hoursList, courts };
  },

  // --- TRANSACTIONS ---
  getTransactions(): AdminTransaction[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed reading transactions from storage', e);
    }
    const defaults = seedDefaultTransactions();
    this.saveTransactions(defaults);
    return defaults;
  },

  saveTransactions(transactions: AdminTransaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed saving transactions to storage', e);
    }
  },

  recordTransaction(entry: Omit<AdminTransaction, 'id' | 'transactionCode' | 'timestamp'>): AdminTransaction {
    const transactions = this.getTransactions();
    const newTxn: AdminTransaction = {
      ...entry,
      id: `txn-${Date.now()}`,
      transactionCode: `TXN-PT-${Math.floor(2000 + Math.random() * 8000)}`,
      timestamp: new Date().toISOString()
    };
    transactions.unshift(newTxn);
    this.saveTransactions(transactions);
    return newTxn;
  },

  // --- PADDLE INVENTORY & ORDERS ---
  getPaddleInventory(): PaddleProduct[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PADDLES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed reading paddle inventory from storage', e);
    }
    this.savePaddleInventory(INITIAL_PADDLES);
    return INITIAL_PADDLES;
  },

  savePaddleInventory(paddles: PaddleProduct[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PADDLES, JSON.stringify(paddles));
    } catch (e) {
      console.error('Failed saving paddle inventory to storage', e);
    }
  },

  updatePaddleStock(productId: string, newStock: number): PaddleProduct | null {
    const list = this.getPaddleInventory();
    const idx = list.findIndex(p => p.id === productId);
    if (idx === -1) return null;

    const clampedStock = Math.max(0, newStock);
    const updatedStatus = clampedStock === 0 ? 'SOLD_OUT' : clampedStock <= 4 ? 'LOW_STOCK' : 'IN_STOCK';

    list[idx] = {
      ...list[idx],
      stockQuantity: clampedStock,
      stockStatus: updatedStatus
    };
    this.savePaddleInventory(list);
    return list[idx];
  },

  savePaddleProduct(paddle: PaddleProduct): void {
    const list = this.getPaddleInventory();
    const idx = list.findIndex(p => p.id === paddle.id);
    if (idx >= 0) {
      list[idx] = paddle;
    } else {
      list.push(paddle);
    }
    this.savePaddleInventory(list);
  },

  getPaddleOrders(): PaddleOrder[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed reading paddle orders from storage', e);
    }
    const defaults = seedDefaultPaddleOrders();
    this.savePaddleOrders(defaults);
    return defaults;
  },

  savePaddleOrders(orders: PaddleOrder[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed saving paddle orders to storage', e);
    }
  },

  updatePaddleOrderStatus(orderId: string, status: OrderStatus): PaddleOrder | null {
    const orders = this.getPaddleOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    orders[idx] = {
      ...orders[idx],
      orderStatus: status,
      paymentStatus: status === 'Cancelled' ? 'Refunded' : orders[idx].paymentStatus
    };
    this.savePaddleOrders(orders);
    return orders[idx];
  },

  // --- ANALYTICS SUMMARY ---
  getAnalytics(range: 'today' | '7days' | '30days' = 'today') {
    const today = getTodayDateString();
    const transactions = this.getTransactions();
    const reservations = this.getReservations();
    const paddleOrders = this.getPaddleOrders();

    // Filter by date range
    let filteredTxns = transactions;
    if (range === 'today') {
      filteredTxns = transactions.filter(t => t.timestamp.startsWith(today));
    } else if (range === '7days') {
      const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
      filteredTxns = transactions.filter(t => t.timestamp >= cutoff);
    } else {
      const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
      filteredTxns = transactions.filter(t => t.timestamp >= cutoff);
    }

    const totalRevenuePHP = filteredTxns
      .filter(t => t.paymentStatus === 'paid')
      .reduce((sum, t) => sum + t.amountPHP, 0);

    const courtRevenuePHP = filteredTxns
      .filter(t => t.paymentStatus === 'paid' && (t.type === 'court_booking' || t.type === 'walk_in' || t.type === 'court_extension'))
      .reduce((sum, t) => sum + t.amountPHP, 0);

    const paddleRevenuePHP = filteredTxns
      .filter(t => t.paymentStatus === 'paid' && t.type === 'paddle_sale')
      .reduce((sum, t) => sum + t.amountPHP, 0);

    // Court utilization across today
    const todayReservations = reservations.filter(r => r.date === today && r.status !== 'cancelled');
    const courtHoursMap: Record<CourtId, number> = {
      'court-1': 0,
      'court-2': 0,
      'court-3': 0,
      'court-4': 0
    };

    todayReservations.forEach(r => {
      courtHoursMap[r.courtId] = (courtHoursMap[r.courtId] || 0) + r.hours;
    });

    // 17 operating hours per court (06:00 to 23:00)
    const operationalHoursPerDay = 17;
    const courtUtilization = (['court-1', 'court-2', 'court-3', 'court-4'] as CourtId[]).map((cId, idx) => {
      const playedHours = courtHoursMap[cId];
      const rate = Math.min(100, Math.round((playedHours / operationalHoursPerDay) * 100));
      return {
        courtId: cId,
        courtName: `Court ${idx + 1}`,
        hoursPlayed: playedHours,
        totalCapacityHours: operationalHoursPerDay,
        percentage: rate
      };
    });

    const averageCourtUtilization = Math.round(
      courtUtilization.reduce((sum, c) => sum + c.percentage, 0) / courtUtilization.length
    );

    // Hourly peak distribution
    const hourlyDistribution: { hour: string; label: string; count: number }[] = [];
    for (let h = 6; h <= 22; h++) {
      const hStr = `${String(h).padStart(2, '0')}:00`;
      const matches = todayReservations.filter(r => {
        const start = parseInt(r.startTime.split(':')[0], 10);
        const end = parseInt(r.endTime.split(':')[0], 10);
        return h >= start && h < end;
      }).length;
      hourlyDistribution.push({
        hour: hStr,
        label: formatTimeDisplay(hStr),
        count: matches
      });
    }

    return {
      range,
      totalRevenuePHP,
      courtRevenuePHP,
      paddleRevenuePHP,
      transactionsCount: filteredTxns.length,
      averageCourtUtilization,
      courtUtilization,
      hourlyDistribution,
      completedSessionsCount: reservations.filter(r => r.status === 'completed' || r.status === 'active').length,
      topPaddleName: 'PT Sample Paddle Alpha'
    };
  },

  // --- RESET DEMO DATA ---
  resetAllDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.CLOSURES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PADDLES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
  }
};
