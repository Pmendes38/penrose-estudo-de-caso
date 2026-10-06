import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterProducts, productMetrics } from './catalog.ts';

const products = [
  { id: '1', name: 'Gaara', sku: 'NAR-01', category: 'Anime', priceCents: 10000, stock: 3, status: 'active', images: [], createdAt: '2026-10-02' },
  { id: '2', name: 'Venom', sku: 'MAR-01', category: 'Marvel', priceCents: 20000, stock: 0, madeToOrder: true, status: 'active', images: [] },
  { id: '3', name: 'Batman', sku: 'DC-01', category: 'DC', priceCents: 15000, stock: 0, status: 'inactive', images: [] },
];

test('busca SKU e filtra sem tratar produção sob encomenda como esgotada', () => {
  assert.equal(filterProducts(products, { q: 'nar-01', category: '', status: '', stock: '' }).length, 1);
  assert.deepEqual(filterProducts(products, { q: '', category: '', status: '', stock: 'out' }).map(p => p.id), ['3']);
  assert.deepEqual(filterProducts(products, { q: '', category: 'Marvel', status: 'active', stock: 'available' }).map(p => p.id), ['2']);
});

test('indicadores usam dados reais e excluem peças sob encomenda do estoque físico', () => {
  assert.deepEqual(productMetrics(products, new Date('2026-10-06')), {
    active: 2, addedThisMonth: 1, stock: 3, inventoryCents: 30000, low: 1, out: 1,
  });
});
