'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/shared/context/CartContext';

type Size = { name?: string; label?: string; price: number; inStock?: boolean };
type Product = {
  id: string;
  name: string;
  images?: string[];
  mainImage?: string;
  sizes?: Size[];
};

export default function AddToCartClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, getLineId } = useCart();

  const initial = useMemo(
    () => product.sizes?.find((s) => s.inStock) ?? product.sizes?.[0],
    [product.sizes]
  );
  const [selected, setSelected] = useState<Size | undefined>(initial);

  const variantKey = selected?.name ?? selected?.label ?? null;

  const add = () => {
    if (!selected) return;

    const lineId = getLineId(product.id, variantKey);
    addItem({
      productId: product.id,
      name: product.name,
      price: selected.price,
      quantity: 1,
      image: product.images?.[0] ?? product.mainImage ?? null,
      images: product.images,
      variantKey, // ex.: "M", "G"…
      meta: { selectedSize: variantKey },
    });
  };

  const buyNow = () => {
    add();
    router.push('/carrinho');
  };

  return (
    <div className="space-y-3">
      <button
        onClick={add}
        disabled={!selected}
        className="w-full bg-brand-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all"
      >
        {selected ? '🛒 Adicionar ao Carrinho' : 'Selecione um tamanho'}
      </button>

      <button
        onClick={buyNow}
        disabled={!selected}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all"
      >
        {selected ? '⚡ Comprar Agora' : 'Selecione um tamanho'}
      </button>
    </div>
  );
}
