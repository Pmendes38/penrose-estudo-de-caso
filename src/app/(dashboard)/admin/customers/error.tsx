'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-red-400">Falha ao carregar clientes</h2>
      <p className="text-brand-gray">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 rounded text-white"
      >
        Tentar novamente
      </button>
    </div>
  );
}
