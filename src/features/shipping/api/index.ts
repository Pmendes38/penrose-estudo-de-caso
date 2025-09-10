import { envServer } from '@/shared/lib/env.server';
import {
  CalculateShippingInput,
  CalculateShippingInputSchema,
  ShippingQuoteResponseSchema,
  ValidatePostalCodeResponseSchema,
  ShippingServiceSchema,
  TrackShipmentResponseSchema,
  type ShippingQuoteResponse,
  type ShippingService,
} from '../schemas';

const BASE = `${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/shipping`;

export async function validatePostalCode(postalCode: string) {
  const res = await fetch(`${BASE}/validate-postal-code`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postalCode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return ValidatePostalCodeResponseSchema.parse(await res.json());
}

export async function calculateShipping(input: CalculateShippingInput): Promise<ShippingQuoteResponse> {
  // valida tipagem antes de enviar
  CalculateShippingInputSchema.parse(input);
  const res = await fetch(`${BASE}/calculate`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  return ShippingQuoteResponseSchema.parse(await res.json());
}

export async function listShippingServices(): Promise<ShippingService[]> {
  // GET pode ser cacheado com revalidate (via fetch options)
  const res = await fetch(`${BASE}/services`, {
    method: 'GET',
    next: { revalidate: 60 * 60 }, // 1h
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data as unknown[]).map((s) => ShippingServiceSchema.parse(s));
}

export async function trackShipment(trackingCode: string) {
  const res = await fetch(`${BASE}/track`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackingCode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return TrackShipmentResponseSchema.parse(await res.json());
}

// opcional: demo
export async function demoCalculate(postalCode: string) {
  const url = new URL(`${BASE}/demo/calculate`);
  url.searchParams.set('postalCode', postalCode);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return ShippingQuoteResponseSchema.parse(await res.json());
}
