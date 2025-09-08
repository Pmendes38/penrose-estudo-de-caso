'use client';

export async function validatePostalCode(postalCode: string) {
  const res = await fetch('/api/v1/shipping/validate-postal-code', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ postalCode }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'CEP inválido');
  // esperado: { valid: boolean, normalized?: string }
  return json as { valid: boolean; normalized?: string };
}

export async function calculateShipping(input: {
  destination: { postalCode: string };
  packages: Array<{ weightKg: number; widthCm: number; heightCm: number; lengthCm: number; declaredValue?: number }>;
  cartTotal?: number;
  preferCheapest?: boolean;
}) {
  const res = await fetch('/api/v1/shipping/calculate', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Falha ao calcular frete');
  // esperado: { source, quotes: ShippingQuote[], bestQuote?: ShippingQuote }
  return json;
}
