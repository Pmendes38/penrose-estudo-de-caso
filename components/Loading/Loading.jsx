import { memo } from 'react';

const LoadingSpinner = memo(({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-brand-gray border-t-brand-blue"></div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

const SkeletonCard = memo(({ className = '' }) => (
  <div className={`animate-pulse bg-brand-gray-dark rounded-lg p-4 ${className}`}>
    <div className="bg-brand-gray-border h-48 rounded-lg mb-4"></div>
    <div className="space-y-2">
      <div className="bg-brand-gray-border h-4 rounded w-3/4"></div>
      <div className="bg-brand-gray-border h-4 rounded w-1/2"></div>
      <div className="bg-brand-gray-border h-6 rounded w-1/4 mt-4"></div>
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

const SkeletonText = memo(({ lines = 3, className = '' }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`bg-brand-gray-border h-4 rounded ${
          i === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
));

SkeletonText.displayName = 'SkeletonText';

const PageLoader = memo(({ message = 'Carregando...' }) => (
  <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-brand-gray-dark p-8 rounded-lg text-center">
      <LoadingSpinner size="xl" className="mx-auto mb-4" />
      <p className="text-brand-gray-light font-medium">{message}</p>
    </div>
  </div>
));

PageLoader.displayName = 'PageLoader';

const ButtonLoader = memo(({ size = 'md', className = '' }) => (
  <LoadingSpinner size={size} className={`text-current ${className}`} />
));

ButtonLoader.displayName = 'ButtonLoader';

export { LoadingSpinner, SkeletonCard, SkeletonText, PageLoader, ButtonLoader };