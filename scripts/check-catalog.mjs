import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const products = JSON.parse(readFileSync(new URL('../src/features/products/catalog-data.json', import.meta.url)));
assert.equal(products.length, 132);
assert.equal(new Set(products.map((product) => product.sku)).size, products.length);
for (const product of products) {
  assert.ok(product.name && product.id && product.sku);
  for (const image of product.images) assert.ok(existsSync(path.join('public', image)), `${product.sku}: ${image}`);
  for (const variant of product.variants) assert.ok(variant.name && variant.sku);
}
console.log(`Validated ${products.length} products and ${products.reduce((total, product) => total + product.images.length, 0)} image references.`);
