// app/page.tsx
import { Suspense } from 'react';
import { fetchPublicProducts } from '@/lib/http';
import LandingHero from '@/src/features/landing/ui/LandingHero';
import LandingReady from '@/src/features/landing/ui/LandingReady';
import LandingCatalog from '@/src/features/landing/ui/LandingCatalog';
import LandingContact from '@/src/features/landing/ui/LandingContact';

export const revalidate = 60; // cache do catálogo por 60s (ajuste conforme necessidade)

export default async function HomePage() {
  const products = await fetchPublicProducts(); // SSR: menos JS no cliente e melhor SEO

  return (
    <main>
      <LandingHero />
      <Suspense fallback={<div className="p-12 text-brand-gray-light">Carregando destaques…</div>}>
        <LandingReady products={products} />
      </Suspense>
      <LandingCatalog products={products} />
      <LandingContact />
    </main>
  );
}
