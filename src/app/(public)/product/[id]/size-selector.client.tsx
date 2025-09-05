'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatBRL } from '@/shared/lib/format';

type Size = { name: string; price: number; originalPrice?: number; inStock?: boolean };

export default function SizeSelectorClient({ sizes }: { sizes: Size[] }) {
  const [selected, setSelected] = useState<Size | null>(() => sizes.find(s => s.inStock) ?? sizes[0] ?? null);
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Tamanho</h3>
        <a
          href="https://example.supabase.co/storage/v1/object/public/produtos/Tamanhos/GUIADETAMANHOS.jpg"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brand-blue hover:underline transition-colors inline-flex items-center gap-2"
        >
          📏 Guia de tamanhos
          <Image
            src="https://example.supabase.co/storage/v1/object/public/produtos/Tamanhos/GUIADETAMANHOS.jpg"
            alt="Guia de Tamanhos"
            width={24}
            height={24}
            className="rounded object-cover"
          />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {sizes.map((size) => {
          const active = selected?.name === size.name;
          return (
            <button
              key={size.name}
              onClick={() => setSelected(size)}
              disabled={!size.inStock}
              className={[
                'relative p-3 rounded-lg border-2 transition-all',
                active
                  ? 'border-brand-blue bg-brand-blue text-white shadow-lg'
                  : size.inStock
                  ? 'border-gray-600 text-gray-300 hover:border-brand-blue/50 hover:bg-gray-800'
                  : 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed',
              ].join(' ')}
            >
              <span className="font-medium">{size.name}</span>
              {!size.inStock && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1 rounded-full">
                  ESG
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-1">
        {selected ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-white">{formatBRL(selected.price)}</span>
              {selected.originalPrice && selected.originalPrice > selected.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatBRL(selected.originalPrice)}</span>
                  <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                    -{Math.round(((selected.originalPrice - selected.price) / selected.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-400">Parcelamos em até 4x sem juros (ou até 12x sob consulta)</p>
          </>
        ) : (
          <p className="text-lg text-gray-400">Selecione um tamanho para ver o preço</p>
        )}
      </div>
    </section>
  );
}
