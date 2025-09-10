import { cookies } from 'next/headers';
import { getCart } from '@/features/cart/api';
import CartPageClient from '@/features/cart/ui/CartPageClient';

export const dynamic = 'force-dynamic'; 

export default async function CartPage() {
  const cookieHeader = cookies().toString();
  let cart = null;
  try {
    cart = await getCart({ createIfMissing: true });
  } catch {
  }
  return <CartPageClient initialCart={cart ?? undefined} />;
}
