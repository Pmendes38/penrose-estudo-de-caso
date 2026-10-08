'use client';

import { useState } from 'react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useToast } from '@/shared/ui/use-toast';

export default function CouponField() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // novo hook do carrinho conectado ao backend
  const { cart, isLoading, apply: applyToCart } = useCart();
  const items = cart?.items ?? [];

  const { toast } = useToast();

  const apply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    if (isLoading) {
      toast({ title: 'Aguarde…', description: 'Carregando carrinho.', variant: 'default' });
      return;
    }
    if (!items.length) {
      toast({ title: 'Carrinho vazio', description: 'Adicione itens antes de aplicar cupom.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const updated = await applyToCart(trimmed);

      toast({
        title: 'Cupom aplicado!',
        description: `Desconto de R$ ${(updated.discountTotal / 100).toFixed(2)}`,
      });
    } catch (e: any) {
      toast({
        title: 'Cupom inválido',
        description: e?.message ?? 'Não foi possível validar o cupom',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        className="input flex-1"
        placeholder="Cupom de desconto"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (!loading) apply();
          }
        }}
        disabled={loading}
      />
      <button
        type="button"
        onClick={apply}
        className="btn-secondary"
        disabled={loading || !code.trim()}
      >
        {loading ? 'Validando…' : 'Aplicar'}
      </button>
    </div>
  );
}
