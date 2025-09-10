import Link from 'next/link';
import CouponForm from '@/features/coupons/ui/CouponForm';
import { createCouponAction } from '../actions';

export default function NewCouponPage() {
  const action = createCouponAction.bind(null, {}); // (formData) => Promise<...>

  return (
    <main className="min-h-screen bg-brand-black">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Novo Cupom</h1>
          <Link
            href="/admin/coupons"
            className="px-3 py-2 border border-brand-gray-border rounded-md text-brand-gray-light hover:text-white"
          >
            Voltar
          </Link>
        </div>

        {/* CouponForm é Client; ele renderiza <form action={action}> */}
        <CouponForm action={action} submitLabel="Criar" />
      </div>
    </main>
  );
}
