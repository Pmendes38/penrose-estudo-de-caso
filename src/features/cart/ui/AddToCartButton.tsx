'use client';
import { useTransition } from 'react';
import { useCart } from '@/features/cart/hooks/useCart';

export default function AddToCartButton({ sku, qty = 1, variant }: { sku: string; qty?: number; variant?: Record<string,string> }){
  const { add } = useCart();
  const [isPending, start] = useTransition();

  return (
    <button
      className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      disabled={isPending}
      onClick={() => start(async () => { await add({ sku, quantity: qty, variant }); })}
    >{isPending ? 'Adicionando…' : 'Adicionar ao carrinho'}</button>
  );
}
