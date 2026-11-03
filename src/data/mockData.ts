import type { Court, VenueInfo } from '../types';

export const COURTS: Court[] = [
  {
    id: 'court-1',
    name: 'Court 1',
    shortLabel: 'Court 1',
    description: 'Regulation court prepared for singles, doubles, and reservation bookings.',
    imagePlaceholderId: 'court-1',
    pricingPlaceholder: 'Hourly rate placeholder',
  },
  {
    id: 'court-2',
    name: 'Court 2',
    shortLabel: 'Court 2',
    description: 'Regulation court prepared for singles, doubles, and reservation bookings.',
    imagePlaceholderId: 'court-2',
    pricingPlaceholder: 'Hourly rate placeholder',
  },
  {
    id: 'court-3',
    name: 'Court 3',
    shortLabel: 'Court 3',
    description: 'Regulation court prepared for singles, doubles, and reservation bookings.',
    imagePlaceholderId: 'court-3',
    pricingPlaceholder: 'Hourly rate placeholder',
  },
  {
    id: 'court-4',
    name: 'Court 4',
    shortLabel: 'Court 4',
    description: 'Regulation court prepared for singles, doubles, and reservation bookings.',
    imagePlaceholderId: 'court-4',
    pricingPlaceholder: 'Hourly rate placeholder',
  },
];

export const VENUE_INFO: VenueInfo = {
  name: 'PADDLE TOP',
  tagline: 'Play. Compete. Connect.',
  locationPlaceholder: 'Venue Location (Placeholder), Philippines',
  addressPlaceholder: 'Venue Address (Placeholder)',
  provisionalHours: 'Operating hours configured per venue settings',
  contactChannels: {
    phone: '+63 000 000 0000',
    facebook: 'https://facebook.com',
    messenger: 'https://m.me',
    mapsUrl: 'https://maps.google.com',
  },
};

