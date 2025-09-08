'use server';

import 'server-only';
import { cookies } from 'next/headers';

export type CheckoutSession = {
  customerData?: Record<string, any> | null;
  selectedShipping?: Record<string, any> | null;
  couponCode?: string | null;
};

const COOKIE_KEY = 'checkout_session_v1';

export async function getCheckoutSession(): Promise<CheckoutSession> {
  const raw = cookies().get(COOKIE_KEY)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CheckoutSession;
  } catch {
    return {};
  }
}
