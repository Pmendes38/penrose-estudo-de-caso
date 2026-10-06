'use client';

import Link from 'next/link';
import { useState, type MouseEvent } from 'react';
import type { Coupon } from '@/features/coupons/schemas';
import type { Order } from '@/features/orders/schemas';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
const icon = (name: string) => <img src={`/assets/admin/${name}.svg`} alt="" className="shrink-0" aria-hidden="true" />;
const csvCell = (value: string | number) => { const text = String(value); return `"${(/^[=+@-]/.test(text.trimStart()) ? "'" : '') + text.replaceAll('"', '""')}"`; };
const isActive = (coupon: Coupon, now: Date) => coupon.active && coupon.startsAt <= now && coupon.endsAt >= now && (!coupon.maxRedemptions || coupon.currentRedemptions < coupon.maxRedemptions);

export default function CouponsTable({ coupons, orders }: { coupons: Coupon[]; orders: Order[] }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [validity, setValidity] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const now = new Date();
  const active = coupons.filter(coupon => isActive(coupon, now));
  const paidOrders = orders.filter(order => ['paid', 'shipped', 'delivered'].includes(order.status) && !!order.couponCode);
  const thisMonth = paidOrders.filter(order => { const date = new Date(order.createdAt); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); });
  const discounts = thisMonth.reduce((sum, order) => sum + order.discountTotal, 0);
  const influenced = thisMonth.reduce((sum, order) => sum + order.grandTotal, 0);
  const text = query.trim().toLocaleLowerCase('pt-BR');
  const filtered = coupons.filter(coupon =>
    (!text || `${coupon.code} ${coupon.description}`.toLocaleLowerCase('pt-BR').includes(text)) && (!type || coupon.type === type)
    && (!status || (status === 'active' ? isActive(coupon, now) : !isActive(coupon, now)))
    && (!validity || (validity === 'future' ? coupon.startsAt > now : validity === 'expired' ? coupon.endsAt < now : coupon.startsAt <= now && coupon.endsAt >= now))
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * 10, current * 10);
  const first = filtered.length ? (current - 1) * 10 + 1 : 0;
  const last = Math.min(current * 10, filtered.length);
  const cards = [
    { label: 'Cupons ativos', value: active.length, detail: 'Válidos e disponíveis', icon: 'coupons-ticket-percent', color: 'border-[#0066ff]/[.33]', accent: 'text-[#0066ff]', shadow: 'shadow-[0_0_16px_rgba(0,102,255,.2)]' },
    { label: 'Usos no mês', value: thisMonth.length, detail: 'Pedidos pagos com cupom', icon: 'coupons-pointer', color: 'border-[#d15dff]/[.33]', accent: 'text-[#d15dff]', shadow: 'shadow-[0_0_16px_rgba(209,93,255,.2)]' },
    { label: 'Descontos concedidos', value: money.format(discounts), detail: 'Neste mês', icon: 'coupons-badge-percent', color: 'border-[#f59e0b]/[.33]', accent: 'text-[#f59e0b]', shadow: 'shadow-[0_0_16px_rgba(0,102,255,.2)]' },
    { label: 'Receita influenciada', value: money.format(influenced), detail: discounts ? `${(influenced / discounts).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x receita sobre desconto` : 'Pedidos pagos com cupom', icon: 'coupons-trending-up', color: 'border-[#10b981]/[.33]', accent: 'text-[#10b981]', shadow: 'shadow-[0_0_16px_rgba(0,102,255,.2)]' },
  ];

  function exportCsv() {
    const rows = [['Código', 'Descrição', 'Tipo', 'Valor', 'Usos', 'Limite', 'Início', 'Fim', 'Ativo'], ...filtered.map(coupon => [coupon.code, coupon.description, coupon.type, coupon.value, coupon.currentRedemptions, coupon.maxRedemptions ?? '', coupon.startsAt.toISOString(), coupon.endsAt.toISOString(), coupon.active ? 'Sim' : 'Não'])];
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'cupons-penrose.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyCode(code: string) {
    try { await navigator.clipboard.writeText(code); setMessage(`Código ${code} copiado.`); }
    catch { setMessage('Não foi possível copiar o código. Selecione o código na tabela para copiá-lo.'); }
  }

  function toggleActions(event: MouseEvent<HTMLButtonElement>) {
    const menu = event.currentTarget.nextElementSibling as HTMLElement;
    if (menu.matches(':popover-open')) { menu.hidePopover(); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    menu.style.left = `${Math.max(8, rect.right - 176)}px`;
    menu.style.top = `${Math.min(window.innerHeight - 90, rect.bottom + 6)}px`;
    menu.showPopover();
  }

  return <div className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card =>
      <div key={card.label} className={`flex h-32 min-w-0 flex-col gap-[7px] rounded-lg border bg-[#02091b] p-5 ${card.color} ${card.shadow}`}>
        <div className="flex items-center justify-between text-[13px] text-[#9ca3af]"><span>{card.label}</span>{icon(card.icon)}</div>
        <p className="text-[30px] font-bold leading-normal text-white">{card.value}</p>
        <p className={`text-[11px] ${card.accent}`}>{card.detail}</p>
      </div>
    )}</div>

    <div className="flex flex-wrap items-center gap-3 py-5">
      <label id="coupon-search" className="flex h-10 min-w-[230px] flex-1 items-center gap-[10px] rounded-md border border-[#0066ff]/[.33] bg-[#071127] px-3 xl:max-w-[420px]">
        {icon('search')}<input type="search" aria-label="Buscar cupom" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por código ou campanha..." className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#6b7280] focus-visible:ring-1 focus-visible:ring-[#06f]" />
      </label>
      <label className="relative flex h-10 w-[175px] items-center gap-2 rounded-md border border-white/[.14] bg-[#071127] px-3 text-xs text-[#d1d5db]">
        {icon('coupons-ticket')}<select aria-label="Tipo de cupom" value={type} onChange={event => { setType(event.target.value); setPage(1); }} className="min-w-0 flex-1 appearance-none bg-transparent pr-4 outline-none focus-visible:ring-1 focus-visible:ring-[#06f]"><option value="" className="bg-[#071127]">Todos os tipos</option><option value="PERCENT" className="bg-[#071127]">Percentual</option><option value="FIXED" className="bg-[#071127]">Valor fixo</option></select><span className="pointer-events-none absolute right-3">{icon('chevron-down')}</span>
      </label>
      <label className="relative flex h-10 w-[170px] items-center gap-2 rounded-md border border-white/[.14] bg-[#071127] px-3 text-xs text-[#d1d5db]">
        {icon('circle-dot')}<select aria-label="Status do cupom" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="min-w-0 flex-1 appearance-none bg-transparent pr-4 outline-none focus-visible:ring-1 focus-visible:ring-[#06f]"><option value="" className="bg-[#071127]">Todos os status</option><option value="active" className="bg-[#071127]">Ativos</option><option value="inactive" className="bg-[#071127]">Inativos</option></select><span className="pointer-events-none absolute right-3">{icon('chevron-down')}</span>
      </label>
      <label className="relative flex h-10 w-[180px] items-center gap-2 rounded-md border border-white/[.14] bg-[#071127] px-3 text-xs text-[#d1d5db]">
        {icon('orders-calendar')}<select aria-label="Validade do cupom" value={validity} onChange={event => { setValidity(event.target.value); setPage(1); }} className="min-w-0 flex-1 appearance-none bg-transparent pr-4 outline-none focus-visible:ring-1 focus-visible:ring-[#06f]"><option value="" className="bg-[#071127]">Qualquer validade</option><option value="current" className="bg-[#071127]">Vigentes</option><option value="future" className="bg-[#071127]">Futuros</option><option value="expired" className="bg-[#071127]">Expirados</option></select><span className="pointer-events-none absolute right-3">{icon('chevron-down')}</span>
      </label>
      <button type="button" onClick={exportCsv} className="ml-auto flex h-10 items-center gap-2 rounded-md border border-white/[.14] bg-[#071127] px-4 text-[13px] font-semibold text-[#d1d5db] hover:border-[#06f]">{icon('download')}Exportar</button>
    </div>

    <section className="rounded-lg border border-[#0066ff]/[.33] bg-[#02091b]">
      <div className="flex h-[66px] items-center justify-between border-b border-white/[.14] px-5">
        <div><h2 className="text-base font-semibold">Cupons e promoções</h2><p className="text-[11px] text-[#6b7280]">Regras aplicadas automaticamente no checkout</p></div>
        <span className="rounded-full bg-[#06f]/15 px-3 py-1 text-[11px] text-[#0066ff]">{active.length} ativos</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1140px] table-fixed text-left text-xs">
          <colgroup><col /><col className="w-[180px]" /><col className="w-[130px]" /><col className="w-[180px]" /><col className="w-[190px]" /><col className="w-[130px]" /><col className="w-[106px]" /></colgroup>
          <thead className="h-[42px] border-b border-white/[.14] bg-[#061027] text-[11px] uppercase tracking-[.04em] text-[#6b7280]"><tr>{['Código', 'Tipo', 'Desconto', 'Uso', 'Validade', 'Status', 'Ações'].map(label => <th key={label} className="px-5 font-semibold">{label}</th>)}</tr></thead>
          <tbody>{visible.map(coupon => {
            const highlighted = coupon.type === 'PERCENT' && coupon.value >= 15;
            return <tr key={coupon.id} className="h-[62px] border-b border-white/[.07] hover:bg-[#071127]">
              <td className="px-5"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${highlighted ? 'bg-[#d15dff]/10' : 'bg-[#06f]/15'}`}>{icon(highlighted ? 'coupons-row-purple' : 'coupons-row-blue')}</span><div className="min-w-0"><strong className="block truncate text-[13px] font-bold tracking-[.03em]">{coupon.code}</strong><span className="block truncate text-[10px] text-[#6b7280]" title={coupon.description}>{coupon.description}</span></div></div></td>
              <td className="px-5">{coupon.type === 'PERCENT' ? 'Percentual' : 'Valor fixo'}</td>
              <td className="px-5 font-semibold">{coupon.type === 'PERCENT' ? `${coupon.value}% OFF` : money.format(coupon.value)}</td>
              <td className="px-5"><div className="max-w-[140px]"><div className="flex justify-between gap-2 text-[10px]"><span>{coupon.currentRedemptions} usos</span><span className="text-[#6b7280]">{coupon.maxRedemptions ? `de ${coupon.maxRedemptions}` : 'sem limite'}</span></div>{coupon.maxRedemptions && <div className="mt-[5px] h-[5px] w-[132px] rounded-[3px] bg-white/[.07]"><div className={`h-full rounded-[3px] ${highlighted ? 'bg-[#d15dff]' : 'bg-[#06f]'}`} style={{ width: `${Math.min(100, coupon.currentRedemptions / coupon.maxRedemptions * 100)}%` }} /></div>}</div></td>
              <td className="whitespace-nowrap px-5 text-[#9ca3af]">até {dateFormat.format(coupon.endsAt)}</td>
              <td className="px-5"><span className={`inline-flex h-6 items-center rounded-full px-[10px] text-[11px] font-medium ${isActive(coupon, now) ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-white/5 text-[#9ca3af]'}`}>{isActive(coupon, now) ? 'Ativo' : 'Inativo'}</span></td>
              <td className="px-5"><div className="flex h-[30px] w-16 items-center justify-center rounded-md bg-[#06f]/15">
                <Link href={`/admin/coupons/${coupon.id}`} aria-label={`Editar cupom ${coupon.code}`} className="flex h-[30px] w-8 items-center justify-center rounded-md hover:bg-[#06f]/25">{icon('pencil')}</Link>
                <button type="button" aria-label={`Mais ações para ${coupon.code}`} aria-haspopup="true" aria-controls={`coupon-actions-${coupon.id}`} onClick={toggleActions} className="flex h-[30px] w-8 items-center justify-center rounded-md hover:bg-[#06f]/25">{icon('ellipsis')}</button>
                <div id={`coupon-actions-${coupon.id}`} {...{ popover: 'auto' }} className="fixed bottom-auto right-auto m-0 w-44 rounded-md border border-[#064181] bg-[#071127] p-1 text-xs text-white shadow-xl"><Link href={`/admin/coupons/${coupon.id}`} className="block rounded px-3 py-2 hover:bg-[#06f]/15">Editar cupom</Link><button type="button" className="w-full rounded px-3 py-2 text-left hover:bg-[#06f]/15" onClick={event => { void copyCode(coupon.code); (event.currentTarget.parentElement as HTMLElement).hidePopover(); }}>Copiar código</button></div>
              </div></td>
            </tr>;
          })}</tbody>
        </table>
        {!visible.length && <p className="px-5 py-12 text-center text-sm text-[#9ca3af]">Nenhum cupom encontrado.</p>}
      </div>
      <div className="flex h-12 items-center justify-between gap-3 px-5 text-[11px] text-[#6b7280]">
        <span>Mostrando {first}–{last} de {filtered.length} registros</span>
        <div className="flex items-center gap-[6px]"><button type="button" disabled={current <= 1} aria-label="Página anterior" onClick={() => setPage(current - 1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-[#071127] disabled:opacity-40">{icon('chevron-left')}</button><span className="flex h-7 w-7 items-center justify-center bg-[#06f] font-semibold text-white" aria-label={`Página ${current} de ${pages}`}>{current}</span><button type="button" disabled={current >= pages} aria-label="Próxima página" onClick={() => setPage(current + 1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-[#071127] disabled:opacity-40">{icon('chevron-right')}</button></div>
      </div>
    </section>
    <p role="status" className="text-xs text-[#9ca3af]">{message}</p>
  </div>;
}
