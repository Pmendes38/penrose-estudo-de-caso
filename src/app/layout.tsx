import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import Providers from './providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Penrøse - Action Figures Exclusivos',
    template: '%s | Penrøse',
  },
  description:
    'Action Figures exclusivos e personalizados da Penrøse. Tecnologia 3D + arte manual. Qualidade excepcional para colecionadores exigentes.',
  keywords: [
    'action figures',
    'colecionáveis',
    'penrose',
    'figuras personalizadas',
    'impressão 3D',
    'arte colecionável',
  ],
  authors: [{ name: 'Penrøse' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Penrøse',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#010a12',
    'msapplication-config': '/browserconfig.xml',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#00A9E0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-brand-black text-white antialiased">
        <Providers>{children}</Providers>

        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
              navigator.serviceWorker.register('/sw.js').then((reg) => {
                reg.addEventListener('updatefound', () => {
                  const nw = reg.installing;
                  if (!nw) return;
                  nw.addEventListener('statechange', () => {
                    if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                      if (confirm('Nova versão disponível! Recarregar página?')) location.reload();
                    }
                  });
                });
              }).catch((err) => console.error('SW registration failed:', err));
            }
          `}
        </Script>
      </body>
    </html>
  );
}
