import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Online Meme Generator - Create & Custom Memes',
  description:
    'Create viral memes fast with custom captions, stylish fonts, stickers, and outlines. 100% free and client-side with instant export.',
  keywords: [
    'meme generator',
    'create memes online',
    'free meme maker',
    'funny meme creator',
    'caption image online',
  ],
  alternates: {
    canonical: '/meme-generator',
  },
  openGraph: {
    title: 'Free Online Meme Generator | Premium Image Tools',
    description:
      'Create viral memes fast with custom captions, fonts, and instant export.',
    url: '/meme-generator',
  },
};

export default function MemeGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
