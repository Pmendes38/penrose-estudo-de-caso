'use client';

import React, { useMemo, useState } from 'react';
import { LoadingSpinner } from '@/shared/ui/loading';
import { api } from '@/shared/lib/http';
import { formatBRL } from '@/shared/lib/format';

type Props = {
  product: { id: string; name: string; weight?: number; length?: number; width?: number; height?: number };
  selectedSize?: { name?: string; label?: string; price: number };
  freeShippingMin?: number;
};

type ShippingOption = {
  id: string;
  name: string;
  price: number;
  company?: { name?: string };
  description?: string;
};

export default function ShippingCalculator({ product, selectedSize, freeShippingMin = 400 }: Props) {
  const [cep, setCep] = useState('');
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [calculated, setCalculated] = useState(false);

  const validCep = useMemo(() => /^\d{5}-?\d{3}$/.test(cep), [cep]);
  const numericCep = useMemo(() => cep.replace(/\D/g, ''), [cep]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(masked);
    if (calculated) {
      setCalculated(false);
      setOptions([]);
      setError('');
    }
  }

  async function calculate() {
    if (!validCep) return setError('Por favor, digite um CEP válido (00000-000)');
    if (!product || !selectedSize) return setError('Selecione um tamanho do produto');

    setLoading(true);
    setError('');
    setOptions([]);

    try {
      const payload = {
        cep: numericCep,
        product: {
          id: product.id,
          name: product.name,
          price: selectedSize.price,
          weight: product.weight ?? 1,
          length: product.length ?? 20,
          width: product.width ?? 15,
          height: product.height ?? 10,
          selectedSize,
        },
      };

      const result = await api<ShippingOption[]>('/api/shipping/calculate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (Array.isArray(result) && result.length) {
        setOptions(result);
        setCalculated(true);
      } else {
        setError('Não foi possível calcular o frete para este CEP');
      }
    } catch (e: any) {
      setError(e?.message || 'Erro ao calcular frete. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const infoFreeShipping = useMemo(() => {
    if (!selectedSize) return '';
    if (selectedSize.price >= freeShippingMin) return '🎉 Frete GRÁTIS neste produto!';
    const diff = freeShippingMin - selectedSize.price;
    return `Acima de ${formatBRL(freeShippingMin)} o frete é grátis. Faltam ${formatBRL(diff)}.`;
  }, [selectedSize, freeShippingMin]);

  return (
    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
      <h4 className="text-lg font-semibold text-white mb-3">🚚 Calcular Frete</h4>

      <div className="flex gap-2">
        <input
          type="text"
          value={cep}
          onChange={onChange}
          placeholder="Digite seu CEP (00000-000)"
          maxLength={9}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-blue transition-colors"
          disabled={loading}
          aria-invalid={!validCep && !!cep}
        />
        <button
          onClick={calculate}
          disabled={loading || !validCep}
          className="px-4 py-2 bg-brand-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Calculando…
            </>
          ) : (
            'Calcular'
          )}
        </button>
      </div>

      {error && <div className="mt-2 text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-2">{error}</div>}

      {calculated && options.length > 0 && (
        <div className="mt-3 space-y-2">
          <h5 className="text-sm font-medium text-gray-300">Opções de entrega para {cep}:</h5>
          {options.map((op, i) => (
            <div key={op.id ?? i} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
              <div className="flex justify-between">
                <span className="font-medium text-white">{op.name}</span>
                <span className="text-brand-blue font-bold">{op.price === 0 ? 'GRÁTIS' : formatBRL(op.price)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{op.company?.name ?? 'Transportadora'}</span>
                <span>{op.description ?? 'Prazo a confirmar'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-sm text-gray-400">💡 {infoFreeShipping}</p>
    </div>
  );
}
