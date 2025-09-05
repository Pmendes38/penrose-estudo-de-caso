// src/features/cart/components/CartPage.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, type CartItem } from '@/shared/context/CartContext';
import { formatBRL } from '@/shared/lib/format';

export default function CartPage() {
  const { items, setQuantity, removeLine, clear, total } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    if (!items.length) {
      alert('Seu carrinho está vazio');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-gray-light mb-4">Seu carrinho está vazio</h1>
            <p className="text-brand-gray mb-8">Adicione alguns produtos para começar suas compras</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-md font-medium bg-brand-blue text-white hover:bg-blue-600 transition"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = total; // já calculado pelo contexto

  return (
    <div className="min-h-screen bg-brand-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand-gray-light mb-8">Seu Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de itens */}
          <div className="lg:col-span-2">
            <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border">
              {items.map((item: CartItem) => (
                <div key={item.lineId} className="p-6 border-b border-brand-gray-border last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || '/assets/placeholder.jpg'}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-brand-gray-light">{item.name}</h3>

                      {/* tamanho/opção pode vir de variantKey ou meta.size */}
                      {(item.variantKey || (item.meta as any)?.size) && (
                        <p className="text-brand-gray">
                          Tamanho: {(item.meta as any)?.size ?? item.variantKey}
                        </p>
                      )}

                      <p className="text-brand-blue font-semibold">{formatBRL(item.price)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(item.lineId, Math.max(0, item.quantity - 1))}
                        className="w-8 h-8 rounded-full border border-brand-gray-border hover:bg-brand-gray/30"
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-brand-gray-light">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-brand-gray-border hover:bg-brand-gray/30"
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeLine(item.lineId)}
                      className="text-red-400 hover:text-red-300"
                      aria-label="Remover item do carrinho"
                      title="Remover"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button onClick={clear} className="text-red-400 hover:text-red-300 font-medium">
                Limpar carrinho
              </button>
              <Link href="/" className="text-brand-blue hover:text-blue-400 font-medium">
                Continuar comprando
              </Link>
            </div>
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-brand-gray-light mb-4">Resumo do Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-brand-gray">
                    Subtotal ({items.reduce((acc, it) => acc + it.quantity, 0)} itens)
                  </span>
                  <span className="font-medium text-brand-gray-light">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Frete</span>
                  <span className="text-green-400">A calcular</span>
                </div>
                <div className="border-t border-brand-gray-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-brand-gray-light">Total</span>
                    <span className="text-lg font-semibold text-brand-blue">
                      {formatBRL(subtotal)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-brand-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Finalizar Compra
              </button>

              <p className="mt-4 text-center text-sm text-brand-gray">
                Ao finalizar, você será redirecionado para o checkout seguro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
