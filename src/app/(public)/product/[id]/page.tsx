// src/app/(public)/product/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { fetchPublicProduct } from '@/features/products/api';
import { formatBRL } from '@/shared/lib/format';
import type { Product } from '@/features/products/schemas';
import Gallery from './gallery.client';
import SizeSelectorClient from './size-selector.client';
import AddToCartClient from './add-to-cart.client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://exemplo.invalid';

type PageParams = { params: { id: string } };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const product = await fetchPublicProduct(params.id).catch(() => null);
  if (!product) return { title: 'Produto não encontrado | Penrøse' };

  const title = `${product.name} | Penrøse`;
  const description = product.description ?? 'Action figure Penrøse';
  const images = (product.images?.length ? product.images : ['/assets/wide-logo.svg'])
    .map((src) => (src.startsWith('http') ? src : `${SITE_URL}${src}`));
  const canonical = `${SITE_URL}/product/${product.slug ?? params.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title,
      description,
      siteName: 'Penrøse',
      locale: 'pt_BR',
      images: images.map((url) => ({ url })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

function ProductJsonLd({ product }: { product: Product }) {
  const availability =
    product.status === 'active' && (product.stock ?? 0) > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku ?? product.id,
    brand: { '@type': 'Brand', name: 'Penrøse' },
    image: product.images ?? [],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: String((product.priceCents ?? 0) / 100),
      availability,
      url: `${SITE_URL}/product/${product.slug ?? product.id}`,
    },
  };

  return (
    <Script
      id="product-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function ProductPage({ params }: PageParams) {
  const product = await fetchPublicProduct(params.id).catch(() => null);
  if (!product) notFound();

  const images = product.images?.length ? product.images : ['/assets/wide-logo.svg'];
  const inStock = (product.stock ?? 0) > 0 && product.status === 'active';

  return (
    <>
      <ProductJsonLd product={product as Product} />

      <main className="min-h-screen bg-brand-black">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-brand-gray">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-brand-gray-light transition-colors">Início</Link>
              </li>
              <li>›</li>
              <li>
                <Link href="/#loja" className="hover:text-brand-gray-light transition-colors">Loja</Link>
              </li>
              <li>›</li>
              <li className="text-brand-gray-light truncate max-w-[60ch]">{product.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* GALERIA */}
            <section>
              <Gallery images={images} alt={product.name} />
            </section>

            {/* PAINEL DIREITO */}
            <section className="space-y-6">
              {/* Título + preço */}
              <header className="space-y-2">
                <h1 className="text-3xl font-bold text-white">{product.name}</h1>

                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold text-brand-gray-light">
                    {formatBRL((product.priceCents ?? 0) / 100)}
                  </span>

                  {inStock ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-700/40 text-emerald-100 text-xs font-medium px-2 py-1">
                      ● Em estoque
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-700/40 text-red-100 text-xs font-medium px-2 py-1">
                      ● Esgotado
                    </span>
                  )}
                </div>

                <div className="text-xs text-brand-gray">
                  {product.sku && <span>SKU: <span className="text-brand-gray-light">{product.sku}</span></span>}
                  {typeof product.stock === 'number' && (
                    <span className="ml-3">Estoque: <span className="text-brand-gray-light">{product.stock}</span></span>
                  )}
                </div>
              </header>

              {/* Selector de tamanho (se houver) */}
              {Array.isArray((product as any).sizes) && (product as any).sizes.length > 0 && (
                <div className="pt-2">
                  {/* @ts-ignore — sizes é opcional no nosso schema */}
                  <SizeSelectorClient sizes={(product as any).sizes} />
                </div>
              )}

              {/* Ações */}
              <div className="pt-2">
                <AddToCartClient
                  product={{
                    id: product.id,
                    name: product.name,
                    images: product.images,
                    mainImage: product.images?.[0],
                    // @ts-ignore — sizes opcional
                    sizes: (product as any).sizes ?? [{ name: 'Único', price: (product.priceCents ?? 0) / 100, inStock }],
                  }}
                />
              </div>

              {/* Benefícios / badges */}
              <ul className="grid sm:grid-cols-3 gap-3 pt-2 text-sm text-brand-gray">
                <li className="rounded-lg border border-brand-gray-border bg-brand-gray-dark px-3 py-2">🚚 Envio para todo Brasil</li>
                <li className="rounded-lg border border-brand-gray-border bg-brand-gray-dark px-3 py-2">💳 4x sem juros</li>
                <li className="rounded-lg border border-brand-gray-border bg-brand-gray-dark px-3 py-2">🛡️ Garantia de qualidade</li>
              </ul>

              {/* Descrição */}
              {product.description && (
                <section className="pt-4">
                  <h2 className="text-lg font-semibold text-brand-gray-light mb-2">Descrição</h2>
                  <div className="leading-relaxed text-brand-gray whitespace-pre-line">
                    {product.description}
                  </div>
                </section>
              )}
            </section>
          </div>

          {/* Sessão: informações adicionais (mock / opcional) */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-brand-gray-border bg-brand-gray-dark p-5">
              <h3 className="font-semibold text-brand-gray-light mb-2">Material & Acabamento</h3>
              <p className="text-brand-gray text-sm">Impressão 3D + acabamento manual, pintura premium e base estável.</p>
            </div>
            <div className="rounded-lg border border-brand-gray-border bg-brand-gray-dark p-5">
              <h3 className="font-semibold text-brand-gray-light mb-2">Envio & Prazo</h3>
              <p className="text-brand-gray text-sm">Produção sob demanda. Prazo médio 10–20 dias úteis + frete.</p>
            </div>
            <div className="rounded-lg border border-brand-gray-border bg-brand-gray-dark p-5">
              <h3 className="font-semibold text-brand-gray-light mb-2">Trocas & Suporte</h3>
              <p className="text-brand-gray text-sm">Atendimento humanizado. Troca em até 7 dias para defeitos.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
