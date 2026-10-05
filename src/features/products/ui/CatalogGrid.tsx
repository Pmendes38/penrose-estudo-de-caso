import Image from 'next/image';
import Link from 'next/link';
import { formatBRL } from '@/shared/lib/format';
import { productPrice, type CatalogProduct } from '../catalog';

export default function CatalogGrid({ products }: { products: CatalogProduct[] }) {
  if (!products.length) {
    return <div className="penrose-empty-state"><h3>Nenhum produto encontrado</h3><p>Tente ajustar os filtros.</p></div>;
  }

  return <section aria-label="Lista de produtos" className="penrose-catalog-grid">
    {products.map((product) => {
      const price = productPrice(product);
      const href = `/product/${product.id}`;
      return <article key={product.sku} className="penrose-store-card">
        <Link href={href} className={`penrose-store-card-image${product.images.length ? '' : ' is-placeholder'}`}>
          {product.images[0] ? <Image src={product.images[0]} alt={product.name} fill sizes="(min-width: 1200px) 22vw, (min-width: 640px) 45vw, 100vw" /> : <span>Foto em breve</span>}
        </Link>
        <div className="penrose-store-card-copy">
          <h3><Link href={href}>{product.name}</Link></h3>
          <p className="penrose-card-series">{product.sourceCategory || product.category}</p>
          <div className="penrose-card-bottom">
            {product.regularPriceCents && product.salePriceCents && <del>DE: {formatBRL(product.regularPriceCents / 100)}</del>}
            <span>{price.estimated ? 'Valor estimado' : product.variants.length && !product.salePriceCents ? 'A partir de' : 'POR'}: {formatBRL(price.cents / 100)}</span>
          </div>
          <Link href={href} className="penrose-card-details" aria-label={`Ver detalhes de ${product.name}`}>Detalhes ↗</Link>
        </div>
      </article>;
    })}
  </section>;
}
