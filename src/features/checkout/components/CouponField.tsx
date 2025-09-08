'use client';

import { useState } from 'react';
import { useCart } from '@/shared/context/CartContext';
import { validateCoupon } from '@/features/coupons/api/client';
import { useToast } from '@/shared/ui/use-toast';

type Props = {
  onApply: (data: { code: string; discountTotal: number }) => void;
};

export default function CouponField({ onApply }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { items, total } = useCart();
  const { toast } = useToast();

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        cartTotal: total, // BRL
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.price,
          size: (it.meta as any)?.size,
        })),
      };
      const res = await validateCoupon(payload);
      onApply({ code: res.coupon.code, discountTotal: res.discountTotal });
      toast({
        title: 'Cupom aplicado!',
        description: `Desconto de R$ ${res.discountTotal.toFixed(2)}`,
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
        onChange={e => setCode(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
      />
      <button onClick={apply} className="btn-secondary" disabled={loading || !code.trim()}>
        {loading ? 'Validando…' : 'Aplicar'}
      </button>
    </div>
  );
}
