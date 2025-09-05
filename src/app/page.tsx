import { Suspense } from 'react';
import { fetchPublicProducts } from '@/features/products/api';
import LandingHero from '@/features/landing/ui/LandingHero';
import LandingReady from '@/features/landing/ui/LandingReady';
import LandingCatalog from '@/features/landing/ui/LandingCatalog';
import LandingContact from '@/features/landing/ui/LandingContact';

export const revalidate = 60; 

export default async function HomePage() {
  const products = await fetchPublicProducts(); 

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
