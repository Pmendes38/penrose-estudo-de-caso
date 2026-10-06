'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Coupon } from '@/features/coupons/schemas';
import type { Order } from '@/features/orders/schemas';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const icon = (name: string, size = 16) => <img src={`/assets/admin/${name}.svg`} alt="" width={size} height={size} aria-hidden="true" />;
const csvCell = (value: string | number) => { const text = String(value); return `"${(/^[=+@-]/.test(text.trimStart()) ? "'" : '') + text.replaceAll('"', '""')}"`; };
const isActive = (coupon: Coupon, now: Date) => coupon.active && coupon.startsAt <= now && coupon.endsAt >= now && (!coupon.maxRedemptions || coupon.currentRedemptions < coupon.maxRedemptions);

export default function CouponsTable({ coupons, orders }: { coupons: Coupon[]; orders: Order[] }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [validity, setValidity] = useState('');
  const [page, setPage] = useState(1);
  const now = new Date();
  const active = coupons.filter(coupon => isActive(coupon, now));
  const paidOrders = orders.filter(order => ['paid', 'shipped', 'delivered'].includes(order.status) && !!order.couponCode);
  const thisMonth = paidOrders.filter(order => { const date = new Date(order.createdAt); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); });
  const discounts = thisMonth.reduce((sum, order) => sum + order.discountTotal, 0);
  const influenced = thisMonth.reduce((sum, order) => sum + order.grandTotal, 0);
  const filtered = useMemo(() => coupons.filter(coupon => {
    const text = query.trim().toLowerCase();
    return (!text || `${coupon.code} ${coupon.description}`.toLowerCase().includes(text)) && (!type || coupon.type === type)
      && (!status || (status === 'active' ? isActive(coupon, now) : !isActive(coupon, now)))
      && (!validity || (validity === 'future' ? coupon.startsAt > now : validity === 'expired' ? coupon.endsAt < now : coupon.startsAt <= now && coupon.endsAt >= now));
  }), [coupons, query, type, status, validity]);
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * 10, current * 10);
  const first = filtered.length ? (current - 1) * 10 + 1 : 0;
  const last = Math.min(current * 10, filtered.length);
  const cards = [
    { label: 'Cupons ativos', value: active.length, detail: 'Válidos e disponíveis', icon: 'coupons-ticket-percent', color: 'border-[#064181]', accent: 'text-[#06f]' },
    { label: 'Usos no mês', value: thisMonth.length, detail: 'Pedidos pagos com cupom', icon: 'coupons-pointer', color: 'border-purple-500/40', accent: 'text-purple-400' },
    { label: 'Descontos concedidos', value: money.format(discounts), detail: 'Neste mês', icon: 'coupons-badge-percent', color: 'border-amber-500/40', accent: 'text-amber-400' },
    { label: 'Receita influenciada', value: money.format(influenced), detail: 'Pedidos pagos com cupom', icon: 'coupons-trending-up', color: 'border-emerald-500/40', accent: 'text-emerald-400' },
  ];

  function exportCsv() {
    const rows = [['Código', 'Descrição', 'Tipo', 'Valor', 'Usos', 'Limite', 'Início', 'Fim', 'Ativo'], ...filtered.map(coupon => [coupon.code, coupon.description, coupon.type, coupon.value, coupon.currentRedemptions, coupon.maxRedemptions ?? '', coupon.startsAt.toISOString(), coupon.endsAt.toISOString(), coupon.active ? 'Sim' : 'Não'])];
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'cupons-penrose.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="space-y-5"><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <div key={card.label} className={`h-32 rounded-lg border bg-[#02091b] p-5 shadow-[0_0_16px_rgba(0,102,255,.12)] ${card.color}`}><div className="flex items-center justify-between text-[13px] text-[#9ca3af]"><span>{card.label}</span>{icon(card.icon, 20)}</div><p className="mt-2 text-[30px] font-bold leading-none">{card.value}</p><p className={`mt-2 text-[11px] ${card.accent}`}>{card.detail}</p></div>)}</div>
    <div className="flex flex-wrap items-center gap-3 py-2"><label id="coupon-search" className="flex h-10 min-w-[230px] flex-1 items-center gap-2 rounded-md border border-[#064181] bg-[#071127] px-3 xl:max-w-[420px]">{icon('search', 18)}<input type="search" aria-label="Buscar cupom" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por código ou campanha..." className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#6b7280]" /></label>
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 text-xs">{icon('coupons-ticket-percent', 15)}<select aria-label="Tipo de cupom" value={type} onChange={event => { setType(event.target.value); setPage(1); }} className="bg-transparent outline-none"><option value="" className="bg-[#071127]">Todos os tipos</option><option value="PERCENT" className="bg-[#071127]">Percentual</option><option value="FIXED" className="bg-[#071127]">Valor fixo</option></select></label>
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 text-xs">{icon('circle-dot', 15)}<select aria-label="Status do cupom" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="bg-transparent outline-none"><option value="" className="bg-[#071127]">Todos os status</option><option value="active" className="bg-[#071127]">Ativos</option><option value="inactive" className="bg-[#071127]">Inativos</option></select></label>
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 text-xs">{icon('orders-calendar', 15)}<select aria-label="Validade do cupom" value={validity} onChange={event => { setValidity(event.target.value); setPage(1); }} className="bg-transparent outline-none"><option value="" className="bg-[#071127]">Qualquer validade</option><option value="current" className="bg-[#071127]">Vigentes</option><option value="future" className="bg-[#071127]">Futuros</option><option value="expired" className="bg-[#071127]">Expirados</option></select></label>
      <button type="button" onClick={exportCsv} className="ml-auto flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-4 text-[13px] text-[#d1d5db] hover:border-[#06f]">{icon('download')}Exportar</button></div>
    <section className="overflow-hidden rounded-lg border border-[#064181] bg-[#02091b]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="text-base font-semibold">Cupons e promoções</h2><p className="text-[11px] text-[#6b7280]">Regras aplicadas no checkout</p></div><span className="rounded-full bg-[#06f]/15 px-3 py-1 text-[11px] text-[#2780ff]">{active.length} ativos</span></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-[#061027] text-[11px] uppercase tracking-[.04em] text-[#6b7280]"><tr>{['Código', 'Tipo', 'Desconto', 'Uso', 'Validade', 'Status', 'Ações'].map(label => <th key={label} className="px-5 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{visible.map(coupon => <tr key={coupon.id} className="border-t border-white/[.07] hover:bg-[#071127]"><td className="px-5 py-3"><strong className="block font-semibold">{coupon.code}</strong><small className="text-[10px] text-[#6b7280]">{coupon.description}</small></td><td className="px-5 py-3">{coupon.type === 'PERCENT' ? 'Percentual' : 'Valor fixo'}</td><td className="px-5 py-3 font-semibold">{coupon.type === 'PERCENT' ? `${coupon.value}% OFF` : money.format(coupon.value)}</td><td className="min-w-36 px-5 py-3"><span>{coupon.currentRedemptions} {coupon.maxRedemptions ? `de ${coupon.maxRedemptions}` : 'usos'}</span>{coupon.maxRedemptions && <div className="mt-1 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.min(100, coupon.currentRedemptions / coupon.maxRedemptions * 100)}%` }} /></div>}</td><td className="whitespace-nowrap px-5 py-3 text-[#9ca3af]">até {coupon.endsAt.toLocaleDateString('pt-BR')}</td><td className="px-5 py-3"><span className={`rounded-full px-2 py-1 text-[11px] ${isActive(coupon, now) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-[#9ca3af]'}`}>{isActive(coupon, now) ? 'Ativo' : 'Inativo'}</span></td><td className="px-5 py-3"><Link href={`/admin/coupons/${coupon.id}`} aria-label={`Editar cupom ${coupon.code}`} className="inline-flex items-center gap-2 rounded-md bg-[#06f]/15 px-3 py-2 text-[#2780ff] hover:bg-[#06f]/25">{icon('pencil', 13)}Editar</Link></td></tr>)}</tbody></table>{!visible.length && <p className="px-5 py-12 text-center text-sm text-[#9ca3af]">Nenhum cupom encontrado.</p>}</div><div className="flex items-center justify-between border-t border-white/[.07] px-5 py-3 text-[11px] text-[#6b7280]"><span>Mostrando {first}–{last} de {filtered.length} registros</span><div className="flex items-center gap-2"><button type="button" disabled={current <= 1} aria-label="Página anterior" onClick={() => setPage(current - 1)} className="rounded bg-[#071127] p-2 disabled:opacity-40">{icon('chevron-left', 14)}</button><span className="rounded bg-[#06f] px-3 py-2 text-white">{current}</span><button type="button" disabled={current >= pages} aria-label="Próxima página" onClick={() => setPage(current + 1)} className="rounded bg-[#071127] p-2 disabled:opacity-40">{icon('chevron-right', 14)}</button></div></div></section></div>;
}
