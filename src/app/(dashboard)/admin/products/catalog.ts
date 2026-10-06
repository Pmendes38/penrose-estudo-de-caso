export type AdminProduct = {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  description?: string | null;
  priceCents: number;
  stock?: number;
  madeToOrder?: boolean;
  status: 'active' | 'inactive';
  images: string[];
  createdAt?: string | null;
};

export type ProductFilters = { q: string; category: string; status: string; stock: string };

export function filterProducts(products: AdminProduct[], filters: ProductFilters) {
  const q = filters.q.trim().toLocaleLowerCase('pt-BR');
  return products.filter(product => {
    if (q && !`${product.name} ${product.sku ?? ''}`.toLocaleLowerCase('pt-BR').includes(q)) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.status && product.status !== filters.status) return false;
    if (filters.stock === 'low' && (product.madeToOrder || !product.stock || product.stock > 5)) return false;
    if (filters.stock === 'out' && (product.madeToOrder || (product.stock ?? 0) > 0)) return false;
    if (filters.stock === 'available' && !product.madeToOrder && (product.stock ?? 0) === 0) return false;
    return true;
  });
}

export function productMetrics(products: AdminProduct[], now = new Date()) {
  const physical = products.filter(product => !product.madeToOrder);
  const month = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' });
  return {
    active: products.filter(product => product.status === 'active').length,
    addedThisMonth: products.filter(product => product.createdAt && month.format(new Date(product.createdAt)) === month.format(now)).length,
    stock: physical.reduce((sum, product) => sum + (product.stock ?? 0), 0),
    inventoryCents: physical.reduce((sum, product) => sum + (product.stock ?? 0) * product.priceCents, 0),
    low: physical.filter(product => (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5).length,
    out: physical.filter(product => (product.stock ?? 0) === 0).length,
  };
}
