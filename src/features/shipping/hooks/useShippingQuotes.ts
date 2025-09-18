'use client';

import { useRef, useState, useTransition } from 'react';
import { calculateShipping, validatePostalCode } from '../api/client';
import type { CalculateShippingInput, ShippingQuote } from '../schemas';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; quotes: ShippingQuote[]; best?: ShippingQuote | null }
  | { status: 'error'; message: string };

export function useShippingQuotes() {
  const [state, setState] = useState<State>({ status: 'idle' });
  const [selected, setSelected] = useState<ShippingQuote | null>(null);
  const [isPending, startTransition] = useTransition();

  const abortRef = useRef<AbortController | null>(null);

  async function fetchQuotes(input: CalculateShippingInput) {
    // cancela requisição anterior (race safety)
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setState({ status: 'loading' });
    try {
      const { valid, normalized } = await validatePostalCode(input.destination.postalCode);
      if (!valid) throw new Error('CEP inválido');

      const res = await calculateShipping({
        ...input,
        destination: { postalCode: normalized },
      });

      if (ac.signal.aborted) return;

      const quotes = Array.isArray(res?.quotes) ? res.quotes : [];
      const best = res?.bestQuote ?? quotes[0] ?? null;

      setState({ status: 'success', quotes, best });
      setSelected(best);
    } catch (e: any) {
      if (ac.signal.aborted) return;
      setState({ status: 'error', message: e?.message || 'Falha ao calcular frete' });
    }
  }

  const fetchTransition = (input: CalculateShippingInput) => startTransition(() => fetchQuotes(input));

  return {
    state,
    selected,
    setSelected,
    isPending,
    fetchQuotes,
    fetchTransition,
  };
}
