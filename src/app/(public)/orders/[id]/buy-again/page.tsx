import Link from 'next/link';
import { requireCustomerOrRedirect } from '@/features/auth/server/guards';
import { fetchOrderMine } from '@/features/orders/server/fetch-order';
import { catalogProducts, findCatalogProduct } from '@/features/products/catalog';
import { fetchPublicProducts } from '@/features/products/api';
import BuyAgainForm from './form';

export default async function BuyAgainPage({ params }: { params: { id: string } }) {
  requireCustomerOrRedirect();
  const order = await fetchOrderMine(params.id).catch(() => null);
  if (!order) return <section className="penrose-repeat-page"><div className="penrose-repeat-empty"><h1>Pedido não encontrado</h1><Link href="/customer#pedidos">VOLTAR AOS PEDIDOS</Link></div></section>;

  const currentProducts = await fetchPublicProducts({ pageSize: 1000 }).then((page) => page.items).catch(() => []);

  const items = (order.items ?? []).map((item, index) => {
    const product = findCatalogProduct(item.productId) ?? catalogProducts.find((entry) => entry.name.toLowerCase() === item.name.toLowerCase());
    const current = currentProducts.find((entry) => entry.id === item.productId || Boolean(product?.sku && entry.sku?.toUpperCase() === product.sku.toUpperCase()));
    return { id: `${item.productId}-${index}`, name: item.name, sku: current?.sku ?? null, image: product?.images[0] ?? current?.images[0] ?? null, category: product?.sourceCategory ?? current?.category ?? null, size: item.size ?? null, quantity: item.quantity, priceCents: current?.priceCents ?? 0, previousPriceCents: item.unitPrice, stock: current?.stock ?? 0, available: Boolean(current?.sku && current.stock > 0 && current.priceCents > 0) };
  });

  return <section className="penrose-repeat-page"><header className="penrose-order-intro"><h1>COMPRAR NOVAMENTE</h1><p>Pedido #{order.orderNumber}. Confirme disponibilidade, tamanhos e quantidades.</p></header><BuyAgainForm items={items} /></section>;
}
