'use client';
import { useMemo, useState } from 'react';
import ShippingSelector from './ShippingSelector';
import type { CalculateShippingInput } from '../schemas';
import { formatBRL } from '@/shared/lib/format';
import { formatCep, isValidCep } from '@/features/shipping/lib/cep';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

export default function ShippingPlayground() {
  const [rawCep, setRawCep] = useState('');
  const [preferCheapest, setPreferCheapest] = useState(true);
  const [cartTotal, setCartTotal] = useState<number | ''>('');
  const [pkg, setPkg] = useState({ weightKg: 0.5, widthCm: 20, heightCm: 10, lengthCm: 20, declaredValue: 0 });

  const cep = formatCep(rawCep);
  const debouncedCep = useDebouncedValue(cep, 400);

  const validCep = isValidCep(debouncedCep);
  const input: CalculateShippingInput | null = useMemo(() => {
    if (!validCep) return null;
    return {
      destination: { postalCode: debouncedCep },
      packages: [pkg],
      preferCheapest,
      cartTotal: typeof cartTotal === 'number' ? cartTotal : undefined,
    };
  }, [debouncedCep, pkg, preferCheapest, cartTotal, validCep]);

  return (
    <div className="space-y-4 rounded-xl border border-brand-gray-border p-4 bg-brand-gray-dark/40">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-brand-gray">CEP</span>
          <input
            value={cep}
            onChange={(e) => setRawCep(e.target.value)}
            placeholder="00000-000"
            inputMode="numeric"
            className="bg-brand-black border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-brand-gray">Valor declarado</span>
          <input
            type="number"
            value={pkg.declaredValue}
            onChange={(e) => setPkg({ ...pkg, declaredValue: Number(e.target.value || 0) })}
            min={0}
            step={1}
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

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={preferCheapest}
            onChange={(e) => setPreferCheapest(e.target.checked)}
          />
          <span className="text-sm text-brand-gray">Preferir a opção mais barata</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm text-brand-gray">Total do carrinho (para frete grátis)</span>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={cartTotal}
            onChange={(e) => setCartTotal(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-brand-black border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light w-40"
          />
        </label>
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
