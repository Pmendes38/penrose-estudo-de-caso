import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import { fetchPublicProduct } from '@/features/products/api';

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

function ProductJsonLd({ product }: { product: any }) {
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

  return (
    <>
      <ProductJsonLd product={product} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="mt-2 text-brand-gray-light">
          {(product.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        {/* Renderize galeria, descrição, botão de compra, etc. */}
      </main>
    </>
  );
}
