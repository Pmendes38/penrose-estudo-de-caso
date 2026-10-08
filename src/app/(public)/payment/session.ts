'use server';

import 'server-only';
import { cookies } from 'next/headers';

export type CheckoutSession = {
  customerData?: Record<string, any> | null;
  selectedShipping?: Record<string, any> | null;
  couponCode?: string | null;
  draftId?: string | null;
};

const COOKIE_KEY = 'checkout_session';

export async function getCheckoutSession(): Promise<CheckoutSession> {
  const raw = cookies().get(COOKIE_KEY)?.value;
  if (!raw) return {};
  try {
    const str = (() => {
      try { return decodeURIComponent(raw); } catch { return raw; }
    })();
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === 'object') {
      const safe: CheckoutSession = {
        customerData: parsed.customerData ?? null,
        selectedShipping: parsed.selectedShipping ?? null,
        couponCode: typeof parsed.couponCode === 'string' ? parsed.couponCode : null,
        draftId: typeof parsed.draftId === 'string' ? parsed.draftId : null,
      };
      return safe;
    }
    return {};
  } catch {
    return {};
  }
}
