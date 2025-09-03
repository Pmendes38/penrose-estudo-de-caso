import '../styles/globals.css';
import { CartProvider } from '../context/CartContext.jsx';

export const metadata = {
  title: {
    default: 'Penrøse - Action Figures Exclusivos',
    template: '%s | Penrøse'
  },
  description: 'Action Figures exclusivos e personalizados da Penrøse. Tecnologia 3D + arte manual. Qualidade excepcional para colecionadores exigentes.',
  keywords: ['action figures', 'colecionáveis', 'penrose', 'figuras personalizadas', 'impressão 3D', 'arte colecionável'],
  authors: [{ name: 'Penrøse' }],
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#00A9E0',
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
    'msapplication-config': '/browserconfig.xml'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-brand-black text-white antialiased">
        <CartProvider>
          {children}
        </CartProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                navigator.serviceWorker
                  .register('/sw.js')
                  .then((registration) => {
                    console.log('Service Worker registered successfully:', registration);
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content available, notify user
                            if (window.confirm('Nova versão disponível! Recarregar página?')) {
                              window.location.reload();
                            }
                          }
                        });
                      }
                    });
                  })
                  .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                  });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}