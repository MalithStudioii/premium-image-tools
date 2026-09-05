import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Color Palette Generator - Extract HEX & RGB',
  description:
    'Extract beautiful color palettes, dominant shades, and HEX/RGB codes from any photo or design instantly. Export palettes easily.',
  keywords: [
    'color palette generator',
    'extract colors from image',
    'image color picker',
    'get hex codes from photo',
    'dominant color finder',
  ],
  alternates: {
    canonical: '/color-palette',
  },
  openGraph: {
    title: 'Image Color Palette Generator | Premium Image Tools',
    description:
      'Extract beautiful color palettes, dominant shades, and HEX/RGB codes from any photo or design instantly.',
    url: '/color-palette',
  },
};

export default function ColorPaletteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
