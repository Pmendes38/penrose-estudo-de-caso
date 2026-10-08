import 'server-only';
import { cache } from 'react';
import { fetchPublicProducts } from './api';
import type { CatalogProduct } from './catalog';

export const getStorefrontProducts = cache(async (): Promise<CatalogProduct[]> => {
  const first = await fetchPublicProducts({ page: 1, pageSize: 100, sortBy: 'name', sortDir: 'asc' });
  const rest = await Promise.all(Array.from({ length: first.pages - 1 }, (_, i) =>
    fetchPublicProducts({ page: i + 2, pageSize: 100, sortBy: 'name', sortDir: 'asc' })));
  return [first, ...rest].flatMap(page => page.items).filter(product => product.status === 'active');
});
