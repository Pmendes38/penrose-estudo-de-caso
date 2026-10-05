import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProduct } from '@/features/products/api';
import { findCatalogProduct, productPrice } from '@/features/products/catalog';
import { formatBRL } from '@/shared/lib/format';
import Gallery from './gallery.client';
import AddToCartClient from './add-to-cart.client';

type PageParams = { params: { id: string } };
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.penrose.example';

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const source = findCatalogProduct(params.id);
  const product = source ?? await getProduct(params.id).catch(() => null);
  if (!product) return { title: 'Produto não encontrado | Penrøse' };
  return {
    title: `${product.name} | Penrøse`,
    description: product.description || `Conheça ${product.name} no catálogo Penrøse.`,
    alternates: { canonical: `${SITE_URL}/product/${source?.id ?? product.slug}` },
    openGraph: { images: product.images[0] ? [product.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: PageParams) {
  const source = findCatalogProduct(params.id);
  const api = source ? null : await getProduct(params.id).catch(() => null);
  if (!source && !api) notFound();

  const product = source ?? api!;
  const images = product.images?.length ? product.images : ['/assets/wide-logo.svg'];
  const price = source ? productPrice(source) : { cents: api!.priceCents, estimated: false };
  const oldPrice = source?.regularPriceCents && source.salePriceCents ? source.regularPriceCents : null;
  const canBuy = !source && api!.status === 'active' && api!.stock > 0;
  const inquiry = `https://wa.me/5500000000000?text=${encodeURIComponent(`Olá! Gostaria de consultar ${product.name} (${source?.sku ?? api?.sku ?? product.id}).`)}`;

  return <div className="penrose-page penrose-product-page">
    <nav className="penrose-breadcrumb" aria-label="Caminho"><Link href="/">Home</Link><span>/</span><Link href="/catalog">Coleção</Link><span>/</span><strong>{product.name}</strong></nav>
    <div className="penrose-product-layout">
      <div className="penrose-product-media">
        <Gallery images={images} alt={product.name} />
        <dl className="penrose-product-specs">
          <div><dt>Categoria</dt><dd>{product.category || 'Colecionável'}</dd></div>
          <div><dt>Referência</dt><dd>{source?.sku ?? api?.sku ?? product.id}</dd></div>
        </dl>
      </div>
      <section className="penrose-product-info">
        <h1>{product.name}</h1>
        <p className="penrose-product-subtitle">{source?.sourceCategory || product.category || 'Action figure'} by Penrøse</p>
        <div className="penrose-purchase-panel">
          <p className="penrose-stock">{canBuy ? 'Em estoque' : 'Disponibilidade sob consulta'}</p>
          {oldPrice && <del>DE: {formatBRL(oldPrice / 100)}</del>}
          <strong className="penrose-product-price">{formatBRL(price.cents / 100)}</strong>
          {price.estimated && <p className="penrose-price-note">Valor estimado com base na planilha. Confirme o preço final antes de encomendar.</p>}
          {source?.variants.length ? <div className="penrose-variant-list"><span>Tamanhos informados na planilha</span>{source.variants.map((variant) => <span key={variant.sku}>{variant.name}: {variant.priceCents ? formatBRL(variant.priceCents / 100) : 'sob consulta'}</span>)}</div> : null}
          {canBuy ? <AddToCartClient product={{ id: api!.id, sku: api!.sku ?? undefined, name: api!.name, images: api!.images, mainImage: api!.images[0], sizes: [{ name: 'Único', price: api!.priceCents / 100, inStock: true }] }} />
            : <a className="penrose-inquiry-button" href={inquiry} target="_blank" rel="noopener noreferrer">Consultar disponibilidade</a>}
          <small>Preços e disponibilidade sujeitos à confirmação pela Penrøse.</small>
        </div>
        <section className="penrose-product-about"><h2>Sobre o produto</h2><p>{product.description || 'Detalhes deste produto sob consulta.'}</p></section>
        <details className="penrose-product-accordion"><summary>Detalhes</summary><p>Referência: {source?.sku ?? api?.sku ?? product.id}</p></details>
        <details className="penrose-product-accordion"><summary>Fotos do produto</summary><p>{images.length} {images.length === 1 ? 'imagem disponível' : 'imagens disponíveis'} na galeria.</p></details>
      </section>
    </div>
  </div>;
}
