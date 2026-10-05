'use client';

import { useState } from 'react';
import { useCart } from '@/features/cart/hooks/useCart';
import { validateCoupon } from '@/features/coupons/api/client';
import { useToast } from '@/shared/ui/use-toast';

type Props = {
  onApply: (data: { code: string; discountTotal: number }) => void;
};

export default function CouponField({ onApply }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // novo hook do carrinho conectado ao backend
  const { cart, isLoading } = useCart();
  const items = cart?.items ?? [];
  const subtotalBRL = (cart?.itemsSubtotal ?? 0) / 100;

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
      // Monta payload esperado pela API de cupons (em BRL)
      const payload = {
        code: trimmed,
        cartTotal: subtotalBRL, // subtotal em BRL
        items: items.map((it) => ({
          productId: it.productId ?? it.sku, // fallback para SKU se productId não existir
          quantity: it.quantity,
          unitPrice: (it.unitPrice ?? 0) / 100, // BRL
          // tenta extrair um "size" comum da variant
          size:
            (it.variant as any)?.size ??
            (it.variant as any)?.tamanho ??
            (it.variant as any)?.Size ??
            undefined,
        })),
      };

      const res = await validateCoupon(payload);
      // espera-se { coupon: { code }, discountTotal: number (BRL) }
      onApply({ code: res.coupon.code, discountTotal: res.discountTotal });

      toast({
        title: 'Cupom aplicado!',
        description: `Desconto de R$ ${Number(res.discountTotal || 0).toFixed(2)}`,
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
