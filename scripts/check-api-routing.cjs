const assert = require('node:assert/strict');
require('../next.config.js').rewrites().then(routes => {
  assert.equal(Array.isArray(routes), false, 'Generic proxy must not override authenticated dynamic API routes');
  assert.equal(routes.fallback[0].source, '/api/:path*');
  console.log('Authenticated API routes precede the fallback proxy');
});
