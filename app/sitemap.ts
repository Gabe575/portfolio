import type { MetadataRoute } from 'next';

// Only public pages belong here; /meet is private and excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://gabesantos.ca',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
