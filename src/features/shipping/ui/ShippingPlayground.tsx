// src/features/shipping/ui/ShippingPlayground.tsx
'use client';
import { useMemo, useState } from 'react';
import ShippingSelector from './ShippingSelector';
import type { CalculateShippingInput } from '../schemas';
import { formatBRL } from '@/shared/lib/format';

export default function ShippingPlayground() {
  const [cep, setCep] = useState('');
  const [pkg, setPkg] = useState({ weightKg: 0.5, widthCm: 20, heightCm: 10, lengthCm: 20, declaredValue: 0 });

  const validCep = /^\d{5}-?\d{3}$/.test(cep);
  const input: CalculateShippingInput | null = useMemo(() => {
    if (!validCep) return null;
    return {
      destination: { postalCode: cep },
      packages: [pkg],
      preferCheapest: true,
    };
  }, [cep, pkg, validCep]);

  return (
    <div className="space-y-4 rounded-xl border border-brand-gray-border p-4 bg-brand-gray-dark/40">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-brand-gray">CEP</span>
          <input
            value={cep}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, '').slice(0, 8);
              setCep(d.length > 5 ? `${d.slice(0,5)}-${d.slice(5)}` : d);
            }}
            placeholder="00000-000"
            className="bg-brand-black border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-brand-gray">Valor declarado</span>
          <input
            type="number"
            value={pkg.declaredValue}
            onChange={(e) => setPkg({ ...pkg, declaredValue: Number(e.target.value || 0) })}
            className="bg-brand-black border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        {(['weightKg','lengthCm','widthCm','heightCm'] as const).map((k) => (
          <label key={k} className="flex flex-col gap-1">
            <span className="text-sm text-brand-gray">
              {k === 'weightKg' ? 'Peso (kg)' : k === 'lengthCm' ? 'Compr. (cm)' : k === 'widthCm' ? 'Larg. (cm)' : 'Alt. (cm)'}
            </span>
            <input
              type="number"
              min={0}
              step={k === 'weightKg' ? 0.1 : 1}
              value={(pkg as any)[k]}
              onChange={(e) => setPkg({ ...pkg, [k]: Number(e.target.value || 0) } as any)}
              className="bg-brand-black border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light"
            />
          </label>
        ))}
      </div>

      <div className="text-sm text-brand-gray">
        Valor declarado atual: <span className="text-brand-gray-light">{formatBRL(pkg.declaredValue)}</span>
      </div>

      <div className="pt-2">
        <ShippingSelector input={input} />
      </div>
    </div>
  );
}
