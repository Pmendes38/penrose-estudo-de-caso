'use client';

import { useCart } from '@/features/cart/hooks/useCart';
import type { Cart, ShippingSelectInput } from '@/features/cart/schema';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CartPageClient({ initialCart }: { initialCart?: Cart }) {
  const router = useRouter();
  const { cart, isLoading, update, remove, apply, unapply, requestQuotes, quotes, selectShip, prepare } = useCart({ fallbackData: initialCart });
  const [coupon, setCoupon] = useState('');
  const [postal, setPostal] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [invoiceKey, setInvoiceKey] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [nonCommercial, setNonCommercial] = useState(false);
  const [receipt, setReceipt] = useState(false);
  const [ownHand, setOwnHand] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const selectedQuote = useMemo(() => quotes?.quotes.find((q) => q.serviceCode === selectedService) ?? null, [quotes, selectedService]);
  const requiresAgency = Boolean(selectedQuote?.me?.requiresAgency);

  if (isLoading && !cart) return <div className="penrose-page penrose-loading">Carregando carrinho…</div>;
  if (!cart) return <div className="penrose-page penrose-empty-state"><h1>Seu carrinho está vazio</h1><Link href="/catalog">VOLTAR AO CATÁLOGO</Link></div>;

  async function selectShipping() {
    if (!selectedService || !quotes) return;
    const payload: ShippingSelectInput = { serviceCode: selectedService, address: { postalCode: quotes.postalCode }, nonCommercial, invoiceKey: invoiceKey || undefined, receipt, ownHand, agencyId: requiresAgency ? agencyId || undefined : undefined };
    const updated = await selectShip(payload);
    setSelectedService(updated.shipping?.serviceCode ?? null);
  }

  return (
    <div className="penrose-page penrose-cart-page">
      <h1>PEDIDOS</h1>
      <div className="penrose-cart-layout">
        <section className="penrose-cart-items">
          {cart.items.length === 0 && <div className="penrose-empty-state"><h2>Nenhum item adicionado.</h2><Link href="/catalog">EXPLORAR CATÁLOGO</Link></div>}
          {cart.items.map((item) => (
            <article key={item.id} className="penrose-cart-item">
              {item.image ? <img src={item.image} alt={item.name ?? item.sku} /> : <div className="penrose-cart-image-placeholder" />}
              <div className="penrose-cart-item-copy"><small>COLECIONÁVEL</small><h2>{item.name ?? item.sku}</h2>{item.variant && <p>{Object.entries(item.variant).map(([k,v]) => `${k}: ${v}`).join(' · ')}</p>}<strong>{money(item.unitPrice)}</strong></div>
              <div className="penrose-quantity"><button onClick={() => update(item.id,{quantity:Math.max(1,item.quantity-1)})}>−</button><span>{item.quantity}</span><button onClick={() => update(item.id,{quantity:item.quantity+1})}>+</button></div>
              <strong className="penrose-cart-item-total">{money(item.total)}</strong>
              <button className="penrose-remove" onClick={() => remove(item.id)} aria-label="Remover item">×</button>
            </article>
          ))}
          <div className="penrose-cart-tools">
            <section><h3>CUPOM DE DESCONTO</h3><div><input value={coupon} onChange={(e)=>setCoupon(e.target.value.toUpperCase())} placeholder="Digite seu cupom"/><button onClick={()=>apply(coupon)} disabled={!coupon}>APLICAR</button></div>{cart.coupons?.length ? <p>Aplicado: {cart.coupons.join(', ')} <button onClick={()=>unapply(cart.coupons[0])}>remover</button></p>:null}</section>
            <section><h3>CALCULAR FRETE</h3><div><input value={postal} onChange={(e)=>setPostal(e.target.value)} placeholder="CEP"/><button onClick={()=>{setSelectedService(null);requestQuotes(postal)}} disabled={!postal}>CALCULAR</button></div></section>
          </div>
          {quotes?.quotes?.length ? <section className="penrose-shipping-options">
            {quotes.quotes.map((q)=><label key={q.serviceCode}><input type="radio" name="ship" checked={selectedService===q.serviceCode} onChange={()=>setSelectedService(q.serviceCode)}/><span><strong>{q.label}</strong><small>{q.days ? `${q.days} dia(s)` : 'Prazo no rastreio'}</small></span><b>{q.isFree ? 'Grátis' : money(q.amount)}</b></label>)}
            <div className="penrose-shipping-extra"><label><input type="checkbox" checked={nonCommercial} onChange={(e)=>setNonCommercial(e.target.checked)}/> Remessa não comercial</label><label><input type="checkbox" checked={receipt} onChange={(e)=>setReceipt(e.target.checked)}/> Aviso de recebimento</label><label><input type="checkbox" checked={ownHand} onChange={(e)=>setOwnHand(e.target.checked)}/> Mão própria</label>{!nonCommercial&&<input placeholder="Chave da NF-e" value={invoiceKey} onChange={(e)=>setInvoiceKey(e.target.value)}/>} {requiresAgency&&<input placeholder="ID da agência" value={agencyId} onChange={(e)=>setAgencyId(e.target.value)}/>}</div>
            <button className="penrose-outline-button" onClick={selectShipping} disabled={!selectedService||(!nonCommercial&&!invoiceKey.trim())||(requiresAgency&&!agencyId.trim())}>SELECIONAR FRETE</button>
          </section>:null}
        </section>
        <aside className="penrose-order-summary">
          <h2>RESUMO DO PEDIDO</h2>
          <dl><div><dt>Subtotal</dt><dd>{money(cart.itemsSubtotal)}</dd></div><div><dt>Desconto</dt><dd>− {money(cart.discountTotal)}</dd></div><div><dt>Entrega</dt><dd>{money(cart.shippingTotal)}</dd></div><div className="total"><dt>TOTAL</dt><dd>{money(cart.grandTotal)}</dd></div></dl>
          <label className="penrose-terms-check"><input type="checkbox" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)}/><span>Aceito os <Link href="/terms">termos de uso do Site</Link></span></label>
          <button disabled={!accepted||cart.items.length===0||isPending} onClick={()=>startTransition(async()=>{const res=await prepare();router.push(`/checkout?draft=${encodeURIComponent(res.orderDraftId)}`)})}>{isPending?'PREPARANDO…':'FINALIZAR COMPRA'}</button>
          <Link href="/catalog">CONTINUAR COMPRANDO</Link>
        </aside>
      </div>
    </div>
  );
}
