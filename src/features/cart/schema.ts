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
  unitPrice: number; // centavos
  listPrice?: number;
  discounts: CartItemDiscount[];
  weightGrams?: number;
  dimensions?: CartItemDimensions;
  total: number; // centavos
};

export type Cart = {
  id?: string;
  _id?: string;
  userId?: string;
  status: 'active' | 'locked' | 'converted' | 'canceled';
  currency: string;
  locale: string;

  items: CartItem[];

  itemsSubtotal: number; // centavos
  discountTotal: number; // centavos
  shippingTotal: number; // centavos
  taxTotal: number;      // centavos
  grandTotal: number;    // centavos

  coupons: string[];

  shippingAddress?: Record<string, any>;
  shipping?: {
    serviceCode: string;
    label: string;
    amount: number; // centavos
    days?: number;
    eta?: string;
    isFree?: boolean;
    provider?: 'melhor-envio';
    me?: {
      serviceId?: string;
      companyId?: string;
      agencyId?: string;
      fromPostal?: string; // dígitos
      toPostal?: string;   // dígitos
      options?: {
        insurance_value?: number;
        receipt?: boolean;
        own_hand?: boolean;
        non_commercial?: boolean;
        invoice_key?: string;
        platform?: string;
        tags?: Array<{ tag: string; url?: string }>;
      };
      volumes?: Array<{ height: number; width: number; length: number; weight: number }>;
      products?: Array<{ name: string; quantity: number; unitary_value: number; weight?: number }>;
    };
  };

  version: number;
  createdAt?: string;
  updatedAt?: string;
};

export type QuoteResult = {
  postalCode: string; // 8 dígitos
  quotes: Array<{
    serviceCode: string;
    label: string;
    amount: number; // centavos
    days: number;
    eta?: string;
    isFree?: boolean;
    source?: string;
    me?: {
      companyId?: string;
      requiresAgency?: boolean;
    };
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

export type TagInput = { tag: string; url?: string };

export type ShippingSelectInput = {
  serviceCode: string;
  address?: Record<string, any>;
  // Novos campos para Melhor Envio
  nonCommercial?: boolean;
  invoiceKey?: string;
  agencyId?: string;
  receipt?: boolean;
  ownHand?: boolean;
  platform?: string;
  tags?: TagInput[];
};
