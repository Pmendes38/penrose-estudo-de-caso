import AppHeader from '@/shared/ui/AppHeader';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}
