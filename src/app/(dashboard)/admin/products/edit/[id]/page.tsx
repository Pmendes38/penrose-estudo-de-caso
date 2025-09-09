import { notFound } from 'next/navigation';
import ProductForm from '@/features/products/ui/ProductForm';
import { updateProductAction } from '../../_actions';
import { api } from '@/shared/lib/http';

type ProductDTO = {
  id: string;
  name: string;
  category: string | { name: string };
  price?: number;
  stock?: number;
  status?: 'active' | 'inactive';
  description?: string;
  images?: string[];
  moreImages?: string[];
  tags?: string[];
  active?: boolean;
  inventory?: number;
  sizes?: Array<{ price?: number }>;
  mainImage?: string;
};

async function getProduct(id: string): Promise<ProductDTO | null> {
  try {
    return await api<ProductDTO>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/products/${id}`);
  } catch {
    return null;
  }
}

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return notFound();

  const action = updateProductAction.bind(null, params.id);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-brand-gray-light">Editar Produto</h2>
        <p className="mt-1 text-sm text-brand-gray">Atualize as informações do produto.</p>
      </header>

      <div className="bg-brand-gray-dark rounded-lg border border-brand-gray-border p-6">
        <ProductForm
          initialData={product}
          onUpdateAction={action}
          onCancelHref="/admin/products"
        />
      </div>
    </div>
  );
}
