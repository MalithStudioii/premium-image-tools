import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image Compressor - Compress JPG, PNG & WebP',
  description:
    'Compress JPG, PNG, and WebP images directly in your browser with zero server uploads. Reduce file size drastically while preserving crystal-clear visual quality.',
  keywords: [
    'compress image online',
    'free image compressor',
    'reduce image size',
    'compress jpeg',
    'png compressor',
    'webp compression',
    'browser image optimizer',
  ],
  alternates: {
    canonical: '/compress',
  },
  openGraph: {
    title: 'Free Image Compressor | Premium Image Tools',
    description:
      'Compress JPG, PNG, and WebP images directly in your browser with zero server uploads.',
    url: '/compress',
  },
};

export default function CompressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
