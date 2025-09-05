'use client';

import Image, { ImageProps } from 'next/image';
import { useState, memo, useMemo } from 'react';
import { LoadingSpinner } from '@/shared/ui/loading/Loading';

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
  showLoader?: boolean;
  containerClassName?: string;
};

function base64Encode(str: string) {
  if (typeof window !== 'undefined') return window.btoa(unescape(encodeURIComponent(str)));
  // ambiente server: Buffer está ok
  // eslint-disable-next-line n/no-deprecated-api
  return Buffer.from(str, 'utf-8').toString('base64');
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/assets/image-placeholder.jpg',
  showLoader = true,
  className = '',
  containerClassName = '',
  quality = 85,
  fill,
  sizes,
  width,
  height,
  priority,
  placeholder = 'blur',
  blurDataURL,
  onLoadingComplete,
  ...props
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const defaultBlur = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='100%' height='100%' fill='#1f2937'/></svg>`;
    return `data:image/svg+xml;base64,${base64Encode(svg)}`;
  }, [blurDataURL]);

  const isSvg = typeof currentSrc === 'string' && currentSrc.toLowerCase().endsWith('.svg');

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setErrored(true);
    }
    setIsLoading(false);
  };

  const commonCls = `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`;

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${containerClassName}`}>
      {isSvg ? (
        <img
          src={currentSrc}
          alt={alt}
          width={width as number | undefined}
          height={height as number | undefined}
          className={commonCls}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          {...props as any}
        />
      ) : (
        <Image
          src={currentSrc}
          alt={alt}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={defaultBlur}
          fill={fill}
          sizes={sizes}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className={commonCls}
          onLoadingComplete={(img) => {
            setIsLoading(false);
            onLoadingComplete?.(img);
          }}
          onError={handleError}
          {...props}
        />
      )}

      {showLoader && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-gray-dark/40">
          <LoadingSpinner size="md" />
        </div>
      )}

      {errored && (
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

export default OptimizedImage;
