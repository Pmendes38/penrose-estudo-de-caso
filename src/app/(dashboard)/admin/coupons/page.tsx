// src/app/(dashboard)/admin/coupons/page.tsx
import { listAdminCoupons } from '@/features/coupons/api/api';

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await listAdminCoupons();

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cupons</h1>
        <a href="/admin/coupons/new" className="btn-primary">Novo cupom</a>
      </header>

      <div className="overflow-x-auto rounded border border-brand-gray-border">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-gray-dark text-left">
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Período</th>
              <th className="px-3 py-2">Ativo</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-t border-brand-gray-border">
                <td className="px-3 py-2 font-mono">{c.code}</td>
                <td className="px-3 py-2">{c.type}</td>
                <td className="px-3 py-2">
                  {c.type === 'PERCENT' ? `${c.value}%` : `R$ ${c.value.toFixed(2)}`}
                </td>
                <td className="px-3 py-2">
                  {c.startsAt.toLocaleDateString('pt-BR')} – {c.endsAt.toLocaleDateString('pt-BR')}
                </td>
                <td className="px-3 py-2">{c.active ? 'Sim' : 'Não'}</td>
                <td className="px-3 py-2 text-right">
                  <a className="underline" href={`/admin/coupons/${c.id}`}>Editar</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
