import type { Product, ProductStatus } from './schemas';

export type ProductSizeView = {
  label?: string;
  name?: string;
  priceCents: number;
  priceBRL: number;
};

export type ProductView = {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  stock: number;
  priceCents: number;   // preço "base" (sem variação)
  priceBRL: number;
  image?: string;       // principal
  images: string[];     // galeria
  tags: string[];
  category?: string | null;
  description?: string | null;

  // extras para UI:
  sizes?: ProductSizeView[]; // variações normalizadas
  prontaEntrega?: boolean;
  discount?: number;   // % opcional
  isNew?: boolean;     // badge opcional
};

export function normalizeProducts(input: Array<Product | any>): ProductView[] {
  return (input ?? []).map((p) => {
    const priceCents = Number(p.priceCents ?? (p.price ? Math.round(Number(p.price) * 100) : 0));
    const priceBRL = priceCents / 100;

    const images: string[] = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    const image = images[0];

    const tags: string[] = Array.isArray(p.tags)
      ? p.tags.filter(Boolean).map((t: string) => t.toLowerCase())
      : [];

    // Normaliza tamanhos, aceitando payloads que venham com price ou priceCents
    const sizes: ProductSizeView[] | undefined = Array.isArray(p.sizes) && p.sizes.length
      ? p.sizes.map((s: any) => {
          const cents = s.priceCents ?? (s.price != null ? Math.round(Number(s.price) * 100) : undefined);
          const sizePriceCents = Number(cents ?? priceCents);
          return {
            label: s.label ?? s.name,
            name: s.name,
            priceCents: sizePriceCents,
            priceBRL: sizePriceCents / 100,
          };
        })
      : undefined;

    const prontaEntrega =
      Boolean(p.prontaEntrega) ||
      Boolean(Array.isArray(p.sizes) && p.sizes.some((s: any) => s?.prontaEntrega));

    const discount: number | undefined =
      typeof p.discount === 'number' ? p.discount : undefined;

    const isNew: boolean | undefined =
      typeof p.isNew === 'boolean' ? p.isNew : undefined;

    return {
      id: String(p.id),
      name: String(p.name ?? ''),
      slug: String(p.slug ?? ''),
      status: p.status,
      stock: Number(p.stock ?? 0),
      priceCents,
      priceBRL,
      image,
      images,
      tags,
      category: p.category ?? null,
      description: p.description ?? null,
      sizes,
      prontaEntrega,
      discount,
      isNew,
    };
  });
}
