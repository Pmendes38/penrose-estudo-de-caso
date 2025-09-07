import { listAdminCoupons } from '@/features/coupons/api/api';
import EditForm from './ui/EditForm';

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const coupons = await listAdminCoupons();
  const coupon = coupons.find(c => c.id === params.id);
  if (!coupon) return <div className="p-6">Cupom não encontrado.</div>;
  return <EditForm coupon={coupon} />;
}
