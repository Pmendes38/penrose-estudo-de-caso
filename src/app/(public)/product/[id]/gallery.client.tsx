// src/app/(public)/product/[id]/gallery.client.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

type Props = {
  images: string[];
  alt: string;
};

export default function Gallery({ images, alt }: Props) {
  const safe = images.length ? images : ['/assets/wide-logo.svg'];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      {/* Imagem principal */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl border border-brand-gray-border bg-brand-gray-dark">
        <Image
          src={safe[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbs */}
      <div className="grid grid-cols-5 gap-2">
        {safe.map((src, i) => (
          <button
            key={`${src}-${i}`}
            onClick={() => setActive(i)}
            className={[
              'relative aspect-square overflow-hidden rounded-lg border transition-colors',
              i === active
                ? 'border-brand-blue ring-2 ring-brand-blue/40'
                : 'border-brand-gray-border hover:border-brand-blue/50',
            ].join(' ')}
            aria-label={`Imagem ${i + 1}`}
          >
            <Image
              src={src}
              alt={`${alt} – miniatura ${i + 1}`}
              fill
              sizes="100px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
