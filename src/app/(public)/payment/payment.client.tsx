'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/features/cart/hooks/useCart';
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
  const { cart, isLoading, error: cartError } = useCart();

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
  }, [session?.customerData, session?.selectedShipping, session?.couponCode]);

  const cartItemsJson = useMemo(() => {
    const items = (cart?.items ?? []).map((i) => ({
      productId: i.productId ?? i.sku,
      name: i.name ?? i.sku,
      quantity: i.quantity,
      unitPrice: Math.max(0, Number(i.unitPrice ?? 0)) / 100, // BRL
      size: (i.variant as any)?.size,
    }));
    return JSON.stringify(items);
  }, [cart?.items]);

  const shippingFromCartCents = Math.max(0, Number(cart?.shippingTotal ?? 0)); // centavos
  const selectedShippingCents = selectedShipping?.priceBRL
    ? Math.round(Number(selectedShipping.priceBRL) * 100)
    : 0;

  const itemsSubtotalCents = Math.max(0, Number(cart?.itemsSubtotal ?? 0));
  const discountCents      = Math.max(0, Number(cart?.discountTotal ?? 0));
  const taxCents           = Math.max(0, Number(cart?.taxTotal ?? 0));

  const effectiveShippingCents = shippingFromCartCents > 0 ? shippingFromCartCents : selectedShippingCents;

  const computedTotalCents = cart
    ? Math.max(0, itemsSubtotalCents - discountCents + effectiveShippingCents + taxCents)
    : 0;

  const totalAmount = useMemo(
    () => computedTotalCents / 100, // BRL
    [computedTotalCents]
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
    const snap = JSON.stringify({
      method,
      cartId: (cart as any)?._id ?? (cart as any)?.id ?? null,
      version: cart?.version ?? null,
      totalAmount,
      selectedShipping: selectedShipping?.id ?? null,
    });
    return `cart:${hashString(snap)}`;
  }, [method, cart?.version, cart, totalAmount, selectedShipping]);

  const [state, formAction] = useFormState(createPaymentAction, { ok:false } as any);

  if (state.ok && state.paymentId) {
    return <PaymentAwait paymentId={state.paymentId} />;
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-brand-gray">Carregando carrinho…</p>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-400">Erro ao carregar carrinho: {String(cartError?.message || cartError)}</p>
      </div>
    );
  }

  if (!cart || !(cart.items ?? []).length) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-brand-gray">Seu carrinho está vazio.</p>
      </div>
    );
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
