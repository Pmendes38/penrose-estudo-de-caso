'use client';
import useSWR from 'swr';
import { useCallback, useState } from 'react';
import type { Cart, AddItemInput, UpdateItemInput, ShippingSelectInput, QuoteResult } from '../schema';
import { getCart, addItem, updateItem, removeItem, applyCoupon, removeCoupon, quoteShipping, selectShipping, prepareCheckout } from '../api';

export function useCart() {
  const { data, error, isLoading, mutate } = useSWR<Cart>('/cart', () => getCart({ createIfMissing: true }), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const [quotes, setQuotes] = useState<QuoteResult | null>(null);

  const refresh = useCallback(() => mutate(), [mutate]);

  const add = useCallback(async (input: AddItemInput) => {
    const updated = await addItem(input);
    await mutate(updated, { revalidate: false });
    return updated;
  }, [mutate]);

  const update = useCallback(async (itemId: string, input: UpdateItemInput) => {
    const updated = await updateItem(itemId, input);
    await mutate(updated, { revalidate: false });
    return updated;
  }, [mutate]);

  const remove = useCallback(async (itemId: string) => {
    const updated = await removeItem(itemId);
    await mutate(updated, { revalidate: false });
    return updated;
  }, [mutate]);

  const apply = useCallback(async (code: string) => {
    const updated = await applyCoupon(code);
    await mutate(updated, { revalidate: false });
    return updated;
  }, [mutate]);

  const unapply = useCallback(async (code: string) => {
    const updated = await removeCoupon(code);
    await mutate(updated, { revalidate: false });
    return updated;
  }, [mutate]);

  const requestQuotes = useCallback(async (postalCode: string) => {
    const q = await quoteShipping({ address: { postalCode } });
    setQuotes(q);
    return q;
  }, []);

  const selectShip = useCallback(async (input: ShippingSelectInput) => {
    const updated = await selectShipping(input);
    await mutate(updated, { revalidate: false });
    return updated;
  }, [mutate]);

  const prepare = useCallback(async () => {
    const res = await prepareCheckout();
    await mutate(res.cart, { revalidate: false });
    return res; // { orderDraftId, cart }
  }, [mutate]);

  return {
    cart: data ?? null,
    isLoading,
    error: error as any,
    refresh,
    add,
    update,
    remove,
    apply,
    unapply,
    requestQuotes,
    quotes,
    selectShip,
    prepare,
  };
}
