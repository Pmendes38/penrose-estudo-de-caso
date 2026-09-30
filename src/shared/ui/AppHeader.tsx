import 'server-only';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Logo } from '@/shared/ui/Logo';
import { getMe } from '@/features/users/api';

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>;
}

function BagIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>;
}

export default async function AppHeader({ home = false }: { home?: boolean }) {
  const hasToken = Boolean(cookies().get('accessToken')?.value);
  const profile = hasToken ? await getMe().catch(() => null) : null;
  const initial = profile?.name?.trim().charAt(0).toUpperCase() || 'P';

  return (
    <header className={`penrose-header penrose-public-header${home ? ' penrose-home-header' : ''}`}>
      <Link href="/" aria-label="Página inicial"><Logo className="h-7 w-auto md:h-9" /></Link>
      {!home && (
        <nav className="penrose-nav" aria-label="Navegação principal">
          <Link href="/catalog">Catálogo</Link><Link href="/customer">Pedidos</Link><Link href="/#sobre">Sobre Nós</Link>
        </nav>
      )}
      <div className="penrose-header-actions">
        <Link href="/catalog" aria-label="Pesquisar" className="penrose-header-icon"><SearchIcon /></Link>
        <Link href="/cart" aria-label="Carrinho" className="penrose-header-icon"><BagIcon /></Link>
        {profile ? (
          <Link href="/customer" className="penrose-account-link" aria-label={`Abrir perfil de ${profile.name || 'cliente'}`}>
            <span
              className={`penrose-avatar${profile.avatarUrl ? ' has-image' : ''}`}
              style={profile.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})` } : undefined}
              aria-hidden="true"
            >
              {!profile.avatarUrl && initial}
            </span>
          </Link>
        ) : (
          <span className="penrose-auth-links">
            <Link href="/login">Login</Link>
            <span aria-hidden="true">/</span>
            <Link href="/register">Registrar</Link>
          </span>
        )}
      </div>
    </header>
  );
}
