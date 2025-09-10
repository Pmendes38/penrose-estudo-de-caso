'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useToast } from '@/shared/ui/use-toast';

export default function ClearCartOnMount() {
  const { cart, isLoading, remove, unapply, refresh } = useCart();
  const { toast } = useToast();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    if (isLoading) return;

    ranRef.current = true;

    (async () => {
      try {
        if (Array.isArray(cart?.coupons) && cart!.coupons.length > 0) {
          for (const code of cart!.coupons) {
            try {
              await unapply(code);
            } catch {
              /* ignora erro de cupom individual */
            }
          }
        }

        if (Array.isArray(cart?.items) && cart!.items.length > 0) {
          for (const it of cart!.items) {
            await remove(it.id);
          }
        }

        await refresh();

        try {
          localStorage.removeItem('checkoutData');
          localStorage.removeItem('selectedShipping');
        } catch {
          /* noop */
        }

        toast({
          title: 'Pedido finalizado',
          description: 'Seu carrinho foi limpo.',
          variant: 'success',
        });
      } catch (e: any) {
        toast({
          title: 'Não foi possível limpar o carrinho',
          description: e?.message ?? 'Tente novamente.',
          variant: 'destructive',
        });
      }
    })();
  }, [isLoading, cart?.items?.length, cart?.coupons?.length, remove, unapply, refresh, toast]);

  return null;
}
