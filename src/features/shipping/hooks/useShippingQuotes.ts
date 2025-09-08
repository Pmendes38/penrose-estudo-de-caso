'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
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

  async function fetchQuotes(input: CalculateShippingInput) {
    setState({ status: 'loading' });
    try {
      const { valid, normalized } = await validatePostalCode(input.destination.postalCode);
      if (!valid) throw new Error('CEP inválido');

      const res = await calculateShipping({
        ...input,
        destination: { postalCode: normalized },
      });
      setState({ status: 'success', quotes: res.quotes, best: res.bestQuote ?? undefined });
      setSelected(res.bestQuote ?? res.quotes[0] ?? null);
    } catch (e: any) {
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
