import 'server-only';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Logo } from '@/shared/ui/Logo';
import { getUserRole } from '@/features/auth/server/cookies';
import dynamic from 'next/dynamic';

const CartHeaderButton = dynamic(
  () => import('@/features/cart/ui/CartHeaderButton'),
  { ssr: false } // opcional; pode ser true também
);

export default function AppHeader() {
  const jar = cookies();
  const hasToken = !!jar.get('accessToken')?.value;
  const role = getUserRole(); // 'admin' | 'customer' | null

  return (
    <header className="sticky top-0 z-40 bg-brand-gray-dark border-b border-brand-gray-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-auto" />
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/catalog" className="text-brand-gray-light hover:text-white">
            Ver Catálogo
          </Link>

          {/* botão do carrinho aparece somente após login */}
          {hasToken && <CartHeaderButton visible={true} />}

          {hasToken && role === 'customer' && (
            <Link href="/customer" className="text-brand-gray-light hover:text-white">
              ⚙️ Configurações
            </Link>
          )}

          {hasToken ? (
            <Link href="/logout" className="text-red-400 hover:text-red-300">
              Sair
            </Link>
          ) : (
            <Link href="/login" className="text-brand-blue hover:text-blue-400">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
