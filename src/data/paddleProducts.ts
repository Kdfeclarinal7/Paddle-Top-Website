import { PaddleProduct, PaddleOrder } from '../types/paddle';

export const INITIAL_PADDLES: PaddleProduct[] = [
  {
    id: 'pdl-01',
    slug: 'sample-paddle-alpha',
    name: 'PT Sample Paddle Alpha',
    series: 'Pro Series',
    tagline: 'Balanced control and response (Demo model)',
    shortDescription: 'Sample paddle profile for frontend showcase and layout evaluation. Specifications and features are provisional.',
    description: 'This is a sample paddle model representing the PADDLE TOP equipment showcase. All technical details, materials, and pricing are provisional mock values for layout and flow evaluation.',
    pricePHP: 6800,
    stockQuantity: 12,
    stockStatus: 'IN_STOCK',
    visible: true,
    featured: true,
    specifications: {
      weight: 'TBD',
      surface: 'TBD',
      core: 'TBD',
      coreThickness: 'TBD',
      gripSize: 'TBD',
      shape: 'Standard (TBD)',
      balancePoint: 'TBD',
      playStyle: 'All-Around (TBD)'
    },
    themeColor: {
      face: '#0A1120',
      bezel: '#84CC16',
      accent: '#A3E635'
    }
  },
  {
    id: 'pdl-02',
    slug: 'sample-paddle-velocity',
    name: 'PT Sample Paddle Velocity',
    series: 'Velocity Series',
    tagline: 'Lightweight feel and fast maneuverability (Demo model)',
    shortDescription: 'Sample configuration tuned for hand speed. All specifications and features are provisional.',
    description: 'Sample paddle profile for frontend layout testing. Demonstrates dynamic stock and product detail rendering. Real specifications to be confirmed.',
    pricePHP: 5900,
    stockQuantity: 8,
    stockStatus: 'IN_STOCK',
    visible: true,
    featured: true,
    specifications: {
      weight: 'TBD',
      surface: 'TBD',
      core: 'TBD',
      coreThickness: 'TBD',
      gripSize: 'TBD',
      shape: 'Standard (TBD)',
      balancePoint: 'TBD',
      playStyle: 'Speed / Attack (TBD)'
    },
    themeColor: {
      face: '#0D1526',
      bezel: '#38BDF8',
      accent: '#84CC16'
    }
  },
  {
    id: 'pdl-03',
    slug: 'sample-paddle-tour',
    name: 'PT Sample Paddle Tour',
    series: 'Tour Series',
    tagline: 'Cushioned feedback and soft touch (Demo model)',
    shortDescription: 'Sample configuration for defensive play. Specifications, core structure, and weights are TBD.',
    description: 'Sample equipment showcase profile. Represents low-stock inventory state in the catalog. All specifications and pricing are provisional.',
    pricePHP: 6200,
    stockQuantity: 2,
    stockStatus: 'LOW_STOCK',
    visible: true,
    featured: false,
    specifications: {
      weight: 'TBD',
      surface: 'TBD',
      core: 'TBD',
      coreThickness: 'TBD',
      gripSize: 'TBD',
      shape: 'Standard (TBD)',
      balancePoint: 'TBD',
      playStyle: 'Tactical (TBD)'
    },
    themeColor: {
      face: '#0B132B',
      bezel: '#F59E0B',
      accent: '#84CC16'
    }
  },
  {
    id: 'pdl-04',
    slug: 'sample-paddle-club',
    name: 'PT Sample Paddle Club',
    series: 'Club Series',
    tagline: 'Everyday recreational configuration (Demo model)',
    shortDescription: 'Sample paddle entry for daily club play. Specifications and surface materials are provisional.',
    description: 'Sample entry-tier paddle profile. Demonstrates mid-range pricing and inventory counters. Specifications to be determined.',
    pricePHP: 3950,
    stockQuantity: 15,
    stockStatus: 'IN_STOCK',
    visible: true,
    featured: false,
    specifications: {
      weight: 'TBD',
      surface: 'TBD',
      core: 'TBD',
      coreThickness: 'TBD',
      gripSize: 'TBD',
      shape: 'Standard (TBD)',
      balancePoint: 'TBD',
      playStyle: 'Recreational (TBD)'
    },
    themeColor: {
      face: '#111827',
      bezel: '#84CC16',
      accent: '#F8FAFC'
    }
  },
  {
    id: 'pdl-05',
    slug: 'sample-paddle-limited',
    name: 'PT Sample Paddle Limited',
    series: 'Limited Edition',
    tagline: 'Limited run demonstration profile (Demo model)',
    shortDescription: 'Sample paddle profile demonstrating the sold-out state in the catalog and detail modal.',
    description: 'Sample model configured with 0 inventory to demonstrate sold-out catalog states and disabled reservation controls. Specifications are provisional.',
    pricePHP: 7400,
    stockQuantity: 0,
    stockStatus: 'SOLD_OUT',
    visible: true,
    featured: false,
    specifications: {
      weight: 'TBD',
      surface: 'TBD',
      core: 'TBD',
      coreThickness: 'TBD',
      gripSize: 'TBD',
      shape: 'Standard (TBD)',
      balancePoint: 'TBD',
      playStyle: 'TBD'
    },
    themeColor: {
      face: '#080C14',
      bezel: '#64748B',
      accent: '#84CC16'
    }
  },
  {
    id: 'pdl-hidden-test',
    slug: 'prototype-experimental-x',
    name: 'PT Lab Prototype X (Unreleased)',
    series: 'Pro Series',
    tagline: 'Internal test model only',
    shortDescription: 'Development prototype omitted from public catalog.',
    description: 'Internal prototype paddle for filtering validation.',
    pricePHP: 9999,
    stockQuantity: 1,
    stockStatus: 'HIDDEN',
    visible: false,
    featured: false,
    specifications: {
      weight: 'TBD',
      surface: 'TBD',
      core: 'TBD',
      coreThickness: 'TBD',
      gripSize: 'TBD',
      shape: 'TBD',
      playStyle: 'TBD'
    },
    themeColor: {
      face: '#000000',
      bezel: '#FF0000',
      accent: '#FFFFFF'
    }
  }
];

// In-memory / localStorage order storage
const ORDERS_STORAGE_KEY = 'paddle_top_orders';

export const getStoredOrders = (): PaddleOrder[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const savePaddleOrder = (order: PaddleOrder): void => {
  if (typeof window === 'undefined') return;
  try {
    const orders = getStoredOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to store paddle order', err);
  }
};

export const generateOrderCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PT-PDL-${randomPart}`;
};
