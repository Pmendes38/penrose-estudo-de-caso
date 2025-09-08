'use client';

import { ToastProvider, Toaster } from '@/shared/ui/use-toast';
import { CartProvider } from '@/shared/context/CartContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>{children}</CartProvider>
      <Toaster />
    </ToastProvider>
  );
}
