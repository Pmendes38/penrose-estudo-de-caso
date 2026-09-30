// src/app/(public)/product/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { getProduct } from '@/features/products/api';
import { formatBRL } from '@/shared/lib/format';
import type { Product } from '@/features/products/schemas';
import Gallery from './gallery.client';
import SizeSelectorClient from './size-selector.client';
import AddToCartClient from './add-to-cart.client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://exemplo.invalid';

type PageParams = { params: { id: string } };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const product = await getProduct(params.id).catch(() => null);
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
  const product = await getProduct(params.id).catch(() => null);
  if (!product) notFound();

  const images = product.images?.length ? product.images : ['/assets/wide-logo.svg'];
  const inStock = (product.stock ?? 0) > 0 && product.status === 'active';

  return <>
    <ProductJsonLd product={product as Product} />
    <div className="penrose-page penrose-product-page">
      <nav className="penrose-breadcrumb"><Link href="/">Início</Link><span>›</span><Link href="/catalog">Catálogo</Link><span>›</span><strong>{product.name}</strong></nav>
      <div className="penrose-product-layout">
        <section className="penrose-product-gallery"><Gallery images={images} alt={product.name} /></section>
        <section className="penrose-product-info">
          <p className="penrose-product-kicker">ACTION FIGURE COLECIONÁVEL</p>
          <h1>{product.name}</h1>
          <div className="penrose-product-rating">★★★★★ <span>Peça produzida para colecionadores exigentes</span></div>
          <strong className="penrose-product-price">{formatBRL((product.priceCents ?? 0) / 100)}</strong>
          <span className={inStock ? 'penrose-stock is-stock' : 'penrose-stock'}>{inStock ? '● EM ESTOQUE' : '● ESGOTADO'}</span>
          {product.description && <div className="penrose-product-description">{product.description}</div>}
          {Array.isArray((product as any).sizes) && (product as any).sizes.length > 0 && <SizeSelectorClient sizes={(product as any).sizes} />}
          <AddToCartClient product={{ id: product.id, sku: product.sku, name: product.name, images: product.images, mainImage: product.images?.[0], sizes: (product as any).sizes ?? [{ name: 'Único', price: (product.priceCents ?? 0) / 100, inStock }] }} />
          <div className="penrose-product-benefits"><span>Envio para todo Brasil</span><span>Pagamento seguro</span><span>Acabamento manual</span></div>
        </section>
      </div>
      <section className="penrose-product-details"><article><h2>MATERIAL & ACABAMENTO</h2><p>Impressão 3D de alta precisão, pintura premium e acabamento manual.</p></article><article><h2>ENVIO & PRAZO</h2><p>Produção sob demanda e embalagem segura para sua coleção.</p></article><article><h2>TROCAS & SUPORTE</h2><p>Atendimento humanizado durante toda a experiência de compra.</p></article></section>
    </div>
  </>;
}
