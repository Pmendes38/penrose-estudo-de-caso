import { memo } from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const LoadingSpinner = memo(function LoadingSpinner({
  size = 'md',
  className = '',
}: { size?: Size; className?: string }) {
  const sizeClasses: Record<Size, string> = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-brand-gray border-t-brand-blue w-full h-full" />
    </div>
  );
});

const SkeletonCard = memo(function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-brand-gray-dark rounded-lg p-4 ${className}`}>
      <div className="bg-brand-gray-border h-48 rounded-lg mb-4" />
      <div className="space-y-2">
        <div className="bg-brand-gray-border h-4 rounded w-3/4" />
        <div className="bg-brand-gray-border h-4 rounded w-1/2" />
        <div className="bg-brand-gray-border h-6 rounded w-1/4 mt-4" />
      </div>
    </div>
  );
});

const SkeletonText = memo(function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`bg-brand-gray-border h-4 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
});

const PageLoader = memo(function PageLoader({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-brand-gray-dark p-8 rounded-lg text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-brand-gray-light font-medium">{message}</p>
      </div>
    </div>
  );
});

const ButtonLoader = memo(function ButtonLoader({ size = 'md', className = '' }: { size?: Size; className?: string }) {
  return <LoadingSpinner size={size} className={`text-current ${className}`} />;
});

export { LoadingSpinner, SkeletonCard, SkeletonText, PageLoader, ButtonLoader };