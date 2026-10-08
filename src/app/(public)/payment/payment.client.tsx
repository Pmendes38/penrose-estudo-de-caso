'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useFormState, useFormStatus } from 'react-dom';
import { createPaymentAction } from './actions';
import PaymentAwait from './PaymentAwait';
import type { CheckoutSession } from './session';
import Link from 'next/link';
import EmptyStoreState from '@/shared/ui/EmptyStoreState';

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

function SubmitBtn({ demo }: { demo: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="penrose-payment-submit" disabled={pending}>
      {pending ? 'PREPARANDO PEDIDO…' : demo ? 'CRIAR PEDIDO DE DEMONSTRAÇÃO' : 'FINALIZAR COMPRA'}
    </button>
  );
}

export default function PaymentClient({ session, demo = false }: { session?: CheckoutSession; demo?: boolean }) {
  const { cart, isLoading, error: cartError } = useCart();

  const [method, setMethod] = useState<'PIX'|'BOLETO'|'CREDIT_CARD'>('PIX');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [sessionShipping, setSessionShipping] = useState<any | null>(null);
  const couponCode = cart?.coupons?.[0];

  useEffect(() => {
    if (session?.customerData) setCheckoutData(session.customerData as any);
    if (session?.selectedShipping) setSessionShipping(session.selectedShipping);

    try {
      if (!session?.customerData) {
        const raw = localStorage.getItem('checkoutData');
        if (raw) setCheckoutData(JSON.parse(raw));
      }
      if (!session?.selectedShipping) {
        const rawShip = localStorage.getItem('selectedShipping');
        if (rawShip) setSessionShipping(JSON.parse(rawShip));
      }
    } catch {/* ignore */}
  }, [session?.customerData, session?.selectedShipping]);

  const cartItemsJson = useMemo(() => {
    const items = (cart?.items ?? []).map((i) => {
      const unitPriceBRL = Number((Math.max(0, Number(i.unitPrice ?? 0)) / 100).toFixed(2));
      return {
        productId: i.productId ?? i.sku,
        name: i.name ?? i.sku,
        quantity: i.quantity,
        unitPrice: unitPriceBRL, // BRL com 2 casas
        size: (i.variant as any)?.size,
      };
    });
    return JSON.stringify(items);
  }, [cart?.items]);

  const totalCents = Math.max(0, Number(cart?.grandTotal ?? 0));
  const totalAmount = Number((totalCents / 100).toFixed(2)); // BRL

  const shippingForForm = useMemo(() => {
    if (sessionShipping) return sessionShipping;
    if (cart?.shipping) {
      const priceBRL = Number((Math.max(0, Number(cart.shipping.amount ?? 0)) / 100).toFixed(2));
      return {
        serviceCode: cart.shipping.serviceCode,
        label: cart.shipping.label,
        priceBRL,
        price: priceBRL,
        days: cart.shipping.days,
        eta: cart.shipping.eta,
        isFree: cart.shipping.isFree,
      };
    }
    return undefined;
  }, [sessionShipping, cart?.shipping]);

  const selectedShippingJson = useMemo(
    () => (shippingForForm ? JSON.stringify(shippingForForm) : ''),
    [shippingForForm],
  );

  const customerDataJson = useMemo(() => JSON.stringify({
    name: checkoutData?.nome,
    email: checkoutData?.email,
    telefone: checkoutData?.telefone,
    phone: checkoutData?.telefone,
    cpfCnpj: checkoutData?.cpf,
    cpf: checkoutData?.cpf,
    postalCode: checkoutData?.cep,
    cep: checkoutData?.cep,
    address: checkoutData?.endereco,
    endereco: checkoutData?.endereco,
    addressNumber: checkoutData?.numero,
    numero: checkoutData?.numero,
    complemento: checkoutData?.complemento,
    province: checkoutData?.bairro,
    bairro: checkoutData?.bairro,
    city: checkoutData?.cidade,
    cidade: checkoutData?.cidade,
    state: checkoutData?.estado,
    estado: checkoutData?.estado,
    couponCode,
  }), [checkoutData, couponCode]);

  // Idempotência também no client (ajuda a evitar duplo clique/duplo submit)
  const idempotencyKey = useMemo(() => {
    const snap = JSON.stringify({
      method,
      cartId: (cart as any)?._id ?? (cart as any)?.id ?? null,
      version: cart?.version ?? null,
      grandTotal: totalCents,
      shipping: shippingForForm?.serviceCode ?? null,
    });
    return `cart:${hashString(snap)}`;
  }, [method, cart, cart?.version, totalCents, shippingForForm]);

  const [state, formAction] = useFormState(createPaymentAction, { ok: false } as any);

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
    return <EmptyStoreState kind="checkout" />;
  }

  return (
    <div className="penrose-payment-page">
      <header><h1>MAIS OPÇÕES DE PAGAMENTO</h1><p>{demo ? 'Ambiente de demonstração: pedido fictício, sem cobrança nem envio real. Não informe dados reais.' : 'Escolha a forma que combina com sua coleção.'}</p></header>
      <form action={formAction} className="penrose-payment-layout">
        <section className="penrose-payment-methods" aria-label="Formas de pagamento">
          {([
            { value: 'PIX', label: 'PIX', detail: 'Confirmação após o pagamento', icon: 'pix' },
            { value: 'CREDIT_CARD', label: 'Cartão de crédito', detail: 'Pagamento por cartão', icon: 'card' },
            { value: 'BOLETO', label: 'Boleto bancário', detail: 'Pagamento por boleto', icon: 'boleto' },
          ] as const).map((option) => <label key={option.value} className={`penrose-payment-method${method === option.value ? ' is-selected' : ''}`}>
            <input type="radio" name="paymentMethod" value={option.value} checked={method === option.value} onChange={() => setMethod(option.value)} />
            <img src={`/assets/penrose/payment-method-${option.icon}.svg`} alt="" width="28" height="28" />
            <span><strong>{option.label}</strong><small>{demo ? 'Pagamento simulado, sem cobrança' : option.detail}</small></span>
          </label>)}
          <div className="penrose-payment-method is-unavailable" aria-disabled="true"><span className="penrose-payment-radio" /><img src="/assets/penrose/payment-method-transfer.svg" alt="" width="28" height="28" /><span><strong>Transferência</strong><small>Indisponível no momento</small></span></div>
          <div className="penrose-payment-cards"><h2>Bandeiras de cartão</h2><div>{(['mastercard', 'visa', 'amex', 'elo'] as const).map((name) => <img key={name} src={`/assets/penrose/payment-${name}.svg`} alt={name} />)}</div></div>
        </section>
        <aside className="penrose-payment-summary"><h2 className="sr-only">Resumo do pedido</h2>
          <dl><div><dt>Subtotal</dt><dd>{money(cart.itemsSubtotal)}</dd></div><div><dt>Desconto</dt><dd className="discount">− {money(cart.discountTotal)}</dd></div><div><dt>Entrega</dt><dd>{cart.shippingTotal === 0 ? 'GRÁTIS' : money(cart.shippingTotal)}</dd></div><div className="total"><dt>TOTAL</dt><dd>{money(totalCents)}</dd></div></dl>
          <SubmitBtn demo={demo} />
          <label className="penrose-payment-terms"><input type="checkbox" required /> Aceito os <Link href="/terms">termos de uso do site</Link></label>
          {state.error && <p role="alert" className="penrose-payment-error">{state.error}</p>}
        </aside>
        <input type="hidden" name="billingType" value={method} />
        <input type="hidden" name="cartItems" value={cartItemsJson} />
        <input type="hidden" name="totalAmount" value={String(totalAmount)} />
        <input type="hidden" name="customerData" value={customerDataJson} />
        <input type="hidden" name="selectedShipping" value={selectedShippingJson} />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      </form>
    </div>
  );
}

const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
