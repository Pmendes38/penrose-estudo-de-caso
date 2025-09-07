'use client';

import { useMemo, useState } from 'react';
import ShippingSelector from './ShippingSelector';
import type { CalculateShippingInput, ShippingQuote } from '../schemas';

export default function ProductShippingWidget() {
  const [cep, setCep] = useState('');
  const [selected, setSelected] = useState<ShippingQuote | null>(null);

  const input: CalculateShippingInput | null = useMemo(() => {
    if (!cep) return null;
    return {
      destination: { postalCode: cep },
      packages: [{ weightKg: 0.5, widthCm: 20, heightCm: 10, lengthCm: 20 }],
      cartTotal: undefined,
      preferCheapest: true,
    };
  }, [cep]);

  return (
    <div className="p-4 border border-brand-gray-border rounded">
      <div className="flex gap-2 mb-3">
        <input
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          placeholder="Seu CEP"
          className="flex-1 bg-brand-black border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light"
        />
      </div>

      <ShippingSelector input={input} onSelect={setSelected} />
    </div>
  );
}
