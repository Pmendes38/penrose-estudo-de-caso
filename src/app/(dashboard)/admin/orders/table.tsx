'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Order, OrderStatus } from '@/features/orders/schemas';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const labels: Record<OrderStatus, string> = { pending: 'Aguardando', processing: 'Em separação', paid: 'Pago', shipped: 'Enviado', delivered: 'Entregue', canceled: 'Cancelado', refunded: 'Estornado' };
const tones: Record<OrderStatus, string> = { pending: 'bg-amber-500/10 text-amber-400', processing: 'bg-purple-500/10 text-purple-400', paid: 'bg-blue-500/10 text-blue-400', shipped: 'bg-emerald-500/10 text-emerald-400', delivered: 'bg-emerald-500/10 text-emerald-400', canceled: 'bg-red-500/10 text-red-400', refunded: 'bg-slate-500/10 text-slate-400' };
const icon = (name: string, size = 16) => <img src={`/assets/admin/${name}.svg`} alt="" width={size} height={size} aria-hidden="true" />;

function csvCell(value: string | number) {
  const text = String(value);
  return `"${(/^[=+@-]/.test(text.trimStart()) ? "'" : '') + text.replaceAll('"', '""')}"`;
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('30');
  const [page, setPage] = useState(1);
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => new Date(order.createdAt).toDateString() === today);
  const pending = orders.filter(order => order.status === 'pending');
  const processing = orders.filter(order => order.status === 'processing');
  const revenue = todayOrders.filter(order => ['paid', 'shipped', 'delivered'].includes(order.status)).reduce((sum, order) => sum + order.grandTotal, 0);
  const filtered = useMemo(() => orders.filter(order => {
    const text = query.trim().toLowerCase();
    return (!text || String(order.orderNumber).includes(text) || order.customerId.toLowerCase().includes(text))
      && (!status || order.status === status)
      && (period === 'all' || new Date(order.createdAt).getTime() >= Date.now() - Number(period) * 86400000);
  }), [orders, query, status, period]);
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * 10, current * 10);
  const first = filtered.length ? (current - 1) * 10 + 1 : 0;
  const last = Math.min(current * 10, filtered.length);

  function exportCsv() {
    const rows = [['Pedido', 'Cliente ID', 'Data', 'Itens', 'Total', 'Status'], ...filtered.map(order => [order.orderNumber, order.customerId, new Date(order.createdAt).toLocaleString('pt-BR'), order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0, order.grandTotal.toFixed(2), labels[order.status]])];
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'pedidos-penrose.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const cards = [
    { label: 'Pedidos hoje', value: todayOrders.length, detail: 'Pedidos registrados hoje', color: 'border-[#064181]', icon: 'orders-shopping-cart', accent: 'text-[#06f]' },
    { label: 'Aguardando pagamento', value: pending.length, detail: `${money.format(pending.reduce((sum, order) => sum + order.grandTotal, 0))} pendentes`, color: 'border-amber-500/40', icon: 'orders-clock', accent: 'text-amber-400' },
    { label: 'Em separação', value: processing.length, detail: 'Pedidos em preparação', color: 'border-purple-500/40', icon: 'package-open', accent: 'text-purple-400' },
    { label: 'Faturamento do dia', value: money.format(revenue), detail: 'Pedidos pagos hoje', color: 'border-emerald-500/40', icon: 'orders-badge-dollar', accent: 'text-emerald-400' },
  ];

  return <div className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <div key={card.label} className={`h-32 rounded-lg border bg-[#02091b] p-5 shadow-[0_0_16px_rgba(0,102,255,.12)] ${card.color}`}><div className="flex items-center justify-between text-[13px] text-[#9ca3af]"><span>{card.label}</span>{icon(card.icon, 20)}</div><p className="mt-2 text-[30px] font-bold leading-none">{card.value}</p><p className={`mt-2 text-[11px] ${card.accent}`}>{card.detail}</p></div>)}</div>
    <div className="flex flex-wrap items-center gap-3 py-2">
      <label className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-md border border-[#064181] bg-[#071127] px-3 xl:max-w-[420px]">{icon('search', 18)}<input aria-label="Buscar pedido ou ID do cliente" type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar pedido ou cliente..." className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#6b7280]" /></label>
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 text-xs">{icon('orders-list-filter', 15)}<select aria-label="Filtrar por status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="bg-transparent outline-none"><option className="bg-[#071127]" value="">Todos os status</option>{Object.entries(labels).map(([value, label]) => <option className="bg-[#071127]" key={value} value={value}>{label}</option>)}</select></label>
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 text-xs">{icon('orders-calendar', 15)}<select aria-label="Filtrar por período" value={period} onChange={event => { setPeriod(event.target.value); setPage(1); }} className="bg-transparent outline-none"><option className="bg-[#071127]" value="30">Últimos 30 dias</option><option className="bg-[#071127]" value="7">Últimos 7 dias</option><option className="bg-[#071127]" value="90">Últimos 90 dias</option><option className="bg-[#071127]" value="all">Todo o período</option></select></label>
      <button onClick={exportCsv} className="ml-auto flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-4 text-[13px] text-[#d1d5db] hover:border-[#06f]">{icon('download')}Exportar</button>
    </div>
    <section className="overflow-hidden rounded-lg border border-[#064181] bg-[#02091b]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="text-base font-semibold">Pedidos recentes</h2><p className="text-[11px] text-[#6b7280]">Dados atualizados ao abrir a página</p></div><span className="rounded-full bg-[#06f]/15 px-3 py-1 text-[11px] text-[#2780ff]">{orders.length} pedidos</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-xs"><thead className="bg-[#061027] text-[11px] uppercase tracking-[.04em] text-[#6b7280]"><tr>{['Pedido', 'Cliente', 'Data', 'Itens', 'Total', 'Status', 'Ações'].map(label => <th key={label} className="px-5 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{visible.map(order => <tr key={order.id} className="border-t border-white/[.07] hover:bg-[#071127]"><td className="px-5 py-4 font-semibold">#{order.orderNumber}</td><td className="px-5 py-4"><span className="block max-w-[170px] truncate text-[#d1d5db]" title={order.customerId}>{order.customerId}</span></td><td className="whitespace-nowrap px-5 py-4 text-[#9ca3af]">{new Date(order.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td><td className="px-5 py-4">{order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? '—'}</td><td className="whitespace-nowrap px-5 py-4 font-semibold">{money.format(order.grandTotal)}</td><td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-2 py-1 text-[11px] ${tones[order.status]}`}>{labels[order.status]}</span></td><td className="px-5 py-4"><Link href={`/admin/orders/${order.id}`} aria-label={`Ver pedido ${order.orderNumber}`} className="inline-flex items-center gap-2 rounded-md bg-[#06f]/15 px-3 py-2 text-[#2780ff] hover:bg-[#06f]/25">{icon('pencil', 13)}Ver</Link></td></tr>)}</tbody></table>{!visible.length && <p className="px-5 py-12 text-center text-sm text-[#9ca3af]">Nenhum pedido encontrado.</p>}</div>
      <div className="flex items-center justify-between border-t border-white/[.07] px-5 py-3 text-[11px] text-[#6b7280]"><span>Mostrando {first}–{last} de {filtered.length} registros</span><div className="flex items-center gap-2"><button disabled={current <= 1} aria-label="Página anterior" onClick={() => setPage(current - 1)} className="rounded bg-[#071127] p-2 disabled:opacity-40">{icon('chevron-left', 14)}</button><span className="rounded bg-[#06f] px-3 py-2 text-white">{current}</span><button disabled={current >= pages} aria-label="Próxima página" onClick={() => setPage(current + 1)} className="rounded bg-[#071127] p-2 disabled:opacity-40">{icon('chevron-right', 14)}</button></div></div>
    </section>
  </div>;
}
