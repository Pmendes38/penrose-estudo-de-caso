'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/shared/context/CartContext';
import { useFormState, useFormStatus } from 'react-dom';
import { createPaymentAction } from './actions';
import PaymentAwait from './PaymentAwait';

type CheckoutData = {
  nome: string; email: string; telefone: string; cpf: string;
  cep: string; endereco: string; numero: string; complemento: string;
  bairro: string; cidade: string; estado: string;
};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="px-8 py-3 bg-brand-blue text-white rounded-md disabled:opacity-50" disabled={pending}>
      {pending ? 'Gerando pagamento…' : 'Pagar'}
    </button>
  );
}

export default function PaymentClient() {
  const { items, total } = useCart();
  const [method, setMethod] = useState<'PIX'|'BOLETO'|'CREDIT_CARD'>('PIX');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('checkoutData');
      if (raw) setCheckoutData(JSON.parse(raw));
    } catch {}
  }, []);

  const cartItemsJson = useMemo(() => JSON.stringify(items.map(i => ({
    productId: i.productId, name: i.name, quantity: i.quantity, unitPrice: i.price,
    size: (i.meta as any)?.size,
  }))), [items]);

  const customerDataJson = useMemo(() => JSON.stringify({
    id: undefined, // opcional; backend usa/me gera
    name: checkoutData?.nome,
    email: checkoutData?.email,
    telefone: checkoutData?.telefone,
    cpf: checkoutData?.cpf,
    cep: checkoutData?.cep,
    endereco: checkoutData?.endereco,
    numero: checkoutData?.numero,
    complemento: checkoutData?.complemento,
    bairro: checkoutData?.bairro,
    cidade: checkoutData?.cidade,
    estado: checkoutData?.estado,
  }), [checkoutData]);

  const selectedShippingJson = JSON.stringify({ price: 0 });

  const [state, formAction] = useFormState(createPaymentAction, { ok:false } as any);

  if (state.ok && state.paymentId) {
    return <PaymentAwait paymentId={state.paymentId} />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Pagamento</h1>

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

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="billingType" value={method} />
        <input type="hidden" name="cartItems" value={cartItemsJson} />
        <input type="hidden" name="totalAmount" value={String(total)} />
        <input type="hidden" name="customerData" value={customerDataJson} />
        <input type="hidden" name="selectedShipping" value={selectedShippingJson} />
        <input type="hidden" name="idempotencyKey" value={undefined as any} />
        <SubmitBtn />
      </form>
    </div>
  );
}
