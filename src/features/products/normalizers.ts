import type { Product, ProductView } from './schemas';

function toArray(v: unknown): string[] {
  return Array.isArray(v)
    ? v
    : typeof v === 'string'
      ? v.split(/[\s,]+/).filter(Boolean)
      : [];
}

export function normalizeProduct(p: Product | any): ProductView {
  const images = p?.images?.length ? p.images : p?.mainImage ? [p.mainImage] : [];
  return {
    ...p,
    tags: toArray(p?.tags),
    images,
  };
}

export function normalizeProducts(list: Array<Product | any>): ProductView[] {
  return list.map(normalizeProduct);
}
