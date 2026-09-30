'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/useCart';

type Size = { name?: string; label?: string; price: number; inStock?: boolean };

type Product = {
  id: string;
  sku?: string;
  name: string;
  images?: string[];
  mainImage?: string;
  sizes?: Size[];
};

export default function AddToCartClient({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();

  const initial = useMemo(
    () => product.sizes?.find((s) => s.inStock) ?? product.sizes?.[0],
    [product.sizes]
  );
  const [selected, setSelected] = useState<Size | undefined>(initial);
  const [isAdding, setIsAdding] = useState(false);

  const variantKey = selected?.name ?? selected?.label ?? null;
  const disabled = !selected || selected?.inStock === false || isAdding;

  const sku = product.sku ?? product.id;

  async function handleAdd() {
    if (!selected) return;

    setIsAdding(true);
    try {
      await add({
        sku,
        quantity: 1,
        variant: variantKey ? { size: String(variantKey) } : undefined,
      });
    } catch (e: any) {
      alert(e?.message || 'Falha ao adicionar ao carrinho');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleBuyNow() {
    await handleAdd();
    router.push('/cart');
  }

  return (
    <div className="penrose-buy-box">
      {Array.isArray(product.sizes) && product.sizes.length > 0 && (
        <div className="penrose-size-grid">
          {product.sizes.map((s) => {
            const key = s.name ?? s.label ?? 'Único';
            const active = (selected?.name ?? selected?.label) === (s.name ?? s.label);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(s)}
                disabled={s.inStock === false}
                className={`${active ? 'is-active' : ''} ${s.inStock === false ? 'is-disabled' : ''}`}
              >
                {key}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={disabled}
        className="penrose-buy-primary"
      >
        {!selected
          ? 'Selecione um tamanho'
          : isAdding
          ? 'Adicionando…'
          : 'ADICIONAR AO CARRINHO'}
      </button>

      <button
        onClick={handleBuyNow}
        disabled={disabled}
        className="penrose-buy-secondary"
      >
        {!selected
          ? 'Selecione um tamanho'
          : isAdding
          ? 'Processando…'
          : 'COMPRAR AGORA'}
      </button>
    </div>
  );
}
