export type CartItemDiscount = { source?: string; amount: number };

export type CartItemDimensions = {
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
};

export type CartItem = {
  id: string;
  sku: string;
  productId?: string;
  name?: string;
  image?: string;
  variant?: Record<string, string>;
  quantity: number;
  unitPrice: number;
  listPrice?: number;
  discounts: CartItemDiscount[];
  weightGrams?: number;
  dimensions?: CartItemDimensions;
  total: number;
};

export type Cart = {
  id?: string;
  _id?: string;
  userId?: string;
  status: 'active' | 'locked' | 'converted' | 'canceled';
  currency: string;
  locale: string;

  items: CartItem[];

  itemsSubtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;

  coupons: string[];

  shippingAddress?: Record<string, any>;
  shipping?: {
    serviceCode: string;
    label: string;
    amount: number;
    days?: number;
    eta?: string;
    isFree?: boolean;
  };

  version: number;
  createdAt?: string;
  updatedAt?: string;
};

export type QuoteResult = {
  postalCode: string;
  quotes: Array<{
    serviceCode: string;
    label: string;
    amount: number;
    days: number;
    eta?: string;
    isFree?: boolean;
    source?: string;
  }>;
};

export type PrepareCheckoutResult = {
  orderDraftId: string;
  cart: Cart;
};

export type DimensionsInput = { length?: number; width?: number; height?: number };

export type AddItemInput = {
  sku: string;
  quantity: number;
  variant?: Record<string, string>;
  weightGrams?: number;
  dimensions?: DimensionsInput;
};

export type UpdateItemInput = {
  quantity?: number;
  variant?: Record<string, string>;
};

export type ShippingQuoteInput = { address: Record<string, any> };

export type ShippingSelectInput = {
  serviceCode: string;
  address?: Record<string, any>;
};
