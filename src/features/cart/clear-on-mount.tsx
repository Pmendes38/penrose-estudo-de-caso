'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/shared/context/CartContext';
import { useToast } from '@/shared/ui/use-toast';

export default function ClearCartOnMount() {
  const { clear } = useCart();
  const { toast } = useToast();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    clear();

    try {
      localStorage.removeItem('checkoutData');
      localStorage.removeItem('selectedShipping');
    } catch {
      /* noop */
    }

    toast({ title: 'Pedido finalizado', description: 'Seu carrinho foi limpo.', variant: 'success' });
  }, [clear]);

  return null;
}
