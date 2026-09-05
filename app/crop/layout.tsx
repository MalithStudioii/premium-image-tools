import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image Crop Tool - Custom & Social Aspect Ratios',
  description:
    'Crop pictures to any aspect ratio (1:1, 16:9, 4:5, 9:16) or freeform shape. 100% private, instant, and high-resolution cropping in your browser.',
  keywords: [
    'crop image',
    'crop picture online',
    'aspect ratio cropper',
    'instagram square crop',
    'crop photo free',
  ],
  alternates: {
    canonical: '/crop',
  },
  openGraph: {
    title: 'Free Image Crop Tool | Premium Image Tools',
    description:
      'Crop pictures to any aspect ratio or freeform shape directly in your browser.',
    url: '/crop',
  },
};

export default function CropLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
