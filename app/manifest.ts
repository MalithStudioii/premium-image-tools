import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Premium Image Tools - Free & 100% Private',
    short_name: 'ImageTools',
    description: 'Free, fast, and 100% private client-side image editor, compressor, cutout, and utilities.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
