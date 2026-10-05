import Link from 'next/link';
import { catalogProducts } from '@/features/products/catalog';

const suggestions = ['pnr-092', 'pnr-030', 'pnr-001']
  .map((id) => catalogProducts.find((product) => product.id === id))
  .filter((product): product is (typeof catalogProducts)[number] => Boolean(product?.images[0]));

export default function EmptyStoreState({ kind }: { kind: 'cart' | 'checkout' }) {
  const isCart = kind === 'cart';
  return <section className="penrose-store-empty" aria-labelledby="empty-title">
    <div className="penrose-store-empty-icon" aria-hidden="true"><svg width="42" height="42" viewBox="0 0 42 42" fill="none"><rect x="8" y="13" width="26" height="23" rx="3" stroke="#071327" strokeWidth="2.5"/><path d="M14 14V9a7 7 0 0 1 14 0v5" stroke="#071327" strokeWidth="2.5"/><path d="M17 23a4 4 0 0 0 8 0" stroke="#071327" strokeWidth="2.5"/></svg></div>
    <h1 id="empty-title">Seu {isCart ? 'carrinho' : 'checkout'} está vazio</h1>
    <p>{isCart ? 'Sua próxima peça de coleção está esperando por você. Explore universos, personagens e encomendas exclusivas.' : 'Adicione uma peça ao carrinho antes de preencher entrega e pagamento. Seus dados continuarão seguros.'}</p>
    <div className="penrose-store-empty-actions"><Link href="/catalog">EXPLORAR CATÁLOGO</Link><Link href="/catalog?sort=newest">VER LANÇAMENTOS</Link></div>
    <div className="penrose-store-empty-suggestions">{suggestions.map((product) => <Link href={`/product/${product.id}`} key={product.id}><img src={product.images[0]} alt={product.name} /><span>{product.name === 'Batman (Simples)' ? 'BATMAN ARKHAM' : product.name.toUpperCase()}</span></Link>)}</div>
  </section>;
}
