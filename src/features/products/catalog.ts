import data from './catalog-data.json';
import { sizePrices } from './size-prices';

export type CatalogProduct = (typeof data)[number];
export const catalogProducts: CatalogProduct[] = data;

export function productPrice(_product: CatalogProduct) {
  return { cents: sizePrices[0].priceCents, estimated: false };
}

export function findCatalogProduct(id: string) {
  return catalogProducts.find((product) => product.id === id || product.sku.toLowerCase() === id.toLowerCase());
}
