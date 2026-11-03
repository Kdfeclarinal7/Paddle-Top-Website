export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'SOLD_OUT' | 'HIDDEN';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Ready for Pickup' | 'Completed' | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export type PaymentMethod = 'VENUE_COUNTER' | 'GCASH_MOCK' | 'CARD_MOCK';

export interface PaddleSpecification {
  weight: string;
  surface: string;
  core: string;
  gripSize: string;
  shape: string;
  coreThickness: string;
  balancePoint?: string;
  playStyle: string;
}

export interface PaddleProduct {
  id: string;
  slug: string;
  name: string;
  series: 'Pro Series' | 'Velocity Series' | 'Tour Series' | 'Club Series' | 'Limited Edition';
  tagline: string;
  shortDescription: string;
  description: string;
  pricePHP: number;
  stockQuantity: number;
  stockStatus: StockStatus;
  visible: boolean;
  featured: boolean;
  specifications: PaddleSpecification;
  themeColor: {
    face: string;
    bezel: string;
    accent: string;
  };
}

export interface PaddleOrderCustomer {
  fullName: string;
  mobile: string;
  email: string;
  notes?: string;
}

export interface PaddleOrder {
  id: string;
  orderCode: string; // PT-PDL-XXXXX
  productId: string;
  productName: string;
  productSeries: string;
  quantity: number;
  unitPricePHP: number;
  totalPricePHP: number;
  customer: PaddleOrderCustomer;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  fulfillmentType: 'VENUE_PICKUP';
  pickupLocation: string;
  createdAt: string;
}
