import ProductForm from '@/features/products/ui/ProductForm';
import { createProductAction } from './actions';

export default function NovoProdutoPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-brand-gray-light">Novo Produto</h2>
        <p className="mt-1 text-sm text-brand-gray">Cadastre um novo produto no catálogo.</p>
      </header>

      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6">
        <ProductForm
          onCreateAction={createProductAction}
          onCancelHref="/admin/products"
        />
      </div>
    </div>
  );
}
