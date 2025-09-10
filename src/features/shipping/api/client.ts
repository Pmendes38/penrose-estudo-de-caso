'use client';

export async function validatePostalCode(postalCode: string) {
  const res = await fetch('/api/v1/shipping/validate-postal-code', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ postalCode }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'CEP inválido');
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
  return json;
}

export async function trackShipment(trackingCode: string) {
  const res = await fetch('/api/v1/shipping/track', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ trackingCode }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Falha ao rastrear pedido');
  return json as {
    trackingCode: string;
    status: string;
    lastUpdate: string;
    history: Array<any>;
  };
}

export async function listShippingServices() {
  const res = await fetch('/api/v1/shipping/services', { method: 'GET', next: { revalidate: 3600 } });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Falha ao listar serviços');
  return json as Array<{ id: string; name: string; company: { name: string } }>;
}
