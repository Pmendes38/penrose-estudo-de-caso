import { listShippingServices } from '@/features/shipping/api';

export const revalidate = 3600;

export default async function ServicesPage() {
  let services: Array<{ id: string; name: string; company?: { name?: string } }> = [];

  try {
    services = await listShippingServices();
  } catch {
    services = [];
  }

  return (
    <main className="min-h-screen bg-brand-black">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Serviços de Entrega</h1>
        <p className="text-brand-gray mb-6">Serviços habilitados na loja.</p>

        {services.length === 0 ? (
          <div className="rounded-xl border border-brand-gray-border p-6 bg-brand-gray-dark/40 text-brand-gray">
            Nenhum serviço configurado no momento.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-brand-gray-border p-4 bg-brand-gray-dark/40"
              >
                <div className="text-white font-semibold">{s.name}</div>
                <div className="text-brand-gray text-sm">{s.company?.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
