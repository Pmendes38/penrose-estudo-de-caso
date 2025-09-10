import ShippingPlayground from '@/features/shipping/ui/ShippingPlayground';

export const metadata = { title: 'Calcular Frete | Penrøse' };

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-brand-black">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Calcular Frete</h1>
        <p className="text-brand-gray mb-6">Informe seu CEP e as dimensões para estimar opções de envio.</p>
        <ShippingPlayground />
      </div>
    </main>
  );
}
