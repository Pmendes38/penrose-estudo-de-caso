'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Customer } from '@/features/customers/schemas';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const asset = (name: string, size = 16) => <img src={`/assets/admin/${name}.svg`} alt="" width={size} height={size} aria-hidden="true" />;
const segment = (customer: Customer) => customer.paidOrders >= 2 ? 'Recorrente' : customer.paidOrders === 1 ? 'Primeira compra' : 'Sem compras';
const month = (date: string | null, now: Date) => !!date && new Date(date).getMonth() === now.getMonth() && new Date(date).getFullYear() === now.getFullYear();

function csvCell(value: string | number) {
  const text = String(value);
  return `"${(/^[=+@-]/.test(text.trimStart()) ? "'" : '') + text.replaceAll('"', '""')}"`;
}

export default function CustomersTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [activity, setActivity] = useState('');
  const [period, setPeriod] = useState('');
  const [page, setPage] = useState(1);
  const now = new Date();
  const buyers = customers.filter(customer => customer.paidOrders > 0);
  const newThisMonth = customers.filter(customer => month(customer.createdAt, now)).length;
  const averageSpent = buyers.length ? buyers.reduce((sum, customer) => sum + customer.totalSpent, 0) / buyers.length : 0;
  const filtered = useMemo(() => customers.filter(customer => {
    const text = query.trim().toLocaleLowerCase('pt-BR');
    return (!text || [customer.name, customer.email, customer.phone ?? ''].some(value => value.toLocaleLowerCase('pt-BR').includes(text)))
      && (!segmentFilter || segment(customer) === segmentFilter)
      && (!activity || (activity === 'buyers' ? customer.paidOrders > 0 : customer.paidOrders === 0))
      && (!period || !!customer.createdAt && new Date(customer.createdAt).getTime() >= Date.now() - Number(period) * 86400000);
  }), [customers, query, segmentFilter, activity, period]);
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * 10, current * 10);
  const first = filtered.length ? (current - 1) * 10 + 1 : 0;
  const last = Math.min(current * 10, filtered.length);
  const cards = [
    { label: 'Total de clientes', value: customers.length, detail: `${newThisMonth} novos neste mês`, icon: 'customers-users', color: 'border-[#064181]', accent: 'text-[#06f]' },
    { label: 'Clientes compradores', value: buyers.length, detail: `${customers.length ? Math.round(buyers.length / customers.length * 100) : 0}% da base`, icon: 'customers-user-check', color: 'border-emerald-500/40', accent: 'text-emerald-400' },
    { label: 'Novos no mês', value: newThisMonth, detail: 'Cadastros neste mês', icon: 'customers-user-plus', color: 'border-purple-500/40', accent: 'text-purple-400' },
    { label: 'Gasto médio por comprador', value: money.format(averageSpent), detail: 'Pedidos pagos', icon: 'customers-sparkles', color: 'border-[#064181]', accent: 'text-[#06f]' },
  ];

  function exportCsv() {
    const rows = [['Cliente', 'E-mail', 'Telefone', 'Pedidos', 'Pedidos pagos', 'Gasto total', 'Última compra', 'Segmento'], ...filtered.map(customer => [customer.name, customer.email, customer.phone ?? '', customer.totalOrders, customer.paidOrders, customer.totalSpent.toFixed(2), customer.lastOrder ?? '', segment(customer)])];
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'clientes-penrose.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <div key={card.label} className={`h-32 rounded-lg border bg-[#02091b] p-5 shadow-[0_0_16px_rgba(0,102,255,.12)] ${card.color}`}><div className="flex items-center justify-between text-[13px] text-[#9ca3af]"><span>{card.label}</span>{asset(card.icon, 20)}</div><p className="mt-2 text-[30px] font-bold leading-none">{card.value}</p><p className={`mt-2 text-[11px] ${card.accent}`}>{card.detail}</p></div>)}</div>
    <div className="flex flex-wrap items-center gap-3 py-2"><label id="customer-search" className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-md border border-[#064181] bg-[#071127] px-3 xl:max-w-[430px]">{asset('search', 18)}<input aria-label="Buscar por nome, e-mail ou telefone" type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por nome, e-mail ou telefone..." className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#6b7280]" /></label>
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 text-xs">{asset('customers-users-round', 15)}<select aria-label="Filtrar segmento" value={segmentFilter} onChange={event => { setSegmentFilter(event.target.value); setPage(1); }} className="bg-transparent outline-none">{['', 'Recorrente', 'Primeira compra', 'Sem compras'].map(value => <option key={value} value={value} className="bg-[#071127]">{value || 'Todos os segmentos'}</option>)}</select></label>
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 text-xs">{asset('circle-dot', 15)}<select aria-label="Filtrar atividade" value={activity} onChange={event => { setActivity(event.target.value); setPage(1); }} className="bg-transparent outline-none"><option value="" className="bg-[#071127]">Todos os clientes</option><option value="buyers" className="bg-[#071127]">Com compras</option><option value="nonbuyers" className="bg-[#071127]">Sem compras</option></select></label>
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 text-xs">{asset('orders-calendar', 15)}<select aria-label="Filtrar data de cadastro" value={period} onChange={event => { setPeriod(event.target.value); setPage(1); }} className="bg-transparent outline-none"><option value="" className="bg-[#071127]">Qualquer período</option><option value="30" className="bg-[#071127]">Últimos 30 dias</option><option value="90" className="bg-[#071127]">Últimos 90 dias</option></select></label>
      <button type="button" disabled title="Criação de segmentos personalizados ainda não disponível" className="ml-auto flex h-10 items-center gap-2 rounded-md border border-[#d15dff] bg-[#d15dff]/10 px-4 text-[13px] text-[#d15dff] opacity-60">{asset('customers-git-branch')}Criar segmento</button>
      <button type="button" onClick={exportCsv} className="flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-4 text-[13px] text-[#d1d5db] hover:border-[#06f]">{asset('download')}Exportar</button>
    </div>
    <section className="overflow-hidden rounded-lg border border-[#064181] bg-[#02091b]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="text-base font-semibold">Base de clientes</h2><p className="text-[11px] text-[#6b7280]">Segmentação calculada com pedidos pagos</p></div><span className="rounded-full bg-[#06f]/15 px-3 py-1 text-[11px] text-[#2780ff]">{customers.length} clientes</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-xs"><thead className="bg-[#061027] text-[11px] uppercase tracking-[.04em] text-[#6b7280]"><tr>{['Cliente', 'Contato', 'Pedidos', 'Gasto total', 'Última compra', 'Segmento', 'Ações'].map(label => <th key={label} className="px-5 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{visible.map(customer => <tr key={customer.id} className="border-t border-white/[.07] hover:bg-[#071127]"><td className="px-5 py-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#06f]/15 text-[11px] font-bold text-[#06f]">{customer.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</span><span><strong className="block font-semibold">{customer.name}</strong><small className="text-[10px] text-[#6b7280]">{customer.createdAt ? `Cliente desde ${new Date(customer.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}` : 'Cadastro sem data'}</small></span></div></td><td className="px-5 py-3"><span className="block">{customer.email}</span><span className="text-[10px] text-[#6b7280]">{customer.phone || 'Telefone não informado'}</span></td><td className="px-5 py-3 font-semibold">{customer.totalOrders}</td><td className="whitespace-nowrap px-5 py-3 font-semibold">{money.format(customer.totalSpent)}</td><td className="whitespace-nowrap px-5 py-3 text-[#9ca3af]">{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString('pt-BR') : '—'}</td><td className="px-5 py-3"><span className={`whitespace-nowrap rounded-full px-2 py-1 text-[11px] ${customer.paidOrders >= 2 ? 'bg-purple-500/10 text-purple-400' : customer.paidOrders === 1 ? 'bg-[#06f]/15 text-[#2780ff]' : 'bg-white/5 text-[#9ca3af]'}`}>{segment(customer)}</span></td><td className="px-5 py-3"><Link href={`/admin/orders?customer=${encodeURIComponent(customer.id)}`} aria-label={`Ver pedidos de ${customer.name}`} className="inline-flex items-center gap-2 rounded-md bg-[#06f]/15 px-3 py-2 text-[#2780ff] hover:bg-[#06f]/25">{asset('pencil', 13)}Pedidos</Link></td></tr>)}</tbody></table>{!visible.length && <p className="px-5 py-12 text-center text-sm text-[#9ca3af]">Nenhum cliente encontrado.</p>}</div>
      <div className="flex items-center justify-between border-t border-white/[.07] px-5 py-3 text-[11px] text-[#6b7280]"><span>Mostrando {first}–{last} de {filtered.length} registros</span><div className="flex items-center gap-2"><button type="button" disabled={current <= 1} aria-label="Página anterior" onClick={() => setPage(current - 1)} className="rounded bg-[#071127] p-2 disabled:opacity-40">{asset('chevron-left', 14)}</button><span className="rounded bg-[#06f] px-3 py-2 text-white">{current}</span><button type="button" disabled={current >= pages} aria-label="Próxima página" onClick={() => setPage(current + 1)} className="rounded bg-[#071127] p-2 disabled:opacity-40">{asset('chevron-right', 14)}</button></div></div>
    </section>
  </div>;
}
