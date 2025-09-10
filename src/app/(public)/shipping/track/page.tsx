// src/app/(public)/shipping/track/page.tsx
import TrackForm from '@/features/shipping/ui/TrackForm';
export const metadata = { title: 'Rastrear Pedido | Penrøse' };

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-brand-black">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Rastrear Pedido</h1>
        <p className="text-brand-gray mb-6">Informe o código de rastreio (ex.: LB123456789BR).</p>
        <TrackForm />
      </div>
    </main>
  );
}
