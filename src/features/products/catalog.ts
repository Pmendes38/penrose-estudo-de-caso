import data from './catalog-data.json';

export type CatalogProduct = (typeof data)[number];
export const catalogProducts: CatalogProduct[] = data;

export const estimatedBasePriceCents = 54990; // Median of the three priced parent products in the supplied sheet.

export function productPrice(product: CatalogProduct) {
  const variantPrices = product.variants.map((variant) => variant.priceCents).filter((price): price is number => price !== null);
  const known = product.salePriceCents ?? product.regularPriceCents ?? (variantPrices.length ? Math.min(...variantPrices) : null);
  return { cents: known ?? estimatedBasePriceCents, estimated: known === null };
}

export function findCatalogProduct(id: string) {
  return catalogProducts.find((product) => product.id === id || product.sku.toLowerCase() === id.toLowerCase());
}
