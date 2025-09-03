'use client';

import Image from 'next/image';
import { useState, memo } from 'react';
import { LoadingSpinner } from '../Loading/Loading';

const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,

  fill = false,
  sizes,
  quality = 85,
  objectFit = 'cover',
  objectPosition = 'center',
  fallbackSrc = '/assets/image-placeholder.jpg',
  showLoader = true,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = (result) => {
    setIsLoading(false);
    onLoad?.(result);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    setCurrentSrc(fallbackSrc);
    onError?.();
  };

  // Generate blur data URL if not provided
  const generateBlurDataURL = (w = 8, h = 8) => {
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1f2937"/>
      </svg>
    `;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  };

  const defaultBlurDataURL = blurDataURL || generateBlurDataURL();

  const imageProps = {
    src: currentSrc,
    alt,
    quality,
    priority,
    placeholder,
    blurDataURL: defaultBlurDataURL,
    onLoad: handleLoad,
    onError: handleError,
    className: `transition-opacity duration-300 ${
      isLoading ? 'opacity-0' : 'opacity-100'
    } ${className}`,
    style: {
      objectFit,
      objectPosition: objectPosition === 'center' ? 'top' : objectPosition,
    },
    ...props,
  };

  if (fill) {
    imageProps.fill = true;
    imageProps.sizes = sizes || '100vw';
  } else {
    imageProps.width = width;
    imageProps.height = height;
    if (sizes) imageProps.sizes = sizes;
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {(() => {
        const isSvg = typeof currentSrc === 'string' && currentSrc.toLowerCase().endsWith('.svg');
        if (isSvg) {
          return (
            <img
              src={currentSrc}
              alt={alt || ''}
              width={width}
              height={height}
              className={className}
              style={{ objectFit, objectPosition }}
              onLoad={handleLoad}
              onError={handleError}
              {...props}
            />
          );
        }
        return <Image alt={alt || ''} {...imageProps} />;
      })()}
      
      {/* Loading overlay */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-gray-dark/50 backdrop-blur-xs">
          <LoadingSpinner size="md" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-gray-dark/80 text-brand-gray text-sm">
          <div className="text-center">
            <div className="text-brand-gray-border mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p>Imagem não disponível</p>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;