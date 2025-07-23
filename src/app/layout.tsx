import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DeFi Portfolio | Ultra-Modern DeFi Trading Platform',
  description:
    'Professional DeFi portfolio management and trading platform with real-time analytics, AI assistance, and seamless Web3 integration.',
  keywords: [
    'DeFi',
    'portfolio',
    'trading',
    'cryptocurrency',
    'web3',
    'ethereum',
  ],
  authors: [{ name: 'DeFi Portfolio Team' }],
  creator: 'DeFi Portfolio Team',
  publisher: 'DeFi Portfolio',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'DeFi Portfolio | Ultra-Modern DeFi Trading Platform',
    description: 'Professional DeFi portfolio management and trading platform',
    siteName: 'DeFi Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DeFi Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeFi Portfolio | Ultra-Modern DeFi Trading Platform',
    description: 'Professional DeFi portfolio management and trading platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  }),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-950 dark:to-dark-900">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
