import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'TENDERING - Digitalna forenzička analiza javnih nabavki uz pomoć AI',
  description: 'Za manje od 60 sekundi, besplatno dobijate analizu javne nabavke.',
  alternates: {
    canonical: 'https://www.tendering.me',
  },
  openGraph: {
    title: 'TENDERING - Digitalna forenzička analiza javnih nabavki uz pomoć AI',
    description: 'Za manje od 60 sekundi, besplatno dobijate analizu javne nabavke.',
    url: 'https://www.tendering.me',
    type: 'website',
    images: [
      {
        url: 'https://www.tendering.me/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TENDERING - Forenzička analiza javnih nabavki uz AI',
    description: 'Za manje od 60 sekundi, besplatno dobijate analizu javne nabavke.',
    images: ['https://www.tendering.me/og-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="me">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}

