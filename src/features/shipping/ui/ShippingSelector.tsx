// src/features/shipping/ui/ShippingSelector.tsx
'use client';

import { useEffect } from 'react';
import type { CalculateShippingInput, ShippingQuote } from '../schemas';
import { useShippingQuotes } from '../hooks/useShippingQuotes';

type Props = {
  input: CalculateShippingInput | null; // você monta a partir do CEP + pacote do carrinho
  onSelect?: (q: ShippingQuote | null) => void;
};

export default function ShippingSelector({ input, onSelect }: Props) {
  const { state, selected, setSelected, isPending, fetchTransition } = useShippingQuotes();

  useEffect(() => {
    if (input) fetchTransition(input);
  }, [JSON.stringify(input)]); // memo simples; na prática use um objeto memozado

  useEffect(() => {
    onSelect?.(selected);
  }, [selected]);

  if (!input) {
    return <p className="text-sm text-brand-gray">Informe CEP e itens para calcular frete.</p>;
  }

  if (state.status === 'loading' || isPending) {
    return <p className="text-sm text-brand-gray">Calculando frete…</p>;
  }

  if (state.status === 'error') {
    return <p className="text-sm text-red-400">{state.message}</p>;
  }

  if (state.status === 'success' && state.quotes.length === 0) {
    return <p className="text-sm text-brand-gray">Nenhuma opção de frete encontrada.</p>;
  }

  return (
    <div className="space-y-2">
      {state.status === 'success' && state.quotes.map((q) => {
        const id = `ship_${q.id}`;
        return (
          <label key={q.id} htmlFor={id} className="flex items-center gap-3 p-3 rounded border border-brand-gray-border hover:bg-brand-gray/20">
            <input
              id={id}
              type="radio"
              name="shippingOption"
              checked={selected?.id === q.id}
              onChange={() => setSelected(q)}
              className="accent-brand-blue"
            />
            <div className="flex-1">
              <div className="font-medium">
                {q.name} • {q.company.name}
              </div>
              <div className="text-sm text-brand-gray">
                {q.description ?? `${q.deliveryDays} dias úteis`} • ETA {q.etaDate ? new Date(q.etaDate).toLocaleDateString('pt-BR') : '—'}
              </div>
            </div>
            <div className="font-semibold">
              {(q.priceBRL).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              {q.isFree && <span className="ml-2 text-xs bg-green-900/40 border border-green-700 px-2 py-0.5 rounded">Frete grátis</span>}
            </div>
          </label>
        );
      })}

      {/* Campo oculto para enviar no form (JSON) */}
      <input type="hidden" name="selectedShipping" value={selected ? JSON.stringify(selected) : ''} />
    </div>
  );
}
