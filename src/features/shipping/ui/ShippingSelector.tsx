'use client';
import { useEffect, useMemo } from 'react';
import type { CalculateShippingInput, ShippingQuote } from '../schemas';
import { useShippingQuotes } from '../hooks/useShippingQuotes';
import { formatBRL } from '@/shared/lib/format';

type Props = {
  input: CalculateShippingInput | null;
  onSelect?: (q: ShippingQuote | null) => void;
};

export default function ShippingSelector({ input, onSelect }: Props) {
  const { state, selected, setSelected, isPending, fetchTransition } = useShippingQuotes();

  // chave estável para evitar JSON.stringify no deps
  const key = useMemo(() => {
    if (!input) return '';
    const { destination, packages, preferCheapest, cartTotal } = input;
    return JSON.stringify({
      postalCode: destination.postalCode,
      pkg0: packages[0],
      preferCheapest: !!preferCheapest,
      cartTotal: cartTotal ?? null,
    });
  }, [input]);

  useEffect(() => {
    if (input) fetchTransition(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    onSelect?.(selected);
  }, [onSelect, selected]);

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
        const isBest = state.best?.id === q.id;
        return (
          <label
            key={q.id}
            htmlFor={id}
            className={`flex items-center gap-3 p-3 rounded border border-brand-gray-border hover:bg-brand-gray/20 ${isBest ? 'ring-1 ring-brand-blue/60' : ''}`}
            aria-label={`${q.name} ${q.company.name} ${q.deliveryDays} dias`}
          >
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
                {q.description ?? `${q.deliveryDays} dias úteis`}
                {q.etaDate ? ` • ETA ${new Date(q.etaDate).toLocaleDateString('pt-BR')}` : ''}
                {isBest ? ' • Melhor opção' : ''}
              </div>
            </div>
            <div className="font-semibold">
              {formatBRL(q.priceBRL)}
              {q.isFree && <span className="ml-2 text-xs bg-green-900/40 border border-green-700 px-2 py-0.5 rounded">Frete grátis</span>}
            </div>
          </label>
        );
      })}

      <input type="hidden" name="selectedShipping" value={selected ? JSON.stringify(selected) : ''} />
    </div>
  );
}
