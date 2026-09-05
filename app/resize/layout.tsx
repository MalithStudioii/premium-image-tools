import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image Resizer - Dimensions & Percentage Scaling',
  description:
    'Resize photos and pictures by exact width and height or percentage scale while keeping aspect ratio. Fast, sharp, and client-side.',
  keywords: [
    'resize image online',
    'image resizer free',
    'scale photo',
    'change picture dimensions',
    'resize pixels',
  ],
  alternates: {
    canonical: '/resize',
  },
  openGraph: {
    title: 'Free Image Resizer | Premium Image Tools',
    description:
      'Resize photos and pictures by exact width/height or percentage scaling directly in your browser.',
    url: '/resize',
  },
};

export default function ResizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
