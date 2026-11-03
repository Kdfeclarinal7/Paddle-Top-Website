export type CourtId = 'court-1' | 'court-2' | 'court-3' | 'court-4';

export interface Court {
  id: CourtId;
  name: string;
  shortLabel: string;
  description: string;
  imagePlaceholderId: string;
  pricingPlaceholder: string;
  imageCustomUrl?: string;
}

export interface VenueInfo {
  name: string;
  tagline: string;
  locationPlaceholder: string;
  addressPlaceholder: string;
  provisionalHours: string;
  contactChannels: {
    phone: string;
    facebook: string;
    messenger: string;
    mapsUrl: string;
  };
}

export type Theme = 'light' | 'dark';

