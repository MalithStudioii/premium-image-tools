import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Studio & AI Background Remover',
  description:
    'Free online photo studio with AI cutout, custom backgrounds, Pro Tune adjustments, filters, and social media canvas presets. 100% private in-browser processing.',
  keywords: [
    'photo editor online',
    'ai background remover',
    'cutout tool',
    'remove background free',
    'photo filters',
    'custom background replacement',
    'social media image canvas',
  ],
  alternates: {
    canonical: '/photo-editor',
  },
  openGraph: {
    title: 'Photo Studio & AI Background Remover | Premium Image Tools',
    description:
      'Free online photo studio with AI cutout, custom backgrounds, Pro Tune adjustments, and social media presets.',
    url: '/photo-editor',
  },
};

export default function PhotoEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
