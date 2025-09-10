'use client';

import Link from 'next/link';
import { useCart } from '@/features/cart/hooks/useCart';

function qty(cart: any) {
  return (cart?.items ?? []).reduce((s: number, it: any) => s + (Number(it.quantity) || 0), 0);
}

export default function CartHeaderButton({ visible = true }: { visible?: boolean }) {
  const { cart, isLoading } = useCart();

  if (!visible) return null;

  const count = qty(cart);

  return (
    <Link
      href="/cart"
      aria-label="Abrir carrinho"
      className="relative inline-flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5"
    >
      {/* ícone simples — troque por seu componente de ícone se quiser */}
      <span className="text-brand-gray-light">🛒</span>
      <span className="hidden sm:block text-brand-gray-light">Carrinho</span>

      {/* badge */}
      {isLoading ? (
        <span className="ml-1 h-5 w-6 animate-pulse rounded bg-brand-gray-border" />
      ) : count > 0 ? (
        <span className="absolute -top-1 -right-1 min-w-[1.25rem] rounded-full bg-brand-blue px-1.5 text-center text-xs font-semibold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
