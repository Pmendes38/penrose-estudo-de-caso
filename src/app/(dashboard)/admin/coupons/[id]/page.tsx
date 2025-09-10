import Link from 'next/link';
import { notFound } from 'next/navigation';
import CouponForm from '@/features/coupons/ui/CouponForm';
import { listAdminCoupons } from '@/features/coupons/api';
import { updateCouponAction, deleteCouponAction } from '../actions';

type Params = { params: { id: string } };

export default async function EditCouponPage({ params }: Params) {
  const coupons = await listAdminCoupons().catch(() => []);
  const coupon = coupons.find((c: any) => c.id === params.id);
  if (!coupon) notFound();

  const updateAction = updateCouponAction.bind(null, coupon.id, {});
  const deleteAction = deleteCouponAction.bind(null, coupon.id);

  return (
    <main className="min-h-screen bg-brand-black">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Editar Cupom</h1>
          <Link
            href="/admin/coupons"
            className="px-3 py-2 border border-brand-gray-border rounded-md text-brand-gray-light hover:text-white"
          >
            Voltar
          </Link>
        </div>

        <CouponForm
          defaultValue={coupon}
          action={updateAction}
          submitLabel="Salvar alterações"
          onDeleteAction={deleteAction}
        />
      </div>
    </main>
  );
}
