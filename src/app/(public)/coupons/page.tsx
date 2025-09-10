// src/app/(public)/coupons/page.tsx
import { listAvailableCoupons } from '@/features/coupons/api';

export const revalidate = 600; // 10min – SSG + ISR

export default async function PublicCouponsPage() {
  let coupons = [];
  try {
    coupons = await listAvailableCoupons();
  } catch {
    coupons = [];
  }

  return (
    <main className="min-h-screen bg-brand-black">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Cupons Disponíveis</h1>
        <p className="text-brand-gray mb-6">Aplique um cupom válido no checkout.</p>

        {coupons.length === 0 ? (
          <div className="rounded-xl border border-brand-gray-border p-6 bg-brand-gray-dark/40 text-brand-gray">
            Nenhum cupom disponível no momento.
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {coupons.map((c: any) => (
              <li key={c.id} className="rounded-xl border border-brand-gray-border bg-brand-gray-dark/40 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-white font-semibold">{c.code}</span>
                  <span className="text-brand-gray text-xs">
                    {new Date(c.startsAt).toLocaleDateString('pt-BR')} — {new Date(c.endsAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-brand-gray mt-1">{c.description}</p>
                <div className="mt-2 text-brand-gray-light text-sm">
                  {c.type === 'PERCENT' ? `${c.value}% off` : `Desconto de R$ ${c.value.toFixed(2)}`}
                </div>
                {!!c.minimumOrderValue && (
                  <div className="text-xs text-brand-gray mt-1">Mínimo: R$ {Number(c.minimumOrderValue).toFixed(2)}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
