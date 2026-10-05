// src/app/(public)/product/[id]/gallery.client.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

type Props = {
  images: string[];
  alt: string;
};

export default function Gallery({ images, alt }: Props) {
  const safe = images;
  const [active, setActive] = useState(0);

  if (!safe.length) return <div className="penrose-gallery-empty" role="img" aria-label={`${alt}: foto em breve`}>Foto em breve</div>;

  return (
    <div className="penrose-gallery">
      {/* Imagem principal */}
      <div className="penrose-gallery-main">
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
      <div className="penrose-gallery-thumbs">
        {safe.map((src, i) => (
          <button
            key={`${src}-${i}`}
            onClick={() => setActive(i)}
            className={[
              'penrose-gallery-thumb',
              i === active
                ? 'is-active' : '',
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
