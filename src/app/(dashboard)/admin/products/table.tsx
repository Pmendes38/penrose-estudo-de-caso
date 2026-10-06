'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { deleteProductAction, toggleProductStatusAction } from './actions';
import { filterProducts, productMetrics, type AdminProduct } from './catalog';

const asset = (name: string) => `/assets/admin/${name}.svg`;
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PAGE_SIZE = 8;

function icon(name: string, width: number, height = width) {
  return <img src={asset(name)} alt="" width={width} height={height} aria-hidden="true" />;
}

function csvCell(value: string | number) {
  const text = String(value);
  return `"${(/^[=+@-]/.test(text.trimStart()) ? "'" : '') + text.replaceAll('"', '""')}"`;
}

export default function ProductsTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [stock, setStock] = useState('');
  const [page, setPage] = useState(1);
  const metrics = useMemo(() => productMetrics(products), [products]);
  const categories = useMemo(() => [...new Set(products.map(product => product.category).filter((value): value is string => !!value))].sort(), [products]);
  const filtered = useMemo(() => filterProducts(products, { q, category, status, stock }), [products, q, category, status, stock]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const first = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const last = Math.min(currentPage * PAGE_SIZE, filtered.length);

  function exportCsv() {
    const rows = [
      ['Produto', 'SKU', 'Categoria', 'Preço', 'Estoque', 'Status'],
      ...filtered.map(product => [product.name, product.sku ?? '', product.category ?? '', (product.priceCents / 100).toFixed(2), product.madeToOrder ? 'Sob encomenda' : product.stock ?? 0, product.status]),
    ];
    const content = '\ufeff' + rows.map(row => row.map(csvCell).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'produtos-penrose.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function updateStatus(product: AdminProduct) {
    start(async () => {
      try { await toggleProductStatusAction(product.id, product.status); router.refresh(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Erro ao atualizar produto'); }
    });
  }

  function remove(product: AdminProduct) {
    if (!confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`)) return;
    start(async () => {
      try { await deleteProductAction(product.id); router.refresh(); }
      catch (error) { alert(error instanceof Error ? error.message : 'Erro ao excluir produto'); }
    });
  }

  const kpis = [
    { label: 'Produtos ativos', value: metrics.active, detail: `+${metrics.addedThisMonth} neste mês`, icon: 'package-check', accent: 'text-[#06f]', border: 'border-[#064181]' },
    { label: 'Estoque total', value: metrics.stock, detail: `${brl.format(metrics.inventoryCents / 100)} em inventário`, icon: 'boxes', accent: 'text-[#06f]', border: 'border-[#064181]' },
    { label: 'Estoque baixo', value: metrics.low, detail: 'Requer reposição', icon: 'triangle-alert', accent: 'text-[#f59e0b]', border: 'border-[#72540e]' },
    { label: 'Esgotados', value: metrics.out, detail: `${products.length ? Math.round(metrics.out / products.length * 100) : 0}% do catálogo`, icon: 'package-x', accent: 'text-[#d15dff]', border: 'border-[#71358c]' },
  ];

  return <div className="space-y-5 font-['Instrument_Sans'] text-white">
    <section aria-label="Indicadores do catálogo" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{kpis.map(kpi => <div key={kpi.label} className={`min-h-32 rounded-lg border ${kpi.border} bg-[#02091b] p-5 shadow-[0_0_16px_rgba(0,102,255,.14)]`}>
      <div className="flex items-center justify-between text-[13px] text-[#9ca3af]"><span>{kpi.label}</span>{icon(kpi.icon, 20)}</div>
      <p className="mt-1 text-3xl font-bold leading-tight">{kpi.value}</p><p className={`mt-1 text-[11px] ${kpi.accent}`}>{kpi.detail}</p>
    </div>)}</section>

    <div className="flex flex-wrap items-center gap-3">
      <label className="flex h-10 w-full items-center gap-2 rounded-md border border-[#123d76] bg-[#071127] px-3 md:w-[420px]">{icon('search', 18)}<span className="sr-only">Buscar por produto ou SKU</span><input id="product-search" value={q} onChange={event => { setQ(event.target.value); setPage(1); }} className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[#6b7280]" placeholder="Buscar por produto ou SKU..." type="search" /></label>
      <label className="flex h-10 w-full items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 sm:w-[190px]">{icon('layers', 15)}<span className="sr-only">Categoria</span><select value={category} onChange={event => { setCategory(event.target.value); setPage(1); }} className="min-w-0 flex-1 appearance-none bg-transparent text-xs outline-none"><option value="" className="bg-[#071127]">Todas as categorias</option>{categories.map(value => <option key={value} value={value} className="bg-[#071127]">{value}</option>)}</select>{icon('chevron-down', 15)}</label>
      <label className="flex h-10 w-full items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 sm:w-[170px]">{icon('circle-dot', 15)}<span className="sr-only">Status</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="min-w-0 flex-1 appearance-none bg-transparent text-xs outline-none"><option value="" className="bg-[#071127]">Todos os status</option><option value="active" className="bg-[#071127]">Ativos</option><option value="inactive" className="bg-[#071127]">Inativos</option></select>{icon('chevron-down', 15)}</label>
      <label className="flex h-10 w-full items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-3 sm:w-[180px]">{icon('package-open', 15)}<span className="sr-only">Estoque</span><select value={stock} onChange={event => { setStock(event.target.value); setPage(1); }} className="min-w-0 flex-1 appearance-none bg-transparent text-xs outline-none"><option value="" className="bg-[#071127]">Qualquer estoque</option><option value="available" className="bg-[#071127]">Disponível</option><option value="low" className="bg-[#071127]">Estoque baixo</option><option value="out" className="bg-[#071127]">Esgotado</option></select>{icon('chevron-down', 15)}</label>
      <button onClick={exportCsv} className="ml-auto flex h-10 items-center gap-2 rounded-md border border-white/15 bg-[#071127] px-4 text-[13px] text-[#c3cada] hover:border-[#06f] hover:text-white">{icon('download', 16)}Exportar</button>
    </div>

    <section className="overflow-hidden rounded-lg border border-[#174377] bg-[#02091b]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="text-base font-semibold">Catálogo de produtos</h2><p className="text-xs text-[#6b7280]">Preços e disponibilidade atualizados</p></div><span className="rounded-full bg-[#062864] px-3 py-1 text-xs text-[#1980ff]">{filtered.length} produtos</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-[13px]"><thead className="bg-[#071127] text-[11px] uppercase text-[#8b9ab1]"><tr><th className="px-5 py-3 font-normal">Produto</th><th className="px-4 py-3 font-normal">SKU</th><th className="px-4 py-3 font-normal">Categoria</th><th className="px-4 py-3 font-normal">Preço</th><th className="px-4 py-3 font-normal">Estoque</th><th className="px-4 py-3 font-normal">Status</th><th className="px-4 py-3 font-normal">Ações</th></tr></thead><tbody>{visible.map(product => <tr key={product.id} className="border-t border-white/[.07] hover:bg-[#071936]"><td className="px-5 py-2"><div className="flex items-center gap-3">{product.images[0] ? <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded bg-[#0a1b39] text-[#3895ff]" aria-hidden="true">□</span>}<div className="min-w-0"><p className="max-w-64 truncate font-medium">{product.name}</p><p className="max-w-64 truncate text-[11px] text-[#8b9ab1]">{product.description || (product.madeToOrder ? 'Produção sob encomenda' : 'Produto do catálogo')}</p></div></div></td><td className="px-4 py-2 text-[#9ca3af]">{product.sku || '—'}</td><td className="px-4 py-2 text-[#c5cad3]">{product.category || '—'}</td><td className="px-4 py-2 font-semibold">{brl.format(product.priceCents / 100)}</td><td className="px-4 py-2">{product.madeToOrder ? <span className="text-[#3adca7]">Sob encomenda</span> : `${product.stock ?? 0} un.`}</td><td className="px-4 py-2"><span className={`rounded-full px-3 py-1 text-[11px] ${product.status === 'active' ? 'bg-[#06392f] text-[#00e69c]' : 'bg-[#4b1930] text-[#ff7b9e]'}`}>{product.status === 'active' ? 'Ativo' : 'Inativo'}</span></td><td className="px-4 py-2"><div className="flex items-center gap-2"><Link href={`/admin/products/edit/${product.id}`} aria-label={`Editar ${product.name}`} title="Editar" className="rounded bg-[#062455] p-2 hover:bg-[#074191]">{icon('pencil', 13)}</Link><details><summary aria-label={`Mais ações para ${product.name}`} className="cursor-pointer list-none rounded bg-[#062455] p-2 hover:bg-[#074191]">{icon('ellipsis', 14)}</summary><div className="mt-2 min-w-36 rounded border border-[#174377] bg-[#071127] p-1 shadow-xl"><button disabled={pending} onClick={() => updateStatus(product)} className="block w-full rounded px-3 py-2 text-left hover:bg-[#0a2a57]">{product.status === 'active' ? 'Desativar' : 'Ativar'}</button><button disabled={pending} onClick={() => remove(product)} className="block w-full rounded px-3 py-2 text-left text-[#ff8a9b] hover:bg-[#0a2a57]">Excluir</button></div></details></div></td></tr>)}</tbody></table>{!visible.length && <p className="px-5 py-12 text-center text-[#9ca3af]">Nenhum produto encontrado para esses filtros.</p>}</div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-xs text-[#8b9ab1]"><span>Mostrando {first}–{last} de {filtered.length} registros</span><div className="flex items-center gap-2"><button aria-label="Página anterior" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="rounded bg-[#071127] p-2 disabled:opacity-40">{icon('chevron-left', 14)}</button><span className="rounded bg-[#06f] px-3 py-2 text-white">{currentPage}</span><button aria-label="Próxima página" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)} className="rounded bg-[#071127] p-2 disabled:opacity-40">{icon('chevron-right', 14)}</button></div></div>
    </section>
  </div>;
}
