'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/src/shared/context/CartContext.jsx';

export default function AddToCartClient({ product }: { product: any }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selected, setSelected] = useState<any>(product.sizes?.find((s: any) => s.inStock) ?? product.sizes?.[0]);

  const add = () => {
    if (!selected) return;
    addToCart({
      ...product,
      selectedSize: selected.name,
      price: selected.price,
      quantity: 1,
    });
  };

  const buyNow = () => {
    add();
    router.push('/carrinho'); // ajuste para /cart se renomear pasta
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
