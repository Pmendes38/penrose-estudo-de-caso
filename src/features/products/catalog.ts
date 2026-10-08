import data from './catalog-data.json';
import { sizePrices } from './size-prices';
import type { Product } from './schemas';

export type CatalogProduct = Product & { sourceCategory?: string };
// Historical order images only. Storefront reads come from catalog.server.ts.
export const catalogProducts = data;

export function productPrice(product: CatalogProduct) {
  return { cents: product.madeToOrder ? sizePrices[0].priceCents : product.priceCents, estimated: false };
}

export function findCatalogProduct(id: string) {
  return catalogProducts.find((product) => product.id === id || product.sku.toLowerCase() === id.toLowerCase());
}
