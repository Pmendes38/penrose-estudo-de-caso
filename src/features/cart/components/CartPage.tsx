'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useCart, type CartItem } from '@/shared/context/CartContext';
import { formatBRL } from '@/shared/lib/format';
import { useToast } from '@/shared/ui/use-toast';
import { Skeleton } from '@/shared/ui/skeleton';

function QuantityControl({
  qty,
  onDec,
  onInc,
  canInc,
  pending,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
  canInc: boolean;
  pending: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDec}
        className="w-8 h-8 rounded-full border border-brand-gray-border hover:bg-brand-gray/30 disabled:opacity-50"
        aria-label="Diminuir quantidade"
        title="Diminuir quantidade"
        disabled={qty <= 1 || pending}
        type="button"
      >
        −
      </button>
      <span className="w-12 text-center text-brand-gray-light tabular-nums">{qty}</span>
      <button
        onClick={onInc}
        className="w-8 h-8 rounded-full border border-brand-gray-border hover:bg-brand-gray/30 disabled:opacity-50"
        aria-label="Aumentar quantidade"
        title={canInc ? 'Aumentar quantidade' : 'Estoque insuficiente'}
        disabled={!canInc || pending}
        type="button"
      >
        +
      </button>
    </div>
  );
}

function CartItemSkeleton() {
  return (
    <div className="p-6 border-b border-brand-gray-border last:border-b-0">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-12 h-6" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <Skeleton className="w-6 h-6 rounded" />
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Cart API
  const {
    items,
    total,
    setQuantity,               // fallback local
    removeLine,
    clear,
    // @ts-expect-error: opcional no contexto; usamos se existir
    updateLine,
  } = useCart();

  // Reidratação: mostra skeletons até o 1º paint no client
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Controle de request por linha (para desabilitar botões)
  const [pendingLine, setPendingLine] = useState<string | null>(null);

  const totalItems = useMemo(
    () => items.reduce((acc, it) => acc + it.quantity, 0),
    [items]
  );

  const handleCheckout = () => {
    if (!items.length) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione produtos para continuar.',
        variant: 'destructive',
      });
      return;
    }
    router.push('/checkout');
  };

  async function safeUpdateLine(lineId: string, nextQty: number, maxQty: number) {
    // guarda-chuva de estoque
    if (nextQty > maxQty) {
      toast({
        title: 'Estoque insuficiente',
        description: `Quantidade máxima disponível: ${maxQty}.`,
        variant: 'destructive',
      });
      return;
    }
    if (nextQty < 1) return;

    try {
      setPendingLine(lineId);
      // se existir validação no server:
      if (typeof updateLine === 'function') {
        await updateLine(lineId, nextQty);
      } else {
        // fallback local
        setQuantity(lineId, nextQty);
      }
    } catch (e: any) {
      toast({
        title: 'Não foi possível atualizar a quantidade',
        description: e?.message ?? 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setPendingLine((curr) => (curr === lineId ? null : curr));
    }
  }

  if (!hydrated) {
    // Skeleton da página inteira
    return (
      <div className="min-h-screen bg-brand-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-8 w-56 mb-8">
            <Skeleton className="h-8 w-56" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-brand-gray-dark rounded-lg border border-brand-gray-border">
              {[...Array(3)].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6 sticky top-6 space-y-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-gray-light mb-4">
              Seu carrinho está vazio
            </h1>
            <p className="text-brand-gray mb-8">
              Adicione alguns produtos para começar suas compras
            </p>
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

  const subtotal = total; // já vem do contexto

  return (
    <div className="min-h-screen bg-brand-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand-gray-light mb-8">Seu Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de itens */}
          <div className="lg:col-span-2">
            <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border divide-y divide-brand-gray-border">
              {items.map((item: CartItem) => {
                // Caso algum item traga stock do backend, respeite-o; senão, um teto generoso.
                const maxQty =
                  typeof (item as any).stock === 'number'
                    ? Math.max(1, (item as any).stock as number)
                    : 99;

                const canInc = item.quantity < maxQty;
                const linePending = pendingLine === item.lineId;

                return (
                  <div key={item.lineId} className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0 bg-brand-black/40">
                        <Image
                          src={item.image || '/assets/placeholder.jpg'}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-brand-gray-light truncate">
                          {item.name}
                        </h3>

                        {(item.variantKey || (item.meta as any)?.size) && (
                          <p className="text-brand-gray">
                            Tamanho: {(item.meta as any)?.size ?? item.variantKey}
                          </p>
                        )}

                        <div className="mt-1 text-sm text-brand-gray">
                          {canInc ? (
                            <span>Em estoque</span>
                          ) : (
                            <span className="text-yellow-300">Estoque máximo atingido</span>
                          )}
                        </div>

                        <p className="mt-1 text-brand-blue font-semibold">
                          {formatBRL(item.price)}
                          {item.quantity > 1 && (
                            <span className="ml-2 text-sm text-brand-gray">
                              (linha: {formatBRL(item.price * item.quantity)})
                            </span>
                          )}
                        </p>
                      </div>

                      <QuantityControl
                        qty={item.quantity}
                        onDec={() =>
                          safeUpdateLine(item.lineId, Math.max(1, item.quantity - 1), maxQty)
                        }
                        onInc={() => safeUpdateLine(item.lineId, item.quantity + 1, maxQty)}
                        canInc={canInc}
                        pending={linePending}
                      />

                      <button
                        onClick={() => {
                          removeLine(item.lineId);
                          toast({
                            title: 'Item removido',
                            description: `${item.name} foi removido do carrinho.`,
                          });
                        }}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                        aria-label={`Remover ${item.name} do carrinho`}
                        title="Remover"
                        type="button"
                        disabled={linePending}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => {
                  clear();
                  toast({
                    title: 'Carrinho limpo',
                    description: 'Todos os itens foram removidos.',
                  });
                }}
                className="text-red-400 hover:text-red-300 font-medium"
                type="button"
              >
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
              <h2 className="text-lg font-semibold text-brand-gray-light mb-4">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-brand-gray">
                    Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
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
                type="button"
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
