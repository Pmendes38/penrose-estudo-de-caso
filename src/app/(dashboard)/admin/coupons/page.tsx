import Link from 'next/link';
import { listAdminCoupons } from '@/features/coupons/api';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  let coupons: any[] = [];
  try {
    coupons = await listAdminCoupons();
  } catch {
    coupons = [];
  }

  return (
    <main className="min-h-screen bg-brand-black">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Cupons (Admin)</h1>
            <p className="text-brand-gray">
              {coupons.length} registro{coupons.length !== 1 ? 's' : ''}.
            </p>
          </div>
          <Link
            href="/admin/coupons/new"
            className="px-4 py-2 rounded-md bg-brand-blue text-white hover:bg-blue-600"
          >
            + Novo Cupom
          </Link>
        </header>

        <div className="rounded-xl border border-brand-gray-border overflow-hidden">
          <table className="min-w-full divide-y divide-brand-gray-border">
            <thead className="bg-brand-gray-dark/60 text-brand-gray-light">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Código</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Descrição</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Janela</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Ativo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-border">
              {coupons.map((c) => (
                <tr key={c.id} className="text-brand-gray">
                  <td className="px-4 py-3 font-semibold text-white">{c.code}</td>
                  <td className="px-4 py-3">{c.description}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">
                    {c.type === 'PERCENT' ? `${c.value}%` : `R$ ${Number(c.value).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(c.startsAt).toLocaleDateString('pt-BR')} — {new Date(c.endsAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">{c.active ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/coupons/${c.id}`}
                      className="px-3 py-1 rounded border border-brand-gray-border text-brand-gray-light hover:text-white"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-brand-gray">
                    Nenhum cupom encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
