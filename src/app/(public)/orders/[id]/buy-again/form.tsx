'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatBRL } from '@/shared/lib/format';

type RepeatItem = { id: string; name: string; sku: string | null; image: string | null; category: string | null; size: string | null; quantity: number; priceCents: number; previousPriceCents: number; stock: number; available: boolean };

export default function BuyAgainForm({ items }: { items: RepeatItem[] }) {
  const router = useRouter();
  const { add } = useCart();
  const [selected, setSelected] = useState(() => items.map((item) => item.available));
  const [quantities, setQuantities] = useState(() => items.map((item) => Math.min(item.quantity, Math.max(1, item.stock))));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [partial, setPartial] = useState(false);
  const chosen = items.filter((item, index) => item.available && selected[index]);
  const count = chosen.reduce((sum, item) => sum + quantities[items.indexOf(item)], 0);
  const subtotal = chosen.reduce((sum, item) => sum + item.priceCents * quantities[items.indexOf(item)], 0);

  function changeQuantity(index: number, delta: number) {
    setQuantities((current) => current.map((quantity, i) => i === index ? Math.max(1, Math.min(items[i].stock, quantity + delta)) : quantity));
  }

  async function addSelected() {
    if (pending || !count || partial) return;
    setPending(true);
    setError('');
    let added = 0;
    // ponytail: the cart API has no atomic bulk add; stop on first error and direct the customer to review any partial cart.
    try {
      for (const [index, item] of items.entries()) {
        if (!item.available || !selected[index] || !item.sku) continue;
        await add({ sku: item.sku, quantity: quantities[index], variant: item.size ? { size: item.size } : undefined });
        added++;
      }
      router.push('/cart');
    } catch {
      setPartial(added > 0);
      setError(added ? `${added} item(ns) foram adicionados antes da falha. Revise o carrinho antes de tentar novamente.` : 'Não foi possível adicionar os itens. Confira disponibilidade e tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return <div className="penrose-repeat-layout"><div className="penrose-repeat-items">
    {items.map((item, index) => <article key={item.id} className={`penrose-repeat-item${selected[index] && item.available ? ' is-selected' : ''}${!item.available ? ' is-unavailable' : ''}`}>
      <input type="checkbox" aria-label={`Selecionar ${item.name}`} checked={Boolean(selected[index] && item.available)} disabled={!item.available} onChange={() => setSelected((current) => current.map((value, i) => i === index ? !value : value))} />
      {item.image ? <img src={item.image} alt={item.name} width="116" height="116" /> : <div className="penrose-repeat-image-empty" aria-hidden="true" />}
      <div className="penrose-repeat-copy"><h2>{item.name}</h2>{item.category && <p>{item.category}</p>}{item.size && <small>TAMANHO: <b>{item.size}</b></small>}{!item.available && <small>Indisponível no catálogo atual</small>}</div>
      <strong>{formatBRL((item.available ? item.priceCents : item.previousPriceCents) / 100)}{!item.available && <small>Preço do pedido anterior</small>}</strong>
      <div className="penrose-repeat-quantity"><button type="button" aria-label={`Diminuir quantidade de ${item.name}`} disabled={!item.available || quantities[index] <= 1 || pending} onClick={() => changeQuantity(index, -1)}>−</button><span>{quantities[index]}</span><button type="button" aria-label={`Aumentar quantidade de ${item.name}`} disabled={!item.available || quantities[index] >= item.stock || pending} onClick={() => changeQuantity(index, 1)}>+</button></div>
    </article>)}
    {!items.length && <p className="penrose-order-no-items">Os itens desse pedido não estão disponíveis para repetir a compra.</p>}
    {items.some((item) => !item.available) && <p className="penrose-repeat-notice">Itens indisponíveis no catálogo atual não serão adicionados ao carrinho.</p>}
  </div><aside className="penrose-repeat-summary"><div className="penrose-order-totals"><div><span>Subtotal</span><strong>{formatBRL(subtotal / 100)}</strong></div><div><span>Desconto</span><strong>Calculado no carrinho</strong></div><div><span>Entrega</span><strong>Calculada no carrinho</strong></div><div className="grand"><span>TOTAL PARCIAL</span><strong>{formatBRL(subtotal / 100)}</strong></div></div><button type="button" disabled={!count || pending || partial} onClick={addSelected}>{pending ? 'ADICIONANDO…' : `ADICIONAR ${count} ${count === 1 ? 'ITEM' : 'ITENS'} AO CARRINHO`}</button><p>Preços e estoque atuais. Frete e descontos serão calculados no carrinho.</p>{error && <p role="alert" className="penrose-repeat-error">{error} {partial && <Link href="/cart">VER CARRINHO</Link>}</p>}</aside></div>;
}
