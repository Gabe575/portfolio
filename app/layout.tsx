import type { Metadata } from 'next';
import { Figtree, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import UIProvider from '@components/ui-provider';
import '@/globals.css';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Gabriel Santos',
  description:
    'Software engineer specializing in developing and maintaining full-stack web applications with modern technologies. Explore projects, skills, and solutions.',
  keywords: [
    'Gabriel Santos',
    'Software Engineer',
    'Frontend Developer',
    'Full Stack Developer',
    'Web Developer',
    'Portfolio',
  ],
  openGraph: {
    type: 'website',
    title: 'Gabriel Santos',
    description:
      'Software engineer specializing in developing and maintaining full-stack web applications with modern technologies. Explore projects, skills, and solutions.',
    url: 'https://www.gabesantos.ca',
    siteName: 'Gabriel Santos Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gabriel Santos Portfolio',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${figtree.variable} ${spaceGrotesk.variable} antialiased transition-colors duration-300`}
      >
        <UIProvider>{children}</UIProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
