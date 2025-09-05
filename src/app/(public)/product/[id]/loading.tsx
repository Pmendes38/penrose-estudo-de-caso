export default function LoadingProduct() {
  return (
    <div className="min-h-screen bg-brand-black">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="w-full aspect-square bg-gray-800 rounded-xl animate-pulse" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full aspect-square bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-gray-800 rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-gray-800 rounded w-1/2 animate-pulse" />
            <div className="space-y-2">
              {[1,2,3].map((i) => <div key={i} className="h-4 bg-gray-800 rounded animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
