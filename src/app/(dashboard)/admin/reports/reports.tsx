'use client';

import { useMemo, useState } from 'react';
import type { Order } from '@/features/orders/schemas';
import type { Product } from '@/features/products/schemas';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const paid = (order: Order) => ['paid', 'shipped', 'delivered'].includes(order.status);
const day = (date: Date) => date.toISOString().slice(0, 10);
const csvCell = (value: string | number) => { const text = String(value); return `"${(/^[=+@-]/.test(text.trimStart()) ? "'" : '') + text.replaceAll('"', '""')}"`; };

export default function Reports({ orders, products }: { orders: Order[]; products: Product[] }) {
  const [end, setEnd] = useState(day(new Date()));
  const [start, setStart] = useState(day(new Date(Date.now() - 89 * 86400000)));
  const [compare, setCompare] = useState(false);
  const productById = useMemo(() => new Map(products.map(product => [product.id, product])), [products]);
  const inRange = (order: Order, from: string, to: string) => { const date = day(new Date(order.createdAt)); return date >= from && date <= to && paid(order); };
  const current = useMemo(() => orders.filter(order => inRange(order, start, end)), [orders, start, end]);
  const rangeDays = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
  const previousEnd = day(new Date(new Date(start).getTime() - 86400000));
  const previousStart = day(new Date(new Date(start).getTime() - rangeDays * 86400000));
  const previous = compare ? orders.filter(order => inRange(order, previousStart, previousEnd)) : [];
  const revenue = current.reduce((sum, order) => sum + order.grandTotal, 0);
  const previousRevenue = previous.reduce((sum, order) => sum + order.grandTotal, 0);
  const gross = current.reduce((sum, order) => sum + order.subtotal, 0);
  const discounts = current.reduce((sum, order) => sum + order.discountTotal, 0);
  const shipping = current.reduce((sum, order) => sum + order.shippingTotal, 0);
  const categories = new Map<string, number>();
  const sellers = new Map<string, { name: string; quantity: number; amount: number; image?: string }>();
  for (const order of current) for (const item of order.items ?? []) {
    const product = productById.get(item.productId);
    const amount = item.unitPrice * item.quantity;
    categories.set(product?.category || 'Outros', (categories.get(product?.category || 'Outros') ?? 0) + amount);
    const seller = sellers.get(item.productId) ?? { name: item.name, quantity: 0, amount: 0, image: product?.images[0] };
    seller.quantity += item.quantity; seller.amount += amount; sellers.set(item.productId, seller);
  }
  const topCategories = [...categories].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const topSellers = [...sellers.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 3);
  const weekly = Array.from({ length: Math.min(10, Math.ceil(rangeDays / 7)) }, (_, i) => {
    const from = new Date(new Date(end).getTime() - (Math.min(10, Math.ceil(rangeDays / 7)) - i - 1) * 7 * 86400000);
    const to = new Date(from.getTime() + 7 * 86400000);
    return { label: from.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: current.filter(order => { const at = new Date(order.createdAt); return at >= from && at < to; }).reduce((sum, order) => sum + order.grandTotal, 0) };
  });
  const maxWeek = Math.max(1, ...weekly.map(week => week.value));
  const delta = compare && previousRevenue ? `${((revenue / previousRevenue - 1) * 100).toFixed(1)}% vs. período anterior` : compare ? 'Sem receita no período anterior' : 'Pedidos pagos no período';

  function exportCsv() {
    const rows = [['Pedido', 'Data', 'Subtotal', 'Desconto', 'Frete', 'Total'], ...current.map(order => [order.orderNumber, new Date(order.createdAt).toLocaleString('pt-BR'), order.subtotal.toFixed(2), order.discountTotal.toFixed(2), order.shippingTotal.toFixed(2), order.grandTotal.toFixed(2)])];
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `relatorio-penrose-${start}-${end}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="space-y-5">
    <div id="report-filters" className="flex flex-wrap items-center gap-3"><label className="text-xs text-[#9ca3af]">De <input type="date" value={start} max={end} onChange={event => setStart(event.target.value)} className="ml-2 h-10 rounded-md border border-white/15 bg-[#071127] px-3 text-white" /></label><label className="text-xs text-[#9ca3af]">Até <input type="date" value={end} min={start} max={day(new Date())} onChange={event => setEnd(event.target.value)} className="ml-2 h-10 rounded-md border border-white/15 bg-[#071127] px-3 text-white" /></label><label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 text-xs text-[#d1d5db]"><input type="checkbox" checked={compare} onChange={event => setCompare(event.target.checked)} />Comparar com período anterior</label><button id="report-export" type="button" onClick={exportCsv} className="sr-only">Exportar relatório</button></div>
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{[
      { label: 'Receita recebida', value: money.format(revenue), detail: delta, icon: 'orders-badge-dollar', tone: 'border-purple-500/40 text-purple-400' },
      { label: 'Pedidos pagos', value: current.length, detail: 'No período selecionado', icon: 'orders-shopping-cart', tone: 'border-[#064181] text-[#06f]' },
      { label: 'Ticket médio', value: money.format(current.length ? revenue / current.length : 0), detail: 'Por pedido pago', icon: 'orders-badge-dollar', tone: 'border-emerald-500/40 text-emerald-400' },
      { label: 'Conversão', value: '—', detail: 'Tráfego não integrado', icon: 'customers-sparkles', tone: 'border-amber-500/40 text-amber-400' },
    ].map(card => <div key={card.label} className={`h-32 rounded-lg border bg-[#02091b] p-5 shadow-[0_0_16px_rgba(0,102,255,.12)] ${card.tone.split(' ')[0]}`}><div className="flex items-center justify-between text-[13px] text-[#9ca3af]"><span>{card.label}</span><img src={`/assets/admin/${card.icon}.svg`} alt="" width="20" height="20" /></div><p className="mt-2 text-[30px] font-bold leading-none text-white">{card.value}</p><p className={`mt-2 text-[11px] ${card.tone.split(' ')[1]}`}>{card.detail}</p></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]"><section className="rounded-lg border border-[#064181] bg-[#02091b]"><div className="border-b border-white/10 px-5 py-4"><h2 className="text-base font-semibold">Vendas ao longo do período</h2><p className="text-[11px] text-[#6b7280]">Receita recebida por semana</p></div><div className="flex h-64 items-end gap-3 px-5 pb-8 pt-5">{weekly.map(week => <div key={week.label} className="flex min-w-0 flex-1 flex-col items-center gap-2" title={`${week.label}: ${money.format(week.value)}`}><span className="text-[10px] text-[#9ca3af]">{week.value ? money.format(week.value) : ''}</span><div className="w-full rounded-t bg-gradient-to-t from-[#003879] to-[#06f]" style={{ height: `${Math.max(3, 180 * week.value / maxWeek)}px` }} /><span className="text-[10px] text-[#6b7280]">{week.label}</span></div>)}</div></section><section className="rounded-lg border border-[#064181] bg-[#02091b]"><div className="border-b border-white/10 px-5 py-4"><h2 className="text-base font-semibold">Vendas por categoria</h2><p className="text-[11px] text-[#6b7280]">Valor bruto dos itens</p></div><div className="space-y-4 p-5">{topCategories.length ? topCategories.map(([name, value], i) => <div key={name}><div className="mb-1 flex justify-between text-xs"><span>{name}</span><span className="text-[#9ca3af]">{money.format(value)}</span></div><div className="h-1.5 rounded-full bg-white/10"><div className={`h-full rounded-full ${['bg-[#06f]', 'bg-purple-500', 'bg-cyan-400', 'bg-emerald-400'][i]}`} style={{ width: `${100 * value / topCategories[0][1]}%` }} /></div></div>) : <p className="text-xs text-[#9ca3af]">Sem vendas por categoria.</p>}</div></section></div>
    <div className="grid gap-5 xl:grid-cols-3"><section className="rounded-lg border border-[#064181] bg-[#02091b] p-5"><h2 className="text-base font-semibold">Canais de venda</h2><p className="mt-1 text-[11px] text-[#6b7280]">Origem da receita</p><p className="mt-8 text-sm text-[#9ca3af]">A origem dos pedidos ainda não é registrada. Não há dados de canal para exibir.</p></section><section className="rounded-lg border border-[#064181] bg-[#02091b] p-5"><h2 className="text-base font-semibold">Produtos mais vendidos</h2><p className="mt-1 text-[11px] text-[#6b7280]">Por quantidade no período</p><div className="mt-4 space-y-3">{topSellers.length ? topSellers.map((seller, i) => <div key={seller.name} className="flex items-center gap-3 border-b border-white/5 pb-2 text-xs"><span className="text-purple-400">{i + 1}</span>{seller.image && <img src={seller.image} alt="" width="32" height="32" className="h-8 w-8 rounded object-cover" />}<span className="min-w-0 flex-1 truncate">{seller.name}</span><span className="text-[#9ca3af]">{seller.quantity} un.</span><span>{money.format(seller.amount)}</span></div>) : <p className="text-xs text-[#9ca3af]">Sem produtos vendidos.</p>}</div></section><section className="rounded-lg border border-[#064181] bg-[#02091b] p-5"><h2 className="text-base font-semibold">Resumo financeiro</h2><p className="mt-1 text-[11px] text-[#6b7280]">Pedidos pagos no período</p><dl className="mt-4 space-y-3 text-xs">{[['Valor dos itens', gross], ['Descontos', -discounts], ['Frete cobrado', shipping], ['Total recebido', revenue]].map(([label, value]) => <div key={label} className="flex justify-between border-b border-white/5 pb-2"><dt className="text-[#9ca3af]">{label}</dt><dd className={Number(value) < 0 ? 'text-red-400' : label === 'Total recebido' ? 'font-semibold text-emerald-400' : ''}>{money.format(Number(value))}</dd></div>)}</dl><p className="mt-4 text-[11px] text-[#6b7280]">Taxas do provedor não estão disponíveis nesta base.</p></section></div>
  </div>;
}
