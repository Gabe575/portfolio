import type { Metadata } from 'next';
import { Figtree, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Navbar from '@components/navbar';
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
  description: "Gabriel Santos' portfolio showcasing projects, design, and web development skills.",
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
      "Gabriel Santos' portfolio showcasing projects, design, and web development skills.",
    url: 'https://www.gabesantos.ca',
    siteName: 'Gabriel Santos Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 512,
        height: 512,
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
        <ThemeProvider attribute="class" enableSystem defaultTheme="system">
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
