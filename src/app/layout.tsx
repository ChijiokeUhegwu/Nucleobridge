import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Nucleobridge: Hands-on Interactive Bioinformatics Learning Platform',
    template: '%s | Nucleobridge',
  },
  description: 'Nucleobridge: Hands-on Interactive Bioinformatics Learning Platform',
  openGraph: {
    title: 'Nucleobridge',
    description: 'Nucleobridge: Hands-on Interactive Bioinformatics Learning Platform',
    siteName: 'Nucleobridge',
  },
  icons: {
    icon: [{ url: '/nucleobridge_favicon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

