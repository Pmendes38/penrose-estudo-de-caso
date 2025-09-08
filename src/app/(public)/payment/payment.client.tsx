'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/shared/context/CartContext';
import { useFormState, useFormStatus } from 'react-dom';
import { createPaymentAction } from './actions';
import PaymentAwait from './PaymentAwait';
import type { CheckoutSession } from './session';

type CheckoutData = {
  nome: string; email: string; telefone: string; cpf: string;
  cep: string; endereco: string; numero: string; complemento: string;
  bairro: string; cidade: string; estado: string;
};

function hashString(input: string) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h) + input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="px-8 py-3 bg-brand-blue text-white rounded-md disabled:opacity-50" disabled={pending}>
      {pending ? 'Gerando pagamento…' : 'Pagar'}
    </button>
  );
}

export default function PaymentClient({ session }: { session?: CheckoutSession }) {
  const { items, total } = useCart(); // subtotal
  const [method, setMethod] = useState<'PIX'|'BOLETO'|'CREDIT_CARD'>('PIX');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<any | null>(null);
  const [couponCode, setCouponCode] = useState<string | undefined>();

  useEffect(() => {
    if (session?.customerData) setCheckoutData(session.customerData as any);
    if (session?.selectedShipping) setSelectedShipping(session.selectedShipping);
    if (session?.couponCode) setCouponCode(session.couponCode || undefined);

    try {
      if (!session?.customerData) {
        const raw = localStorage.getItem('checkoutData');
        if (raw) setCheckoutData(JSON.parse(raw));
      }
      if (!session?.selectedShipping) {
        const rawShip = localStorage.getItem('selectedShipping');
        if (rawShip) setSelectedShipping(JSON.parse(rawShip));
      }
      if (!session?.couponCode) {
        const rawCoupon = localStorage.getItem('couponData');
        if (rawCoupon) setCouponCode(JSON.parse(rawCoupon)?.code || undefined);
      }
    } catch {}
  }, []);

  const cartItemsJson = useMemo(() => JSON.stringify(items.map(i => ({
    productId: i.productId,
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.price,
    size: (i.meta as any)?.size,
  }))), [items]);

  const shippingTotal = Number(selectedShipping?.priceBRL || 0);
  const discountTotal = 0; // se precisar, calcule do lado do front (ou deixe pro backend)
  const totalAmount = useMemo(
    () => Math.max(0, total + shippingTotal - discountTotal),
    [total, shippingTotal, discountTotal]
  );

  const customerDataJson = useMemo(() => JSON.stringify({
    name: checkoutData?.nome,
    email: checkoutData?.email,
    telefone: checkoutData?.telefone,
    phone: checkoutData?.telefone,
    cpf: checkoutData?.cpf,
    cep: checkoutData?.cep,
    endereco: checkoutData?.endereco,
    address: checkoutData?.endereco,
    numero: checkoutData?.numero,
    complemento: checkoutData?.complemento,
    bairro: checkoutData?.bairro,
    cidade: checkoutData?.cidade,
    estado: checkoutData?.estado,
    couponCode,
  }), [checkoutData, couponCode]);

  const selectedShippingJson = useMemo(
    () => (selectedShipping ? JSON.stringify(selectedShipping) : ''),
    [selectedShipping]
  );

  const idempotencyKey = useMemo(() => {
    const snap = JSON.stringify({ method, items, totalAmount, selectedShipping });
    return `cart:${hashString(snap)}`;
  }, [method, items, totalAmount, selectedShipping]);

  const [state, formAction] = useFormState(createPaymentAction, { ok:false } as any);

  if (state.ok && state.paymentId) {
    return <PaymentAwait paymentId={state.paymentId} />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Pagamento</h1>

      {/* método de pagamento */}
      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input type="radio" name="m" checked={method==='PIX'} onChange={() => setMethod('PIX')} /> PIX
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="m" checked={method==='BOLETO'} onChange={() => setMethod('BOLETO')} /> Boleto
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="m" checked={method==='CREDIT_CARD'} onChange={() => setMethod('CREDIT_CARD')} /> Cartão de crédito
        </label>
      </div>

      {state.error && <p className="text-red-400">{state.error}</p>}

      {/* form que posta para a Server Action */}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="billingType" value={method} />
        <input type="hidden" name="cartItems" value={cartItemsJson} />
        <input type="hidden" name="totalAmount" value={String(totalAmount)} />
        <input type="hidden" name="customerData" value={customerDataJson} />
        <input type="hidden" name="selectedShipping" value={selectedShippingJson} />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <SubmitBtn />
      </form>
    </div>
  );
}
