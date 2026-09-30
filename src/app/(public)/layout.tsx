import AppHeader from '@/shared/ui/AppHeader';
import StorefrontFooter from '@/shared/ui/StorefrontFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="penrose-public-main">{children}</main>
      <StorefrontFooter />
    </>
  );
}
