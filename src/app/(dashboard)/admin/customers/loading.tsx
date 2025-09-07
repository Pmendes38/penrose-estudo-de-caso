export default function Loading() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-gray-light">Clientes</h2>
      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}