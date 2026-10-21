import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/meet', '/api'],
    },
    sitemap: 'https://gabesantos.ca/sitemap.xml',
  };
}
