import { fetchPublicProducts } from '@/features/products/api';
import LandingHero from '@/features/landing/ui/LandingHero';
import LandingReady from '@/features/landing/ui/LandingReady';
import LandingCatalog from '@/features/landing/ui/LandingCatalog';
import LandingContact from '@/features/landing/ui/LandingContact';

export const revalidate = 60;

export default async function HomePage() {
  const products = await fetchPublicProducts({ page: 1, pageSize: 24, sortBy: 'createdAt', sortDir: 'desc' });

  return (
    <main>
      <LandingHero />
      <LandingReady products={products} />
      <LandingCatalog products={products} />
      <LandingContact />
    </main>
  );
}
