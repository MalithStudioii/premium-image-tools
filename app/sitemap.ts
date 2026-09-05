import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://premium-image-tools.vercel.app';

  const routes = [
    {
      path: '',
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      path: '/passport-photo',
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      path: '/photo-editor',
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      path: '/compress',
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      path: '/crop',
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      path: '/resize',
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      path: '/blur-sensitive',
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      path: '/color-palette',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/meme-generator',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/about',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      path: '/privacy',
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      path: '/terms',
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  return routes.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
