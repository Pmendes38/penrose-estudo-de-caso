const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/features/orders/schemas.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {}, require };
vm.runInNewContext(code, context);
const input = { id: 'demo', orderNumber: 1, customerId: 'customer', status: 'paid', createdAt: new Date(), updatedAt: new Date(), subtotal: 180000, shippingTotal: 1000, discountTotal: 10000, grandTotal: 171000, items: [{ productId: 'piece', name: 'Piece', quantity: 1, unitPrice: 180000 }] };
const admin = context.exports.AdminOrderSchema.parse(input);
assert.equal(admin.subtotal, 1800);
assert.equal(admin.grandTotal, 1710);
assert.equal(admin.shippingTotal, 10);
assert.equal(admin.discountTotal, 100);
assert.equal(admin.items[0].unitPrice, 1800);
assert.equal(context.exports.OrderSchema.parse(input).grandTotal, 171000);
const customers = { exports: {}, require };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/features/customers/schemas.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, customers);
assert.equal(customers.exports.CustomerSchema.parse({ id: 'customer', name: 'Demo', email: 'demo@example.com', totalOrders: 1, paidOrders: 1, totalSpent: 306000, lastOrder: null, createdAt: null }).totalSpent, 3060);
const formats = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/shared/lib/format.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, formats);
assert.equal(formats.exports.formatCents(306000).replace(/\s/g, ' '), 'R$ 3.060,00');
assert.equal(formats.exports.formatCents(180000).replace(/\s/g, ' '), 'R$ 1.800,00');
for (const file of ['src/app/(public)/orders/[id]/page.tsx', 'src/features/orders/components/OrderSummary.tsx']) {
  const source = fs.readFileSync(file, 'utf8');
  assert(source.includes('formatCents('));
  assert(!source.includes('formatBRL('));
}
console.log('ERP uses BRL; customer order views format authoritative cents once');
