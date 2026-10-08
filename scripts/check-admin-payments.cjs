const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
let received;
const result = { items: [], total: 0, page: 2, pageSize: 5, pages: 1 };
const context = { exports: {}, require: name => {
  if (name === 'server-only') return {};
  assert.equal(name, '../api');
  return { listPaymentsAdmin: async options => { received = options; return result; } };
} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/features/payments/server/fetch-admin-payments.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
(async () => {
  assert.equal(await context.exports.fetchAdminPayments({ page: 2, pageSize: 5, filters: { orderId: 'demo-order', status: 'PENDING' } }), result);
  assert.equal(JSON.stringify(received), JSON.stringify({ page: 2, pageSize: 5, orderId: 'demo-order', status: 'PENDING' }));
  console.log('ERP payment list delegates to authenticated API with filters intact');
})().catch(error => { console.error(error); process.exitCode = 1; });
